/**
 * Custom feeds hydration race protection test
 *
 * This test uses CommonJS require() to avoid Jest ESM config needs.
 */
const { useUnifiedStore } = require('../../web/lib/unifiedStore');

// Helper to access and mutate store internals (Zustand public API)
const getStore = () => useUnifiedStore.getState();
const setStore = (partial) => useUnifiedStore.setState(partial, false, 'test-set');

describe('Custom feeds hydration race protection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setStore({
      customFeeds: {
        starter: [
          { id: 'A', brand: 'Alpha', name: 'Starter A', category: 'starter', protein: 20, estimatedPrice: { '25kg': 10000 }, isCustom: true },
          { id: 'B', brand: 'Bravo', name: 'Starter B', category: 'starter', protein: 21, estimatedPrice: { '25kg': 11000 }, isCustom: true }
        ],
        grower: []
      },
      _recentlyDeleted: {}
    });

    const mockStrategy = {
      list: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    setStore({
      _getPersistenceStrategy: () => mockStrategy,
      __mockStrategy: mockStrategy
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('delete does not resurrect on immediate hydration with stale backend (tombstone filter + debounce)', async () => {
    const state = getStore();
    const strategy = state.__mockStrategy;

    strategy.list.mockResolvedValueOnce([
      { id: 'A', brand: 'Alpha', name: 'Starter A', category: 'starter', protein: 20, estimatedPrice: { '25kg': 10000 }, isCustom: true },
      { id: 'B', brand: 'Bravo', name: 'Starter B', category: 'starter', protein: 21, estimatedPrice: { '25kg': 11000 }, isCustom: true }
    ]);
    strategy.delete.mockResolvedValueOnce(true);

    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A', 'B']);

    await state.deleteCustomFeed('starter', 'B');
    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);

    jest.advanceTimersByTime(200);
    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);

    jest.advanceTimersByTime(250); // total > 400ms debounce
    await Promise.resolve();

    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);
  });

  test('after TTL, hydration reflects backend if backend truly removed the item', async () => {
    const state = getStore();
    const strategy = state.__mockStrategy;

    strategy.list.mockResolvedValueOnce([
      { id: 'A', brand: 'Alpha', name: 'Starter A', category: 'starter', protein: 20, estimatedPrice: { '25kg': 10000 }, isCustom: true },
      { id: 'B', brand: 'Bravo', name: 'Starter B', category: 'starter', protein: 21, estimatedPrice: { '25kg': 11000 }, isCustom: true }
    ]);
    strategy.delete.mockResolvedValueOnce(true);

    await state.deleteCustomFeed('starter', 'B');
    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);

    jest.advanceTimersByTime(450);
    await Promise.resolve();
    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);

    strategy.list.mockResolvedValueOnce([
      { id: 'A', brand: 'Alpha', name: 'Starter A', category: 'starter', protein: 20, estimatedPrice: { '25kg': 10000 }, isCustom: true }
    ]);

    jest.advanceTimersByTime(2000);
    await state.loadCustomFeeds();

    expect(getStore().customFeeds.starter.map(f => f.id)).toEqual(['A']);
  });

  test('update is stable with immediate hydration (no duplication or resurrection)', async () => {
    const state = getStore();
    const strategy = state.__mockStrategy;

    strategy.update.mockResolvedValueOnce(true);
    strategy.list.mockResolvedValueOnce([
      { id: 'A', brand: 'Alpha', name: 'Starter A+', category: 'starter', protein: 22, estimatedPrice: { '25kg': 12000 }, isCustom: true },
      { id: 'B', brand: 'Bravo', name: 'Starter B', category: 'starter', protein: 21, estimatedPrice: { '25kg': 11000 }, isCustom: true }
    ]);

    await state.updateCustomFeed('starter', 'A', { name: 'Starter A+', protein: 22, estimatedPrice: 12000 });

    const nowList = getStore().customFeeds.starter;
    const a = nowList.find(f => f.id === 'A');
    expect(a.name).toBe('Starter A+');
    expect(a.protein).toBe(22);
    expect(a.estimatedPrice['25kg']).toBe(12000);

    await Promise.resolve();
    const afterList = getStore().customFeeds.starter;
    const a2 = afterList.find(f => f.id === 'A');
    expect(a2.name).toBe('Starter A+');
    expect(a2.protein).toBe(22);
    expect(a2.estimatedPrice['25kg']).toBe(12000);
  });
});
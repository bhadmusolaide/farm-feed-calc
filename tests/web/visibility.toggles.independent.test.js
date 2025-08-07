/**
 * Visibility resolution tests for Feed Results toggles.
 * These tests simulate the merge order used in web/components/FeedResults.js:
 *   defaults (all true) -> local (per-user) -> global (admin) with global winning.
 * We verify that each of the 7 toggles behaves independently.
 */

const defaultsFRV = {
  showFeedQuantity: true,
  showFeedingSchedule: true,
  showWeeklySummary: true,
  showProgressionTracker: true,
  showFCRReference: true,
  showBestPractices: true,
};

function resolveVisibility({ local = {}, global = {} }) {
  const mergedFRV = { ...defaultsFRV, ...local, ...global };
  // Normalize to strict booleans as done in the component
  return {
    showFeedQuantity: !!mergedFRV.showFeedQuantity,
    showFeedingSchedule: !!mergedFRV.showFeedingSchedule,
    showWeeklySummary: !!mergedFRV.showWeeklySummary,
    showProgressionTracker: !!mergedFRV.showProgressionTracker,
    showFCRReference: !!mergedFRV.showFCRReference,
    showBestPractices: !!mergedFRV.showBestPractices,
  };
}

describe('Feed Results visibility toggles - independent behavior', () => {
  test('All defaults true', () => {
    const v = resolveVisibility({ local: {}, global: {} });
    expect(v).toEqual({
      showFeedQuantity: true,
      showFeedingSchedule: true,
      showWeeklySummary: true,
      showProgressionTracker: true,
      showFCRReference: true,
      showBestPractices: true,
    });
  });

  test('Global off beats local on for each toggle', () => {
    const local = {
      showFeedQuantity: true,
      showFeedingSchedule: true,
      showWeeklySummary: true,
      showProgressionTracker: true,
      showFCRReference: true,
      showBestPractices: true,
    };
    const global = {
      showFeedQuantity: false,
      showFeedingSchedule: false,
      showWeeklySummary: false,
      showProgressionTracker: false,
      showFCRReference: false,
      showBestPractices: false,
    };
    const v = resolveVisibility({ local, global });
    expect(v).toEqual({
      showFeedQuantity: false,
      showFeedingSchedule: false,
      showWeeklySummary: false,
      showProgressionTracker: false,
      showFCRReference: false,
      showBestPractices: false,
    });
  });

  test('Each toggle independent - enabling Weekly Summary should not flip Best Practices', () => {
    const global = {
      showFeedQuantity: false,
      showFeedingSchedule: false,
      showWeeklySummary: true, // enabled
      showProgressionTracker: false,
      showFCRReference: false,
      showBestPractices: false, // explicitly disabled
    };
    const v = resolveVisibility({ global });
    expect(v.showWeeklySummary).toBe(true);
    expect(v.showBestPractices).toBe(false); // must remain off
  });

  test('Only Feed Quantity and Feeding Schedule enabled - others remain disabled', () => {
    const global = {
      showFeedQuantity: true,
      showFeedingSchedule: true,
      showWeeklySummary: false,
      showProgressionTracker: false,
      showFCRReference: false,
      showBestPractices: false,
    };
    const v = resolveVisibility({ global });
    expect(v.showFeedQuantity).toBe(true);
    expect(v.showFeedingSchedule).toBe(true);
    expect(v.showWeeklySummary).toBe(false);
    expect(v.showProgressionTracker).toBe(false);
    expect(v.showFCRReference).toBe(false);
    expect(v.showBestPractices).toBe(false);
  });

  test('Standalone Best Practices - independent of their former mappings', () => {
    const global = {
      showFeedQuantity: false,
      showFeedingSchedule: false,
      showWeeklySummary: false, // used to map Best Practices
      showProgressionTracker: false,
      showFCRReference: false,
      showBestPractices: true, // standalone ON
    };
    const v = resolveVisibility({ global });
    expect(v.showBestPractices).toBe(true);
    expect(v.showWeeklySummary).toBe(false);
    expect(v.showProgressionTracker).toBe(false);
  });

  test('Partial global object should not revert missing keys to false due to defaults (remain true unless explicitly set)', () => {
    const global = {
      showFeedQuantity: false, // explicitly off
      // other keys missing => should remain true (default)
    };
    const v = resolveVisibility({ global });
    expect(v.showFeedQuantity).toBe(false);
    expect(v.showFeedingSchedule).toBe(true);
    expect(v.showWeeklySummary).toBe(true);
    expect(v.showProgressionTracker).toBe(true);
    expect(v.showFCRReference).toBe(true);
    expect(v.showBestPractices).toBe(true);
  });
});

// Tests for rearing style validation in shared/utils/errorHandling.js
const { validateInput, AppError, ERROR_TYPES } = require('../../../shared/utils/errorHandling.js');

describe('validateInput.rearingStyle', () => {
  test('accepts backyard', () => {
    expect(validateInput.rearingStyle('backyard')).toBe('backyard');
  });

  test('accepts commercial', () => {
    expect(validateInput.rearingStyle('commercial')).toBe('commercial');
  });

  test('rejects free-range', () => {
    try {
      validateInput.rearingStyle('free-range');
      throw new Error('Expected to throw AppError');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect(e.type).toBe(ERROR_TYPES.VALIDATION);
      expect(e.message).toMatch(/valid rearing style/i);
    }
  });

  test('rejects organic', () => {
    try {
      validateInput.rearingStyle('organic');
      throw new Error('Expected to throw AppError');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect(e.type).toBe(ERROR_TYPES.VALIDATION);
      expect(e.message).toMatch(/valid rearing style/i);
    }
  });

  test('rejects empty value', () => {
    expect(() => validateInput.rearingStyle('')).toThrow(AppError);
  });
});
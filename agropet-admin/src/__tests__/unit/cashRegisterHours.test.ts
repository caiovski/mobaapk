import { isHoliday } from '../../utils/shopHours';
import {
  isCashRegisterAccessible,
  canOpenCashRegister,
  canCloseCashRegister,
  getClosingStartToday,
  isWithinOpeningWindow,
  getAutoCloseTime,
} from '../../utils/cashRegisterHours';

jest.mock('../../utils/shopHours', () => ({
  isHoliday: jest.fn(),
}));

const mockIsHoliday = isHoliday as jest.Mock;

describe('cashRegisterHours', () => {
  beforeEach(() => {
    mockIsHoliday.mockReturnValue(false);
  });

  describe('isCashRegisterAccessible', () => {
    it('returns true for Monday (day 1)', () => {
      expect(isCashRegisterAccessible(new Date(2025, 5, 9))).toBe(true);
    });

    it('returns false for Sunday (day 0)', () => {
      expect(isCashRegisterAccessible(new Date(2025, 5, 8))).toBe(false);
    });

    it('uses current date when none provided', () => {
      expect(typeof isCashRegisterAccessible()).toBe('boolean');
    });
  });

  describe('canOpenCashRegister', () => {
    it('uses current date when called without argument', () => {
      expect(typeof canOpenCashRegister()).toBe('boolean');
    });

    it('returns false on Sunday', () => {
      expect(canOpenCashRegister(new Date(2025, 5, 8, 8, 0))).toBe(false);
    });

    it('returns true at 7:30 on weekday', () => {
      expect(canOpenCashRegister(new Date(2025, 5, 9, 7, 30))).toBe(true);
    });

    it('returns false at 7:29 on weekday', () => {
      expect(canOpenCashRegister(new Date(2025, 5, 9, 7, 29))).toBe(false);
    });

    it('returns false at 11:30 on weekday (end boundary)', () => {
      expect(canOpenCashRegister(new Date(2025, 5, 9, 11, 30))).toBe(false);
    });

    it('returns true at 11:29 on weekday', () => {
      expect(canOpenCashRegister(new Date(2025, 5, 9, 11, 29))).toBe(true);
    });
  });

  describe('canCloseCashRegister', () => {
    it('uses current date when called without argument', () => {
      expect(typeof canCloseCashRegister()).toBe('boolean');
    });

    it('returns false on Sunday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 8, 16, 0))).toBe(false);
    });

    it('returns true at 16:00 on weekday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 9, 16, 0))).toBe(true);
    });

    it('returns true at 23:59 on weekday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 9, 23, 59))).toBe(true);
    });

    it('returns false at 15:59 on weekday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 9, 15, 59))).toBe(false);
    });

    it('returns true at 12:00 on Saturday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 7, 12, 0))).toBe(true);
    });

    it('returns false at 11:59 on Saturday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 7, 11, 59))).toBe(false);
    });

    it('returns true at 23:59 on Saturday', () => {
      expect(canCloseCashRegister(new Date(2025, 5, 7, 23, 59))).toBe(true);
    });

    it('returns true on holiday using isHoliday()', () => {
      mockIsHoliday.mockReturnValue(true);
      expect(canCloseCashRegister(new Date(2025, 5, 9, 12, 0))).toBe(true);
    });
  });

  describe('getClosingStartToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns 960 (16:00) for weekday', () => {
      jest.setSystemTime(new Date(2025, 5, 9, 15, 0));
      expect(getClosingStartToday()).toBe(960);
    });

    it('returns 720 (12:00) for Saturday', () => {
      jest.setSystemTime(new Date(2025, 5, 7, 15, 0));
      expect(getClosingStartToday()).toBe(720);
    });

    it('returns 720 (12:00) for holiday', () => {
      mockIsHoliday.mockReturnValue(true);
      jest.setSystemTime(new Date(2025, 5, 9, 15, 0));
      expect(getClosingStartToday()).toBe(720);
    });
  });

  describe('isWithinOpeningWindow', () => {
    it('uses current date when called without argument', () => {
      expect(typeof isWithinOpeningWindow()).toBe('boolean');
    });

    it('returns true at 7:30 on weekday', () => {
      expect(isWithinOpeningWindow(new Date(2025, 5, 9, 7, 30))).toBe(true);
    });

    it('returns false at 7:29', () => {
      expect(isWithinOpeningWindow(new Date(2025, 5, 9, 7, 29))).toBe(false);
    });

    it('returns false at 11:30 (end boundary)', () => {
      expect(isWithinOpeningWindow(new Date(2025, 5, 9, 11, 30))).toBe(false);
    });

    it('returns true at 11:29', () => {
      expect(isWithinOpeningWindow(new Date(2025, 5, 9, 11, 29))).toBe(true);
    });
  });

  describe('getAutoCloseTime', () => {
    it('returns 1439 (23:59) for weekday', () => {
      expect(getAutoCloseTime(new Date(2025, 5, 9))).toBe(1439);
    });

    it('returns 839 (13:59) for Saturday', () => {
      expect(getAutoCloseTime(new Date(2025, 5, 7))).toBe(839);
    });

    it('returns 839 (13:59) for holiday', () => {
      mockIsHoliday.mockReturnValue(true);
      expect(getAutoCloseTime(new Date(2025, 5, 9))).toBe(839);
    });
  });
});

import { isHoliday } from './shopHours';

const OPENING_START = 7 * 60 + 30;
const OPENING_END = 11 * 60 + 30;

const CLOSE_WEEKDAY_START = 16 * 60;
const CLOSE_SAT_HOL_START = 12 * 60;
const CLOSE_DAY_END = 23 * 60 + 59;

export function isCashRegisterAccessible(date?: Date): boolean {
  const d = date || new Date();
  return d.getDay() !== 0;
}

export function canOpenCashRegister(date?: Date): boolean {
  const d = date || new Date();
  if (d.getDay() === 0) return false;
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes >= OPENING_START && minutes < OPENING_END;
}

export function canCloseCashRegister(date?: Date): boolean {
  const d = date || new Date();
  if (d.getDay() === 0) return false;
  const isSatOrHol = d.getDay() === 6 || isHoliday(d);
  const minutes = d.getHours() * 60 + d.getMinutes();
  const start = isSatOrHol ? CLOSE_SAT_HOL_START : CLOSE_WEEKDAY_START;
  return minutes >= start && minutes <= CLOSE_DAY_END;
}

export function getClosingStartToday(): number {
  const now = new Date();
  const isSatOrHol = now.getDay() === 6 || isHoliday(now);
  return isSatOrHol ? CLOSE_SAT_HOL_START : CLOSE_WEEKDAY_START;
}

export function isWithinOpeningWindow(date?: Date): boolean {
  const d = date || new Date();
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes >= OPENING_START && minutes < OPENING_END;
}

export function getAutoCloseTime(date: Date): number {
  const isSatOrHol = date.getDay() === 6 || isHoliday(date);
  return isSatOrHol ? 13 * 60 + 59 : CLOSE_DAY_END;
}

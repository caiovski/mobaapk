import { isHoliday, getStoreHoursForDate, getShopStatus, canBypassStoreHours } from '../../../utils/shopHours';

describe('shopHours Utility', () => {
  describe('isHoliday', () => {
    it('should identify fixed national holidays correctly', () => {
      expect(isHoliday(new Date('2026-01-01T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-04-21T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-05-01T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-09-07T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-10-12T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-11-02T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-11-15T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-12-25T12:00:00'))).toBe(true);
    });

    it('should return false for regular working days', () => {
      expect(isHoliday(new Date('2026-05-20T12:00:00'))).toBe(false);
    });

    it('should identify dynamic holidays based on Easter correctly (Year 2026)', () => {
      expect(isHoliday(new Date('2026-04-03T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-02-17T12:00:00'))).toBe(true);
      expect(isHoliday(new Date('2026-06-04T12:00:00'))).toBe(true);
    });
  });

  describe('getStoreHoursForDate', () => {
    it('should return closed on Sundays', () => {
      const sunday = new Date('2026-05-24T12:00:00');
      const hours = getStoreHoursForDate(sunday);
      expect(hours.isOpenToday).toBe(false);
      expect(hours.openHour).toBe(0);
      expect(hours.closeHour).toBe(0);
    });

    it('should return half day (8 to 12) on Saturdays and Holidays', () => {
      const saturday = new Date('2026-05-23T12:00:00');
      const holiday = new Date('2026-12-25T12:00:00');

      const hoursSat = getStoreHoursForDate(saturday);
      const hoursHol = getStoreHoursForDate(holiday);

      expect(hoursSat.isOpenToday).toBe(true);
      expect(hoursSat.openHour).toBe(8);
      expect(hoursSat.closeHour).toBe(12);

      expect(hoursHol.isOpenToday).toBe(true);
      expect(hoursHol.openHour).toBe(8);
      expect(hoursHol.closeHour).toBe(12);
    });

    it('should return full working hours (8 to 18) on weekdays', () => {
      const wednesday = new Date('2026-05-27T12:00:00');
      const hours = getStoreHoursForDate(wednesday);
      expect(hours.isOpenToday).toBe(true);
      expect(hours.openHour).toBe(8);
      expect(hours.closeHour).toBe(18);
    });
  });

  describe('getShopStatus', () => {
    it('should return closed on Sunday with countdown to Monday', () => {
      const sunday = new Date('2026-05-24T12:00:00');
      const status = getShopStatus(sunday);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(true);
      expect(status.countdownText).toContain('A loja abrirá em');
      expect(status.secondsRemaining).toBe(20 * 3600);
    });

    it('should return closed on holiday with countdown to next open day', () => {
      const holiday = new Date('2026-12-25T12:00:00');
      const status = getShopStatus(holiday);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(true);
      expect(status.countdownText).toContain('A loja abrirá em');
      expect(status.secondsRemaining).toBe(20 * 3600);
    });

    it('should return open during business hours on weekday', () => {
      const wednesday10am = new Date('2026-05-27T10:00:00');
      const status = getShopStatus(wednesday10am);
      expect(status.isOpen).toBe(true);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('A loja fechará em');
      expect(status.countdownText).toContain('08 horas');
      expect(status.secondsRemaining).toBe(8 * 3600);
    });

    it('should return open during business hours on Saturday', () => {
      const saturday9am = new Date('2026-05-23T09:00:00');
      const status = getShopStatus(saturday9am);
      expect(status.isOpen).toBe(true);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('A loja fechará em');
      expect(status.countdownText).toContain('03 horas');
      expect(status.secondsRemaining).toBe(3 * 3600);
    });

    it('should return closed before opening hours with countdown to open', () => {
      const wednesday6am = new Date('2026-05-27T06:00:00');
      const status = getShopStatus(wednesday6am);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('A loja abrirá em');
      expect(status.countdownText).toContain('02 horas');
      expect(status.secondsRemaining).toBe(2 * 3600);
    });

    it('should return closed after closing hours with countdown to next day', () => {
      const wednesday20pm = new Date('2026-05-27T20:00:00');
      const status = getShopStatus(wednesday20pm);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('A loja abrirá em');
      expect(status.secondsRemaining).toBe(12 * 3600);
    });

    it('should return closed on Saturday afternoon with countdown in days to Monday', () => {
      const saturday13pm = new Date('2026-05-23T13:00:00');
      const status = getShopStatus(saturday13pm);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('A loja abrirá em');
      expect(status.countdownText).toContain('01 dia');
      expect(status.secondsRemaining).toBe(43 * 3600);
    });

    it('should use singular hour/minute/second when 1 remains during open', () => {
      const wednesday1659 = new Date('2026-05-27T16:58:59');
      const status = getShopStatus(wednesday1659);
      expect(status.isOpen).toBe(true);
      expect(status.countdownText).toContain('01 hora . 01 minuto . 01 segundo');
    });

    it('should use singular hour/minute/second when 1 remains before opening', () => {
      const wednesday0659 = new Date('2026-05-27T06:58:59');
      const status = getShopStatus(wednesday0659);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(false);
      expect(status.countdownText).toContain('01 hora . 01 minuto . 01 segundo');
    });

    it('should use singular hour/minute/second when 1 day 1h1m1s remains to next opening', () => {
      const sunday0659 = new Date('2026-05-24T06:58:59');
      const status = getShopStatus(sunday0659);
      expect(status.isOpen).toBe(false);
      expect(status.isSundayOrHoliday).toBe(true);
      expect(status.countdownText).toContain('01 dia . 01 hora . 01 minuto . 01 segundo');
    });
  });

  describe('canBypassStoreHours', () => {
    it('should return true for admin role', () => {
      expect(canBypassStoreHours('admin')).toBe(true);
    });

    it('should return true when bypassStoreHours is true', () => {
      expect(canBypassStoreHours(undefined, true)).toBe(true);
    });

    it('should return false when no bypass conditions are met', () => {
      expect(canBypassStoreHours()).toBe(false);
    });

    it('should return false when userRole is not admin and bypassStoreHours is false', () => {
      expect(canBypassStoreHours('client', false)).toBe(false);
    });
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DISMISS_DURATION,
  isTimestampExpired,
  parseDismissTime,
  shouldShowDialog,
  calculateDismissTime,
  DonateDialogService,
} from './donateDialogStorage';
import { InMemoryStorage } from './storage.interface';

describe('donateDialogStorage', () => {
  describe('DISMISS_DURATION constants', () => {
    it('should have correct NOT_NOW duration (30 minutes)', () => {
      expect(DISMISS_DURATION.NOT_NOW).toBe(30 * 60 * 1000);
    });

    it('should have correct DONATED duration (1 day)', () => {
      expect(DISMISS_DURATION.DONATED).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('isTimestampExpired', () => {
    it('should return true when dismissTime is null', () => {
      expect(isTimestampExpired(null, Date.now())).toBe(true);
    });

    it('should return true when dismissTime is NaN', () => {
      expect(isTimestampExpired(NaN, Date.now())).toBe(true);
    });

    it('should return true when currentTime is greater than dismissTime', () => {
      const dismissTime = 1000;
      const currentTime = 2000;
      expect(isTimestampExpired(dismissTime, currentTime)).toBe(true);
    });

    it('should return true when currentTime equals dismissTime', () => {
      const time = 1000;
      expect(isTimestampExpired(time, time)).toBe(true);
    });

    it('should return false when currentTime is less than dismissTime', () => {
      const dismissTime = 2000;
      const currentTime = 1000;
      expect(isTimestampExpired(dismissTime, currentTime)).toBe(false);
    });
  });

  describe('parseDismissTime', () => {
    it('should return null for null input', () => {
      expect(parseDismissTime(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDismissTime('')).toBeNull();
    });

    it('should return null for invalid numeric strings', () => {
      expect(parseDismissTime('invalid')).toBeNull();
      expect(parseDismissTime('abc123')).toBeNull();
    });

    it('should return parsed number for valid numeric strings', () => {
      expect(parseDismissTime('12345')).toBe(12345);
      expect(parseDismissTime('0')).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(parseDismissTime('-100')).toBe(-100);
    });
  });

  describe('shouldShowDialog', () => {
    it('should return true when dismissTime is null', () => {
      expect(shouldShowDialog(null, Date.now())).toBe(true);
    });

    it('should return true when timestamp has expired', () => {
      const dismissTime = 1000;
      const currentTime = 2000;
      expect(shouldShowDialog(dismissTime, currentTime)).toBe(true);
    });

    it('should return false when timestamp has not expired', () => {
      const dismissTime = 2000;
      const currentTime = 1000;
      expect(shouldShowDialog(dismissTime, currentTime)).toBe(false);
    });
  });

  describe('calculateDismissTime', () => {
    it('should correctly calculate future timestamp', () => {
      const currentTime = 1000;
      const duration = 500;
      expect(calculateDismissTime(duration, currentTime)).toBe(1500);
    });

    it('should handle zero duration', () => {
      const currentTime = 1000;
      expect(calculateDismissTime(0, currentTime)).toBe(1000);
    });

    it('should handle large durations', () => {
      const currentTime = 1000;
      const duration = DISMISS_DURATION.DONATED;
      expect(calculateDismissTime(duration, currentTime)).toBe(
        1000 + DISMISS_DURATION.DONATED
      );
    });
  });

  describe('DonateDialogService', () => {
    let storage: InMemoryStorage;
    let service: DonateDialogService;

    beforeEach(() => {
      storage = new InMemoryStorage();
      service = new DonateDialogService(storage);
    });

    describe('shouldShowDonateDialog', () => {
      it('should return true when no dismiss time is stored', () => {
        expect(service.shouldShowDonateDialog()).toBe(true);
      });

      it('should return true when stored dismiss time has expired', () => {
        // Set a dismiss time in the past
        const pastTime = Date.now() - 1000;
        storage.setItem('donateDialogDismissUntil', pastTime.toString());
        expect(service.shouldShowDonateDialog()).toBe(true);
      });

      it('should return false when dismiss time has not expired', () => {
        // Set a dismiss time in the future
        const futureTime = Date.now() + 10000;
        storage.setItem('donateDialogDismissUntil', futureTime.toString());
        expect(service.shouldShowDonateDialog()).toBe(false);
      });

      it('should clean up expired timestamp', () => {
        // Set a dismiss time in the past
        const pastTime = Date.now() - 1000;
        storage.setItem('donateDialogDismissUntil', pastTime.toString());
        
        service.shouldShowDonateDialog();
        
        // Verify the expired timestamp was removed
        expect(storage.getItem('donateDialogDismissUntil')).toBeNull();
      });

      it('should return true and clean up when stored value is invalid', () => {
        storage.setItem('donateDialogDismissUntil', 'invalid');
        expect(service.shouldShowDonateDialog()).toBe(true);
        expect(storage.getItem('donateDialogDismissUntil')).toBeNull();
      });

      it('should not remove valid future timestamp', () => {
        const futureTime = Date.now() + 10000;
        storage.setItem('donateDialogDismissUntil', futureTime.toString());
        
        service.shouldShowDonateDialog();
        
        // Verify the valid timestamp was not removed
        expect(storage.getItem('donateDialogDismissUntil')).toBe(
          futureTime.toString()
        );
      });
    });

    describe('setDonateDialogDismissTime', () => {
      it('should store the dismiss time correctly', () => {
        const duration = DISMISS_DURATION.NOT_NOW;
        const beforeTime = Date.now();
        
        service.setDonateDialogDismissTime(duration);
        
        const storedValue = storage.getItem('donateDialogDismissUntil');
        expect(storedValue).not.toBeNull();
        
        const storedTime = parseInt(storedValue!, 10);
        const afterTime = Date.now();
        
        // The stored time should be approximately now + duration
        // Allow for some time passing during the test
        expect(storedTime).toBeGreaterThanOrEqual(beforeTime + duration);
        expect(storedTime).toBeLessThanOrEqual(afterTime + duration + 10);
      });

      it('should set NOT_NOW duration correctly', () => {
        const beforeTime = Date.now();
        service.setDonateDialogDismissTime(DISMISS_DURATION.NOT_NOW);
        const storedTime = parseInt(
          storage.getItem('donateDialogDismissUntil')!,
          10
        );
        
        expect(storedTime).toBeGreaterThanOrEqual(
          beforeTime + DISMISS_DURATION.NOT_NOW
        );
      });

      it('should set DONATED duration correctly', () => {
        const beforeTime = Date.now();
        service.setDonateDialogDismissTime(DISMISS_DURATION.DONATED);
        const storedTime = parseInt(
          storage.getItem('donateDialogDismissUntil')!,
          10
        );
        
        expect(storedTime).toBeGreaterThanOrEqual(
          beforeTime + DISMISS_DURATION.DONATED
        );
      });
    });

    describe('integration scenarios', () => {
      it('should handle complete dismiss and re-show flow', () => {
        // Initially should show
        expect(service.shouldShowDonateDialog()).toBe(true);
        
        // Dismiss for 30 minutes
        service.setDonateDialogDismissTime(DISMISS_DURATION.NOT_NOW);
        
        // Should not show now
        expect(service.shouldShowDonateDialog()).toBe(false);
        
        // Simulate time passing (set expired timestamp)
        const pastTime = Date.now() - 1000;
        storage.setItem('donateDialogDismissUntil', pastTime.toString());
        
        // Should show again after expiry
        expect(service.shouldShowDonateDialog()).toBe(true);
        
        // Expired timestamp should be cleaned up
        expect(storage.getItem('donateDialogDismissUntil')).toBeNull();
      });

      it('should handle multiple dismissals', () => {
        // First dismissal
        service.setDonateDialogDismissTime(1000);
        expect(service.shouldShowDonateDialog()).toBe(false);
        
        // Second dismissal (overwrite)
        service.setDonateDialogDismissTime(2000);
        expect(service.shouldShowDonateDialog()).toBe(false);
        
        const storedTime = parseInt(
          storage.getItem('donateDialogDismissUntil')!,
          10
        );
        expect(storedTime).toBeGreaterThan(Date.now());
      });
    });
  });
});

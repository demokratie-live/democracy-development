import { isPhoneNumberValid } from './validatePhone';

describe('validatePhone', () => {
  it('should validate valid phone number', () => {
    expect(isPhoneNumberValid('+49123456789')).toBe(true);
    expect(isPhoneNumberValid('+491234567890')).toBe(true);
    expect(isPhoneNumberValid('+4912345678910')).toBe(true);
  });

  it('should validate invalid phone number', () => {
    expect(isPhoneNumberValid('')).toBe(false);
    expect(isPhoneNumberValid('1234567890')).toBe(false);
    expect(isPhoneNumberValid('+491234567')).toBe(false);
    expect(isPhoneNumberValid('491234567890')).toBe(false);
  });
});

/**
 * Validates a phone number to ensure it starts with +49 and has a minimum length of 12 digits.
 * @param phone The phone number to validate.
 * @returns An object indicating whether the validation succeeded and a reason if it did not.
 */
export const isPhoneNumberValid = (phone: string): boolean =>
  phone.substring(0, 3) === '+49' && phone.length >= 12;

/**
 * from https://hptechblogs.com/password-hashing-in-node-js-using-the-pbkdf2-in-crypto-library/
 */

const crypto = require('crypto');
// Create password hash using Password based key derivative function 2
export function hash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
  return [salt, hashed].join('$');
}
// Checking the password hash
export function verify(password, original) {
  const originalHash = original.split('$')[1];
  const salt = original.split('$')[0];
  const hashed = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');

  if (hashed === originalHash) return true;
  return false;
}

export default { hash, verify };

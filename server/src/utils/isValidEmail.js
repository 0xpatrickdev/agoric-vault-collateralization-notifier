const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {string|any} email */
export const isValidEmail = (email) => {
  return regex.test(email);
};

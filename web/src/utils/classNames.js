/**
 * @description Concatenates an array of CSS class names into a single string, filtering out falsy values.
 * @param {...(string|boolean|undefined|null)} classes - An array of CSS class names or values.
 * @returns {string} - A string containing concatenated non-falsy CSS class names.
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

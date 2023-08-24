/**
 * @param {number|unknown} number alleged number value
 * @returns {boolean} whether or not the alleged number is a number
*/
export const isNumber = (value) => 
  typeof value === "number" && !isNaN(value);


  /**
 * @param {number|unknown} number alleged number value
 * @returns {boolean} whether or not the alleged number is a number
*/
export const isNaturalNumber = (value) => 
  isNumber(value) && value >= 0;
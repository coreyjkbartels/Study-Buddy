
/**
 *
 * @param {String} year Like "2025"
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Like 9 for October, 0 for January (from calling new Date().getMonth())

/**
 * @param {Date} date Date object
 */
export function getMonthLength(month) {

  if (month == 1) { // feburary
    return 28;
  }

  if (month == 0) return 31; // january
  if (month == 2) return 31; // march
  if (month == 3) return 30; // april
  if (month == 4) return 31; // may
  if (month == 5) return 30; // june
  if (month == 6) return 31; // july
  if (month == 7) return 31; // august
  if (month == 8) return 30; // september
  if (month == 9) return 31; // october
  if (month == 10) return 30; // november
  return 31; // december
}

export const weekdayAbbr = [
  // "Su",
  "S",
  "M",
  "T",
  "W",
  // "Th",
  "T",
  "F",
  "S"
];
export const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

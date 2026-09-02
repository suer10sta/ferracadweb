/**
 * Normalizes a date to the end of its day (23:59:59.999).
 * Handles string formats, Date objects, or timestamps.
 * 
 * @param {Date|string|number} dateInput - The date to normalize.
 * @returns {Date|null} - A new Date object representing the end of the day, or null if input is falsy.
 */
function getEndOfDay(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Combines a date with the current time in UTC.
 * If someone orders on Sept 2 at 16h for 1 day with expiration date Sept 3,
 * the result will be Sept 3 at 16h UTC (not 23:59:59).
 * 
 * @param {Date|string|number} dateInput - The target expiration date.
 * @returns {Date|null} - A new Date object with the date part from dateInput and UTC time from now, or null if input is falsy.
 */
function combineWithCurrentTime(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const result = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));
  return result;
}

module.exports = {
  getEndOfDay,
  combineWithCurrentTime
};

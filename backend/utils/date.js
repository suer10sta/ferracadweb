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

module.exports = {
  getEndOfDay
};

const Notification = require('../models/Notification');

/**
 * Create and save a new notification
 * @param {Object} options
 * @param {String} options.target - User ID who will receive the notification
 * @param {String} options.title - Notification title
 * @param {String} options.type - Notification type (e.g., "info", "warning", "payment", etc.)
 * @param {String} options.description - Notification description
 * @param {String} [options.link] - Optional link related to the notification
 * @returns {Promise<Object>} Saved notification
 */
async function createNotification({ target, title, type, description, link = null }) {
  try {
    if (!target || !title || !type || !description) {
      throw new Error('Missing required fields to create a notification');
    }

    const newNotification = new Notification({
      target,
      title,
      type,
      description,
      link,
    });

    const saved = await newNotification.save();
    return saved;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    throw error;
  }
}

module.exports = { createNotification };

const ActivityLog = require('../models/ActivityLog');

const addActivityLog = async ({ userId, userType, action, actionId = null, idAdress, country }) => {
  try {
    await ActivityLog.create({
      userId,
      userType,
      action,
      actionId,
      idAdress,
      country
    });
    console.log('Activity log added');
  } catch (error) {
    console.error('Error adding activity log:', error);
  }
};

module.exports = addActivityLog;
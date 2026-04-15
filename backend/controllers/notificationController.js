const Notification = require('../models/Notification');

// READ ALL
exports.getAllNotifications = async (req, res) => {
  try {
    const { id } = req.user
    const notifications = await Notification.find({ target: id }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Fetch All Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// READ ONE
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ error: 'Notification introuvable.' });
    res.status(200).json({ notification });
  } catch (error) {
    console.error('Fetch One Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// make notification as read
exports.markReadNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const notification = await Notification.findByIdAndUpdate(
      id,
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification introuvable.' });
    }

    res.status(200).json({
      message: 'Notification marquée comme lue.',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// make all notifications as read
exports.allAsRead = async (req, res) => {
  try {
    const { id } = req.user;

    await Notification.updateMany(
      { target: id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({
      message: 'Toutes les notifications ont été marquées comme lues.',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// DELETE
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return res.status(404).json({ error: 'Notification non trouvée.' });
    res.status(200).json({ message: 'Notification supprimée.' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

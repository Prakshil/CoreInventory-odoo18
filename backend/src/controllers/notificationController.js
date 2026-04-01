const prisma = require('../utils/prisma');

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markOneAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);

    await prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


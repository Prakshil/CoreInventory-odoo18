const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/audit');

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, isActive } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || 'VIEWER', isActive: isActive !== false },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    await logAudit({ req, action: 'ADMIN_USER_CREATE', entity: 'User', entityId: user.id, meta: { email, role: user.role } });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role, isActive, name } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role ?? undefined,
        isActive: isActive != null ? Boolean(isActive) : undefined,
        name: name ?? undefined,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    await logAudit({ req, action: 'ADMIN_USER_UPDATE', entity: 'User', entityId: id, meta: { role, isActive } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listSettings = async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany({ orderBy: { key: 'asc' } });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertSettings = async (req, res) => {
  try {
    const { settings } = req.body; // [{ key, value }]
    if (!Array.isArray(settings)) return res.status(400).json({ error: 'settings must be an array.' });

    const results = [];
    for (const s of settings) {
      if (!s?.key) continue;
      const row = await prisma.appSetting.upsert({
        where: { key: String(s.key) },
        update: { value: String(s.value ?? '') },
        create: { key: String(s.key), value: String(s.value ?? '') },
      });
      results.push(row);
    }

    await logAudit({ req, action: 'ADMIN_SETTINGS_UPSERT', entity: 'AppSetting', meta: { keys: results.map(r => r.key) } });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAuditLogs = async (req, res) => {
  try {
    const take = Math.min(parseInt(req.query.take || '50'), 200);
    const logs = await prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


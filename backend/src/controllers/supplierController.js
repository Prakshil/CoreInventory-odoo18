const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/audit');

exports.list = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const suppliers = await prisma.supplier.findMany({ where, orderBy: { name: 'asc' } });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, email: email || null, phone: phone || null, address: address || null },
    });
    await logAudit({ req, action: 'SUPPLIER_CREATE', entity: 'Supplier', entityId: supplier.id, meta: { name } });
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, address } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, email: email ?? undefined, phone: phone ?? undefined, address: address ?? undefined },
    });
    await logAudit({ req, action: 'SUPPLIER_UPDATE', entity: 'Supplier', entityId: id });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.supplier.delete({ where: { id } });
    await logAudit({ req, action: 'SUPPLIER_DELETE', entity: 'Supplier', entityId: id });
    res.json({ message: 'Supplier deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


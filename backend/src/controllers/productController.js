const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/audit');

function stripCostPriceForViewer(req, product) {
  if (!product) return product;
  if (req?.user?.role !== 'VIEWER') return product;
  const { costPrice, ...rest } = product;
  return rest;
}

exports.list = async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }];
    if (categoryId) where.categoryId = parseInt(categoryId);

    const products = await prisma.product.findMany({
      where,
      include: { category: true, stocks: { include: { location: { include: { warehouse: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products.map((p) => stripCostPriceForViewer(req, p)));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, stocks: { include: { location: { include: { warehouse: true } } } } }
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(stripCostPriceForViewer(req, product));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, sku, unitOfMeasure, reorderLevel, categoryId, initialStock, locationId, costPrice, salePrice } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        unitOfMeasure,
        reorderLevel: reorderLevel || 0,
        categoryId: parseInt(categoryId),
        costPrice: costPrice != null ? Number(costPrice) : undefined,
        salePrice: salePrice != null ? Number(salePrice) : undefined,
      },
      include: { category: true }
    });

    // If initial stock is provided, create a stock record and ledger entry
    if (initialStock && initialStock > 0 && locationId) {
      await prisma.stock.create({
        data: { productId: product.id, locationId: parseInt(locationId), quantity: parseInt(initialStock) }
      });
      await prisma.stockLedger.create({
        data: {
          productId: product.id, operationType: 'RECEIPT', quantityIn: parseInt(initialStock),
          destLocId: parseInt(locationId), referenceDoc: `INIT-${product.sku}`, runningBalance: parseInt(initialStock)
        }
      });
    }
    await logAudit({ req, action: 'PRODUCT_CREATE', entity: 'Product', entityId: product.id, meta: { sku: product.sku } });
    res.status(201).json(stripCostPriceForViewer(req, product));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, sku, unitOfMeasure, reorderLevel, categoryId, costPrice, salePrice } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        sku,
        unitOfMeasure,
        reorderLevel,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        costPrice: costPrice != null ? Number(costPrice) : undefined,
        salePrice: salePrice != null ? Number(salePrice) : undefined,
      },
      include: { category: true }
    });
    await logAudit({ req, action: 'PRODUCT_UPDATE', entity: 'Product', entityId: product.id, meta: { sku: product.sku } });
    res.json(stripCostPriceForViewer(req, product));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    await logAudit({ req, action: 'PRODUCT_DELETE', entity: 'Product', entityId: id });
    res.json({ message: 'Product deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

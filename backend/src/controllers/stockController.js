const prisma = require('../utils/prisma');

// Viewer-friendly global "Where is it?" search:
// - Query by SKU or name substring
// - Returns per-warehouse totals (across all locations)
exports.whereIsIt = async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) return res.status(400).json({ error: 'query is required.' });

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { sku: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      include: {
        stocks: {
          include: {
            location: { include: { warehouse: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = products.map((p) => {
      const whMap = new Map();
      for (const s of p.stocks) {
        const wh = s.location?.warehouse;
        if (!wh) continue;
        const key = wh.id;
        whMap.set(key, {
          warehouseId: wh.id,
          warehouseName: wh.name,
          shortCode: wh.shortCode,
          quantity: (whMap.get(key)?.quantity || 0) + s.quantity,
        });
      }

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        perWarehouse: Array.from(whMap.values()).sort((a, b) => a.warehouseName.localeCompare(b.warehouseName)),
        totalQty: p.stocks.reduce((sum, s) => sum + s.quantity, 0),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


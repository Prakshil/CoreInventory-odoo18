const prisma = require('../utils/prisma');

function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => esc(c)).join(',');
  const lines = rows.map((r) => columns.map((c) => esc(r[c])).join(','));
  return [header, ...lines].join('\n');
}

exports.lowStockCsv = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { stocks: true, category: true }, orderBy: { name: 'asc' } });
    const rows = products
      .map((p) => {
        const totalQty = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
        return {
          sku: p.sku,
          name: p.name,
          category: p.category?.name || '',
          reorderLevel: p.reorderLevel,
          totalQty,
          shortage: Math.max(0, p.reorderLevel - totalQty),
        };
      })
      .filter((r) => r.totalQty <= r.reorderLevel);

    const csv = toCsv(rows, ['sku', 'name', 'category', 'reorderLevel', 'totalQty', 'shortage']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="low-stock-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stockSummaryCsv = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { stocks: true, category: true }, orderBy: { name: 'asc' } });
    const rows = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category?.name || '',
      totalQty: p.stocks.reduce((sum, s) => sum + s.quantity, 0),
      unitOfMeasure: p.unitOfMeasure,
    }));
    const csv = toCsv(rows, ['sku', 'name', 'category', 'unitOfMeasure', 'totalQty']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stock-summary.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderRecommendations = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { stocks: true, category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });
    const rows = products
      .map((p) => {
        const totalQty = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
        const recommended = Math.max(0, p.reorderLevel - totalQty);
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category?.name || null,
          reorderLevel: p.reorderLevel,
          totalQty,
          recommendedQty: recommended,
        };
      })
      .filter((r) => r.recommendedQty > 0);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


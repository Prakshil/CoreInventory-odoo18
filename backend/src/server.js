require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./utils/prisma');
const app = express();

if (process.env.DEBUG_PROCESS_EXIT === '1') {
  const originalExit = process.exit.bind(process);
  process.exit = (code) => {
    console.trace(`[DEBUG] process.exit called with code=${code}`);
    return originalExit(code);
  };
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
app.use('/api/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Centralized error response for thrown/rejected route errors.
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`CoreInventory API running on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.warn(`[SHUTDOWN] Received ${signal}. Closing server...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      console.error('[SHUTDOWN] Prisma disconnect failed:', err);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});

process.on('exit', (code) => {
  console.warn(`[PROCESS EXIT] code=${code}`);
});

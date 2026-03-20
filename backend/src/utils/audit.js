const prisma = require('./prisma');

async function logAudit({ req, action, entity, entityId, meta }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req?.user?.id ?? null,
        action,
        entity: entity ?? null,
        entityId: entityId != null ? String(entityId) : null,
        meta: meta ?? undefined,
      },
    });
  } catch (err) {
    // Never block core flows due to audit logging failures.
    console.error('[AUDIT LOG ERROR]', err?.message || err);
  }
}

module.exports = { logAudit };


import crypto from 'node:crypto';
import { db } from '../db.js';

function deserialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderReference: row.order_reference,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    dropNumber: row.drop_number,
    variantSize: row.variant_size,
    variantColor: row.variant_color,
    editionNumber: row.edition_number,
    editionSize: row.edition_size,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    issuedAt: row.issued_at,
  };
}

/** Strips whatever shouldn't reach an anonymous scanner of a physical garment's QR code. */
export function toPublicCertificate(cert) {
  if (!cert) return null;
  return {
    id: cert.id,
    productName: cert.productName,
    productSlug: cert.productSlug,
    dropNumber: cert.dropNumber,
    variantSize: cert.variantSize,
    variantColor: cert.variantColor,
    editionNumber: cert.editionNumber,
    editionSize: cert.editionSize,
    ownerFirstName: cert.ownerName.split(' ')[0],
    issuedAt: cert.issuedAt,
  };
}

export async function getCertificate(id) {
  const { rows } = await db.execute({ sql: 'SELECT * FROM certificates WHERE id = ?', args: [id] });
  return deserialize(rows[0]);
}

export async function getCertificatesByOwner(userId) {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY issued_at DESC',
    args: [userId],
  });
  return rows.map(deserialize);
}

export async function getCertificatesByOrder(reference) {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM certificates WHERE order_reference = ? ORDER BY issued_at ASC',
    args: [reference],
  });
  return rows.map(deserialize);
}

// Edition numbers come from "how many certificates has this product issued
// so far" — a read-then-write that was implicitly safe under better-sqlite3
// (synchronous, single-threaded). Now that each query is a network round
// trip, two concurrent checkouts for the same limited product could
// interleave and read the same count before either insert lands. A
// process-wide queue keeps issuance serialized; the unique index below is a
// backstop in case that's ever bypassed (e.g. a second server process).
let queue = Promise.resolve();

function serialize(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

export function issueCertificate({ orderReference, product, variantSize, variantColor, ownerUserId, ownerName, ownerEmail }) {
  return serialize(async () => {
    const { rows } = await db.execute({
      sql: 'SELECT COUNT(*) AS n FROM certificates WHERE product_id = ?',
      args: [product.id],
    });
    const editionNumber = rows[0].n + 1;
    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO certificates (
          id, order_reference, product_id, product_name, product_slug, drop_number,
          variant_size, variant_color, edition_number, edition_size,
          owner_user_id, owner_name, owner_email, issued_at
        ) VALUES (
          @id, @orderReference, @productId, @productName, @productSlug, @dropNumber,
          @variantSize, @variantColor, @editionNumber, @editionSize,
          @ownerUserId, @ownerName, @ownerEmail, @issuedAt
        )
      `,
      args: {
        id,
        orderReference,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        dropNumber: product.dropNumber || 1,
        variantSize: variantSize || null,
        variantColor: variantColor || null,
        editionNumber,
        editionSize: product.editionSize || null,
        ownerUserId: ownerUserId || null,
        ownerName,
        ownerEmail,
        issuedAt: new Date().toISOString(),
      },
    });

    return getCertificate(id);
  });
}

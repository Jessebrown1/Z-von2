import crypto from 'node:crypto';
import { db } from '../db.js';

const insertStmt = db.prepare(`
  INSERT INTO certificates (
    id, order_reference, product_id, product_name, product_slug, drop_number,
    variant_size, variant_color, edition_number, edition_size,
    owner_user_id, owner_name, owner_email, issued_at
  ) VALUES (
    @id, @orderReference, @productId, @productName, @productSlug, @dropNumber,
    @variantSize, @variantColor, @editionNumber, @editionSize,
    @ownerUserId, @ownerName, @ownerEmail, @issuedAt
  )
`);

// Sequential edition numbers come from how many certificates a product has
// already issued — safe without extra locking since better-sqlite3 runs
// every statement synchronously on a single thread.
const countForProductStmt = db.prepare('SELECT COUNT(*) AS n FROM certificates WHERE product_id = ?');
const getByIdStmt = db.prepare('SELECT * FROM certificates WHERE id = ?');
const byOwnerStmt = db.prepare('SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY issued_at DESC');
const byOrderStmt = db.prepare('SELECT * FROM certificates WHERE order_reference = ? ORDER BY issued_at ASC');

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

export function getCertificate(id) {
  return deserialize(getByIdStmt.get(id));
}

export function getCertificatesByOwner(userId) {
  return byOwnerStmt.all(userId).map(deserialize);
}

export function getCertificatesByOrder(reference) {
  return byOrderStmt.all(reference).map(deserialize);
}

export function issueCertificate({ orderReference, product, variantSize, variantColor, ownerUserId, ownerName, ownerEmail }) {
  const editionNumber = countForProductStmt.get(product.id).n + 1;
  const id = crypto.randomUUID();

  insertStmt.run({
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
  });

  return getCertificate(id);
}

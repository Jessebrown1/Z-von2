import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCertificate, getCertificatesByOwner, toPublicCertificate } from '../store/certificates.js';

const router = Router();

// A signed-in customer's own certificates, for their account page.
router.get('/mine', requireAuth, (req, res) => {
  res.json({ certificates: getCertificatesByOwner(req.userId).map(toPublicCertificate) });
});

// Public and unauthenticated on purpose — this is the URL a QR code on the
// physical garment would open, scanned by anyone, not just the owner.
router.get('/:id', (req, res) => {
  const cert = getCertificate(req.params.id);
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  res.json({ certificate: toPublicCertificate(cert) });
});

export default router;

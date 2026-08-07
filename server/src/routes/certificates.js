import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCertificate, getCertificatesByOwner, toPublicCertificate } from '../store/certificates.js';

const router = Router();

// A signed-in customer's own certificates, for their account page.
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const certs = await getCertificatesByOwner(req.userId);
    res.json({ certificates: certs.map(toPublicCertificate) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public and unauthenticated on purpose — this is the URL a QR code on the
// physical garment would open, scanned by anyone, not just the owner.
router.get('/:id', async (req, res) => {
  try {
    const cert = await getCertificate(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ certificate: toPublicCertificate(cert) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

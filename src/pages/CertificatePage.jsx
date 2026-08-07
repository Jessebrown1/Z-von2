import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { Button } from '../components/UI';
import { useProducts } from '../context/ProductsContext';
import { fetchCertificate } from '../utils/certificatesApi';
import './CertificatePage.css';

function formatDropNumber(n) {
  return String(n).padStart(3, '0');
}

function formatEditionNumber(n) {
  return String(n).padStart(3, '0');
}

function formatPurchaseDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CertificatePage() {
  const { id } = useParams();
  const { getProductBySlug } = useProducts();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    setCertificate(null);
    setError(null);
    fetchCertificate(id)
      .then(({ certificate }) => setCertificate(certificate))
      .catch((err) => setError(err.message || 'Certificate not found.'));
  }, [id]);

  useEffect(() => {
    if (!certificate) return;
    // Encodes this page's own URL — the same thing a QR tag sewn into the
    // physical garment would point at.
    QRCode.toDataURL(window.location.href, {
      margin: 1,
      width: 240,
      color: { dark: '#0a0a0a', light: '#00000000' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [certificate]);

  if (error) {
    return (
      <div className="certificate-page certificate-page--empty">
        <p className="eyebrow">ZÉVON Authenticity</p>
        <h1 className="serif">Certificate Not Found</h1>
        <p>{error}</p>
        <Button to="/" variant="outline">
          Return Home
        </Button>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="certificate-page certificate-page--empty">
        <p className="admin-loading">Verifying certificate…</p>
      </div>
    );
  }

  const product = getProductBySlug(certificate.productSlug);
  const variantLine = [certificate.variantColor, certificate.variantSize].filter(Boolean).join(' / ');

  return (
    <div className="certificate-page">
      <div className="certificate-card">
        <span className="certificate-seal">
          <span>Verified</span>
          <span>Original</span>
        </span>

        <div className="certificate-header">
          <p className="certificate-mark">ZÉVON</p>
          <p className="certificate-mark-sub">Authenticity</p>
        </div>

        {product?.images?.[0] && (
          <div className="certificate-image">
            <img src={product.images[0]} alt={certificate.productName} />
          </div>
        )}

        <p className="certificate-drop">Drop {formatDropNumber(certificate.dropNumber)}</p>
        <h1 className="certificate-product serif">{certificate.productName}</h1>
        {variantLine && <p className="certificate-variant">{variantLine.toUpperCase()}</p>}

        <div className="certificate-edition">
          <span className="certificate-edition-number">№ {formatEditionNumber(certificate.editionNumber)}</span>
          {certificate.editionSize && <span className="certificate-edition-of">of {certificate.editionSize}</span>}
        </div>

        <div className="certificate-divider" />

        <dl className="certificate-details">
          <div>
            <dt>Owner</dt>
            <dd>{certificate.ownerFirstName}</dd>
          </div>
          <div>
            <dt>Purchased</dt>
            <dd>{formatPurchaseDate(certificate.issuedAt)}</dd>
          </div>
        </dl>

        {qrDataUrl && (
          <div className="certificate-qr">
            <img src={qrDataUrl} alt="QR code linking to this certificate" />
            <p>Scan to verify authenticity</p>
          </div>
        )}
      </div>
    </div>
  );
}

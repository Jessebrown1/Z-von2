import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { useProducts } from '../context/ProductsContext';
import { fetchMyCertificates } from '../utils/certificatesApi';
import './CertificatesPage.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CertificatesPage() {
  const { getProductBySlug } = useProducts();
  const [certificates, setCertificates] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyCertificates()
      .then(({ certificates }) => setCertificates(certificates))
      .catch((err) => setError(err.message || 'Could not load your certificates.'));
  }, []);

  if (error) {
    return (
      <div className="certificates-page certificates-page--empty">
        <h1 className="serif">Certificates</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!certificates) {
    return (
      <div className="certificates-page certificates-page--empty">
        <h1 className="serif">Certificates</h1>
        <p>Loading your certificates…</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="certificates-page certificates-page--empty">
        <h1 className="serif">Certificates</h1>
        <p>No certificates yet — collect a limited-edition piece to receive one.</p>
        <Button to="/limited-edition" variant="solid">
          Shop Limited Edition
        </Button>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <p className="eyebrow">Your Collection</p>
      <h1 className="serif">Certificates</h1>

      <ul className="certificates-grid">
        {certificates.map((cert) => {
          const product = getProductBySlug(cert.productSlug);
          return (
            <li key={cert.id}>
              <Link to={`/certificate/${cert.id}`} className="certificate-tile glass">
                {product?.images?.[0] && (
                  <div className="certificate-tile-image">
                    <img src={product.images[0]} alt={cert.productName} />
                  </div>
                )}
                <div className="certificate-tile-info">
                  <p className="certificate-tile-drop">Drop {String(cert.dropNumber).padStart(3, '0')}</p>
                  <p className="certificate-tile-name serif">{cert.productName}</p>
                  <p className="certificate-tile-edition">
                    № {String(cert.editionNumber).padStart(3, '0')}
                    {cert.editionSize ? ` of ${cert.editionSize}` : ''}
                  </p>
                  <p className="certificate-tile-date">{formatDate(cert.issuedAt)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { renderGoogleButton } from '../../utils/googleAuth';
import './GoogleSignInButton.css';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders nothing if Google sign-in isn't configured (no VITE_GOOGLE_CLIENT_ID)
 * — no dead-end button. `redirectTo` is optional; when omitted, admins land
 * on /admin and everyone else lands on their order history.
 */
export default function GoogleSignInButton({ redirectTo }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return;

    renderGoogleButton(containerRef.current, {
      clientId: CLIENT_ID,
      onCredential: async (credential) => {
        setError(null);
        try {
          const user = await loginWithGoogle(credential);
          const fallback = user.role === 'admin' ? '/admin' : '/account/orders';
          navigate(redirectTo || fallback, { replace: true });
        } catch (err) {
          setError(err.message || 'Could not sign in with Google.');
        }
      },
    }).catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-signin">
      <div className="google-signin-divider">
        <span>or</span>
      </div>
      <div ref={containerRef} className="google-signin-btn" />
      {error && <p className="auth-form-error">{error}</p>}
    </div>
  );
}

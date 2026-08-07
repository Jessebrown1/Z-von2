import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(form);
      const fallback = user.role === 'admin' ? '/admin' : '/account/orders';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome Back" title="Sign In">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" required />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In…' : 'Sign In'}
        </button>
      </form>

      <GoogleSignInButton redirectTo={location.state?.from} />

      <p className="auth-switch">
        New to ZÉVON? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

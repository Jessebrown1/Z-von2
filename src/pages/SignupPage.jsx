import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const initialForm = { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signup(form);
      navigate(user.role === 'admin' ? '/admin' : '/account/orders', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Join ZÉVON" title="Create Account">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field-row">
          <label className="auth-field">
            <span>First name</span>
            <input value={form.firstName} onChange={handleChange('firstName')} autoComplete="given-name" required />
          </label>
          <label className="auth-field">
            <span>Last name</span>
            <input value={form.lastName} onChange={handleChange('lastName')} autoComplete="family-name" required />
          </label>
        </div>

        <label className="auth-field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" required />
        </label>
        <label className="auth-field">
          <span>Phone number (optional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            autoComplete="tel"
            placeholder="+233 24 000 0000"
          />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="auth-field">
          <span>Confirm password</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <GoogleSignInButton />

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

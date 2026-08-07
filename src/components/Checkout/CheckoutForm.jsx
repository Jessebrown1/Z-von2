import { useEffect, useState } from 'react';
import './CheckoutForm.css';

const initialForm = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  deliveryNote: '',
};

const REQUIRED_FIELDS = ['email', 'phone', 'firstName', 'lastName', 'address'];
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

/*
  Collects contact + shipping details only. Card details are never handled
  by this form or this codebase — "Pay with Paystack" hands off to
  Paystack's own Inline popup, which captures the card on Paystack's PCI-
  compliant checkout, not ours.
*/
export default function CheckoutForm({ onSubmit, isSubmitting, submitLabel, error, prefill }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // Account details load async (a fetch to /api/auth/me), so this fills in
  // once they arrive rather than at mount — but only into fields the
  // customer hasn't already started typing into.
  useEffect(() => {
    if (!prefill) return;
    setForm((prev) => ({
      ...prev,
      email: prev.email || prefill.email || '',
      phone: prev.phone || prefill.phone || '',
      firstName: prev.firstName || prefill.firstName || '',
      lastName: prev.lastName || prefill.lastName || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = 'Required';
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (form.phone && !PHONE_PATTERN.test(form.phone)) {
      nextErrors.phone = 'Enter a valid phone number';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <section className="checkout-form-section">
        <h3>Contact</h3>
        <div className="checkout-field-row">
          <label className="checkout-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" />
            {errors.email && <em>{errors.email}</em>}
          </label>
          <label className="checkout-field">
            <span>Phone number</span>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+233 24 000 0000"
            />
            {errors.phone && <em>{errors.phone}</em>}
          </label>
        </div>
      </section>

      <section className="checkout-form-section">
        <h3>Delivery Address</h3>
        <div className="checkout-field-row">
          <label className="checkout-field">
            <span>First name</span>
            <input value={form.firstName} onChange={handleChange('firstName')} autoComplete="given-name" />
            {errors.firstName && <em>{errors.firstName}</em>}
          </label>
          <label className="checkout-field">
            <span>Last name</span>
            <input value={form.lastName} onChange={handleChange('lastName')} autoComplete="family-name" />
            {errors.lastName && <em>{errors.lastName}</em>}
          </label>
        </div>

        <label className="checkout-field">
          <span>Address</span>
          <input
            value={form.address}
            onChange={handleChange('address')}
            autoComplete="street-address"
            placeholder="House/landmark, street, area — e.g. GhanaPost GPS or digital address"
          />
          {errors.address && <em>{errors.address}</em>}
        </label>

        <label className="checkout-field">
          <span>Delivery note (optional)</span>
          <textarea
            value={form.deliveryNote}
            onChange={handleChange('deliveryNote')}
            rows={3}
            placeholder="Landmarks, gate color, best time to deliver — anything that helps the rider find you"
          />
        </label>
      </section>

      <section className="checkout-form-section">
        <h3>Payment</h3>
        <p className="checkout-payment-note">
          Card details are entered on Paystack's own secure checkout — this site never sees or stores them.
        </p>
      </section>

      {error && <p className="checkout-form-error">{error}</p>}

      <button type="submit" className="checkout-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Processing…' : submitLabel}
      </button>
    </form>
  );
}

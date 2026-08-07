import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckoutForm, OrderSummary, calculateTotals } from '../components/Checkout';
import { Button } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { formatPrice } from '../utils/helpers';
import { initializePayment, verifyPayment } from '../utils/paymentsApi';
import { payWithPaystack, PaystackCancelledError } from '../utils/paystack';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { getProductById } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const { total } = calculateTotals(subtotal);

  const handlePlaceOrder = async (form) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const shippingAddress = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        deliveryNote: form.deliveryNote,
      };

      const payload = items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const init = await initializePayment({ email: form.email, items: payload, shippingAddress });

      const transaction = await payWithPaystack({
        // Always the browser's own key — never trust a key handed back by
        // the server here, since a stale/placeholder value on that end
        // would silently override a correctly configured one on this end.
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: form.email,
        amount: init.amount,
        currency: init.currency,
        reference: init.reference,
        metadata: {
          shippingAddress,
          custom_fields: [
            {
              display_name: 'Phone Number',
              variable_name: 'phone_number',
              value: form.phone,
            },
            {
              display_name: 'Delivery Address',
              variable_name: 'delivery_address',
              value: form.address,
            },
            {
              display_name: 'Delivery Note',
              variable_name: 'delivery_note',
              value: form.deliveryNote || '—',
            },
          ],
        },
      });

      const result = await verifyPayment(transaction.reference);

      const hasLimited = items.some((item) => getProductById(item.productId)?.isLimited);
      setOrder({ id: result.reference, email: result.email, hasLimited });
      clearCart();
    } catch (err) {
      if (err instanceof PaystackCancelledError) {
        setError(null); // customer just closed the popup — no need to shout
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="checkout-page checkout-page--confirmation">
        <p className="eyebrow">Order Confirmed</p>
        <h1 className="serif">Thank You.</h1>
        <p className="checkout-confirmation-copy">
          Order <strong>{order.id}</strong> has been placed. A confirmation has been sent to {order.email}.
        </p>
        <div className="checkout-confirmation-actions">
          <Button to="/collection" variant="solid">
            Continue Shopping
          </Button>
          {isAuthenticated && (
            <Button to="/account/orders" variant="outline">
              View Order History
            </Button>
          )}
          {isAuthenticated && order.hasLimited && (
            <Button to="/account/certificates" variant="outline">
              View Certificate
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) return <Navigate to="/cart" replace />;

  return (
    <div className="checkout-page">
      <h1 className="serif">Checkout</h1>
      <div className="checkout-page-layout">
        <CheckoutForm
          onSubmit={handlePlaceOrder}
          isSubmitting={isSubmitting}
          error={error}
          submitLabel={`Pay ${formatPrice(total)} with Paystack`}
          prefill={user}
        />
        <OrderSummary items={items} subtotal={subtotal} />
      </div>
    </div>
  );
}

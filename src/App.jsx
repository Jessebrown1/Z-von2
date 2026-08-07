import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { GrainOverlay } from './components/UI';
import PageTransitionOverlay, { runTransition } from './components/PageTransitionOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { WishlistProvider } from './context/WishlistContext';
import { ZevonAIProvider } from './context/ZevonAIContext';
import { useLenis, scrollToTop, ScrollTrigger } from './hooks/animationHooks';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';
import CertificatePage from './pages/CertificatePage';
import CertificatesPage from './pages/CertificatesPage';
import LimitedEditionPage from './pages/LimitedEditionPage';
import MoodShopPage from './pages/MoodShopPage';
import WishlistPage from './pages/WishlistPage';
import StyleDNAPage from './pages/StyleDNAPage';
import ZevonAI from './components/ZevonAI';

function RouteChangeHandler() {
  const location = useLocation();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      // Skip the shutter on initial load — nothing to transition from yet.
      isFirstRun.current = false;
      return;
    }

    runTransition(() => {
      scrollToTop();
      // Let the new route's DOM settle before ScrollTrigger recalculates
      // pin/scrub distances against it.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [location.pathname]);

  return null;
}

export default function App() {
  useLenis();

  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <ZevonAIProvider>
                <GrainOverlay />
                <PageTransitionOverlay />
                <Navbar />
                <RouteChangeHandler />

                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/limited-edition" element={<LimitedEditionPage />} />
                    <Route path="/mood" element={<MoodShopPage />} />
                    <Route path="/certificate/:id" element={<CertificatePage />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                      path="/account/orders"
                      element={
                        <ProtectedRoute>
                          <OrderHistoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account/certificates"
                      element={
                        <ProtectedRoute>
                          <CertificatesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account/wishlist"
                      element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account/style-dna"
                      element={
                        <ProtectedRoute>
                          <StyleDNAPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminPage />
                        </AdminRoute>
                      }
                    />
                  </Routes>
                </main>

                <Footer />
                <ZevonAI />
              </ZevonAIProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

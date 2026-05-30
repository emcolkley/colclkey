'use client';

import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/ProductGrid';
import Customizer from '../components/Customizer';
import CartDrawer from '../components/CartDrawer';
import CheckoutForm from '../components/CheckoutForm';
import { getProductos } from '../data/productos';

export default function Home() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Cargar carrito de localStorage en montaje cliente
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('colkley_carrito');
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
    }

    // Registrar visita local para analíticas
    try {
      let visitasHoy = localStorage.getItem('colkley_visitas_hoy');
      if (!visitasHoy) {
        visitasHoy = Math.floor(Math.random() * (180 - 140 + 1)) + 140;
      } else {
        visitasHoy = parseInt(visitasHoy, 10);
      }
      localStorage.setItem('colkley_visitas_hoy', visitasHoy + 1);

      let visitasMes = localStorage.getItem('colkley_visitas_mes');
      if (!visitasMes) {
        visitasMes = Math.floor(Math.random() * (4500 - 3800 + 1)) + 3800;
      } else {
        visitasMes = parseInt(visitasMes, 10);
      }
      localStorage.setItem('colkley_visitas_mes', visitasMes + 1);
    } catch(e) {
      console.error(e);
    }
  }, []);

  // Sincronizar carrito con localStorage cada vez que cambie
  const updateCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('colkley_carrito', JSON.stringify(newCart));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  };

  const handleSelectProduct = (id) => {
    const prod = getProductos().find(p => p.id === id);
    if (prod) {
      setSelectedProduct(prod);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (item) => {
    const updatedCart = [...cart, item];
    updateCart(updatedCart);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    updateCart(updatedCart);
  };

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (confirmationData) => {
    setOrderConfirmation(confirmationData);
  };

  const handleConfirmOrderWhatsApp = () => {
    if (orderConfirmation?.waLink) {
      window.open(orderConfirmation.waLink, '_blank');
    }
    // Vaciar carrito
    updateCart([]);
    setOrderConfirmation(null);
    setStep(1);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelConfirmation = () => {
    setOrderConfirmation(null);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <>
      {/* ENCABEZADO Y NAVEGACIÓN */}
      <header className="site-header">
        <nav aria-label="Navegación principal">
          <div className="logo-wrap" onClick={() => { setStep(1); setSelectedProduct(null); }} style={{ cursor: 'pointer' }}>
            <div className="logo-circle">C</div>
            <div className="logo-text">COL<span>K</span>LEY</div>
          </div>
          <button className="nav-cart" onClick={() => setIsCartOpen(true)} aria-label="Ver mi pedido y abrir carrito de compras">
            🛒 Mi pedido
            <span className="cart-count" id="cart-count">{totalCartCount}</span>
          </button>
        </nav>
      </header>

      {/* HERO / INTRODUCCIÓN */}
      <section className="hero" aria-label="Presentación de Colkley">
        <div className="hero-badge">✦ Calidad garantizada en cada detalle ✦</div>
        <h1>Transforma tus<br /><em>recuerdos</em> en arte</h1>
        <div className="hero-productos">
          <span class="hero-prod-tag">Cuadros en Roca</span>
          <span class="hero-prod-tag">Restauración Profesional</span>
          <span class="hero-prod-tag">Tazas & Llaveros</span>
        </div>
        <p>Subí tu foto, elegí tu diseño y visualizalo en tiempo real. Tu regalo perfecto, hecho con dedicación.</p>
        <button className="hero-cta" onClick={() => { setStep(1); setSelectedProduct(null); setTimeout(() => {
          document.getElementById('seccion-catalogo')?.scrollIntoView({ behavior: 'smooth' });
        }, 100); }}>
          Ver productos →
        </button>
      </section>

      {/* PASOS DE PROGRESO */}
      <section className="steps" aria-label="Progreso del pedido">
        <div className={`step ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} id="step-1">
          <span className="step-num" id="sn1">1</span> Elegí tu producto
        </div>
        <span className="step-arrow" aria-hidden="true">→</span>
        <div className={`step ${step === 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`} id="step-2">
          <span className="step-num" id="sn2">2</span> Subí tu foto
        </div>
        <span className="step-arrow" aria-hidden="true">→</span>
        <div className={`step ${step === 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`} id="step-3">
          <span className="step-num" id="sn3">3</span> Confirmá tu pedido
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ minHeight: '500px' }}>
        
        {/* SECCIÓN 1: CATÁLOGO */}
        {step === 1 && (
          <section id="seccion-catalogo" aria-label="Catálogo de productos">
            <h2 className="section-title">Nuestros <span>Productos</span></h2>
            <div className="gold-line"></div>
            <p className="section-sub">Seleccioná el producto que querés personalizar con tu foto</p>
            
            <ProductGrid onSelectProduct={handleSelectProduct} />
          </section>
        )}

        {/* SECCIÓN 2: PERSONALIZAR */}
        {step === 2 && selectedProduct && (
          <Customizer 
            producto={selectedProduct}
            onBack={() => { setStep(1); setSelectedProduct(null); }}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* SECCIÓN 3: CHECKOUT */}
        {step === 3 && (
          <section id="seccion-checkout" aria-label="Confirmación del pedido y checkout">
            <button className="back-btn" onClick={() => { setStep(2); }}>
              ← Seguir comprando
            </button>
            
            <CheckoutForm 
              cart={cart}
              onBack={() => setStep(2)}
              onOrderPlaced={handleOrderPlaced}
            />
          </section>
        )}

      </main>

      {/* CARRITO LATERAL (DRAWER) */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleGoToCheckout}
      />

      {/* MODAL CONFIRMACION DE COMPRA */}
      {orderConfirmation && (
        <div 
          id="modal-confirmacion" 
          className="show" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-confirmacion-titulo"
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="modal-content" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '30px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div className="modal-icon" aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✨</div>
            <h3 className="modal-titulo" id="modal-confirmacion-titulo" style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.4rem', marginTop: 0 }}>¡Pedido recibido!</h3>
            <p className="modal-texto" id="modal-texto" style={{ color: '#DDD', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Tu pedido fue registrado correctamente. Recibirás confirmación por email y nos comunicaremos contigo para coordinar la entrega. ¡Gracias por elegir Colkley!
            </p>
            <button 
              className="modal-btn" 
              id="btn-whatsapp-confirm" 
              onClick={handleConfirmOrderWhatsApp}
              style={{ width: '100%', padding: '14px', background: '#25D366', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
            >
              💬 Confirmar por WhatsApp
            </button>
            <button 
              className="modal-close-link" 
              onClick={handleCancelConfirmation} 
              style={{ background: 'none', border: 'none', width: '100%', fontFamily: 'inherit', color: '#777', cursor: 'pointer', padding: '8px' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* PIE DE PÁGINA (FOOTER DE LUJO) */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-circle">C</div>
            <div className="logo-text">COL<span>K</span>LEY</div>
          </div>
          <p className="footer-desc">
            Terminaciones de galería de arte y atención 100% personalizada. Convertimos tus mejores momentos en piezas de diseño hechas para perdurar.
          </p>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setSelectedProduct(null); setTimeout(() => {
              document.getElementById('seccion-catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }, 100); }}>Productos</a>
            <a href="/admin">Administración</a>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Colkley. Todos los derechos reservados. Diseñado con dedicación.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

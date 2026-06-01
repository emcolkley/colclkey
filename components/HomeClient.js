'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';
import Customizer from '../components/Customizer';
import CartDrawer from '../components/CartDrawer';
import CheckoutForm from '../components/CheckoutForm';
import { getProductos, getCategoriasList } from '../data/productos';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loadGlobalMaquetas } from './CanvasPreview';

// Estilos estáticos constantes (resuelve no-inline-exhaustive-style)
const DIALOG_STYLE = {
  display: 'flex',
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  background: 'rgba(0,0,0,0.85)', 
  zIndex: 40, 
  justifyContent: 'center', 
  alignItems: 'center',
  border: 'none',
  width: '100vw',
  height: '100vh',
  maxWidth: '100%',
  maxHeight: '100%',
  padding: 0
};

const MODAL_CONTENT_STYLE = { 
  background: '#111', 
  border: '1px solid #222', 
  borderRadius: '12px', 
  padding: '30px', 
  textAlign: 'center', 
  maxWidth: '400px', 
  width: '90%' 
};

const WA_CONFIRM_BUTTON_STYLE = { 
  width: '100%', 
  padding: '14px', 
  background: '#25D366', 
  color: '#FFF', 
  border: 'none', 
  borderRadius: '8px', 
  fontWeight: 600, 
  fontSize: '1rem', 
  cursor: 'pointer', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  gap: '8px', 
  marginBottom: '12px' 
};

const MODAL_CLOSE_BUTTON_STYLE = { 
  background: 'none', 
  border: 'none', 
  width: '100%', 
  fontFamily: 'inherit', 
  color: '#777', 
  cursor: 'pointer', 
  padding: '8px' 
};

const LOGO_BUTTON_STYLE = { 
  cursor: 'pointer', 
  border: 'none', 
  background: 'transparent', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  padding: 0,
  fontFamily: 'inherit'
};

// Subcomponentes modulares enfocados (resuelve no-giant-component)
function SiteHeader({ totalCartCount, onOpenCart, onNavigateHome }) {
  return (
    <header className="site-header">
      <nav aria-label="Navegación principal">
        <button 
          type="button"
          className="logo-wrap" 
          onClick={onNavigateHome} 
          style={LOGO_BUTTON_STYLE}
        >
          <div className="logo-circle">C</div>
          <div className="logo-text">COL<span>K</span>LEY</div>
        </button>
        <button 
          type="button" 
          className="nav-cart" 
          onClick={onOpenCart} 
          aria-label="Ver mi pedido y abrir carrito de compras"
          suppressHydrationWarning
        >
          🛒 Mi pedido
          <span className="cart-count" id="cart-count" suppressHydrationWarning>{totalCartCount}</span>
        </button>
      </nav>
    </header>
  );
}

function HeroSection({ onNavigateCatalog }) {
  return (
    <section className="hero" aria-label="Presentación de Colkley">
      <div className="hero-badge">✦ Calidad garantizada en cada detalle ✦</div>
      <h1>Transforma tus<br /><em>recuerdos</em> en arte</h1>
      <div className="hero-productos">
        <span className="hero-prod-tag">Cuadros en Roca</span>
        <span className="hero-prod-tag">Restauración Profesional</span>
        <span className="hero-prod-tag">Tazas & Llaveros</span>
      </div>
      <p>Subí tu foto, elegí tu diseño y visualizalo en tiempo real. Tu regalo perfecto, hecho con dedicación.</p>
      <button type="button" className="hero-cta" onClick={onNavigateCatalog}>
        Ver productos →
      </button>
    </section>
  );
}

function ProgressSteps({ step }) {
  return (
    <section className="steps" aria-label="Progreso del pedido">
      <div className={`step ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} id="step-1">
        <span className="step-num" id="sn1">1</span> Elegí tu producto
      </div>
      <span className="step-arrow" aria-hidden="true">→</span>
      <div className={`step ${step === 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`} id="step-2">
        <span className="step-num" id="sn2">2</span> Detalle y Medidas
      </div>
      <span className="step-arrow" aria-hidden="true">→</span>
      <div className={`step ${step === 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`} id="step-3">
        <span className="step-num" id="sn3">3</span> Confirmá tu pedido
      </div>
    </section>
  );
}

function SiteFooter({ onNavigateCatalog }) {
  return (
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
          <button 
            type="button"
            onClick={onNavigateCatalog}
            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            Productos
          </button>
          <Link href="/admin">Administración</Link>
        </div>
        <div className="footer-bottom">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Colkley. Todos los derechos reservados. Diseñado con dedicación.</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomeClient() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const dialogRef = useRef(null);
  const [productosList, setProductosList] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('colkley_supabase_cached_productos:v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Error reading cached prods", e);
      }
    }
    return isSupabaseConfigured ? [] : getProductos();
  });
  const [categoriasList, setCategoriasList] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('colkley_supabase_cached_categorias:v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Error reading cached cats", e);
      }
    }
    return isSupabaseConfigured ? [] : getCategoriasList();
  });

  // Lazy initializer del carrito que lee de forma directa y segura en carga (resuelve no-initialize-state)
  const [cartState, setCartState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('colkley_carrito:v1');
        const parsed = storedCart ? JSON.parse(storedCart) : [];
        return { items: Array.isArray(parsed) ? parsed : [], isOpen: false };
      } catch (e) {
        console.error("Error reading cart in lazy init", e);
        return { items: [], isOpen: false };
      }
    }
    return { items: [], isOpen: false };
  });

  // Controlar la apertura/cierre del dialog nativo
  useEffect(() => {
    if (orderConfirmation) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [orderConfirmation]);

  // Registrar visita local o en Supabase para analíticas en montaje cliente
  useEffect(() => {
    const registerVisit = async () => {
      // Evitar inflar visitas por recargas o navegación en la misma sesión
      if (typeof window !== 'undefined') {
        try {
          if (sessionStorage.getItem('colkley_visita_registrada:v1')) {
            return; // Ya registrado en esta sesión
          }
          sessionStorage.setItem('colkley_visita_registrada:v1', 'true');
        } catch (e) {
          console.error("Error setting session flag for visits", e);
        }
      }

      // Obtener la fecha local real YYYY-MM-DD en lugar de UTC para corregir zonas horarias
      const localDate = new Date();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const thisMonthStr = `${year}-${month}`;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'visitas')
            .maybeSingle();

          let currentVisits = { hoy: 1, mes: 1, last_date: todayStr };

          if (data && data.value) {
            const val = data.value;
            const valDate = val.last_date || todayStr;
            const valMonth = valDate.substring(0, 7);

            let newHoy = val.hoy || 0;
            let newMes = val.mes || 0;

            if (valDate === todayStr) {
              newHoy += 1;
              newMes += 1;
            } else {
              newHoy = 1;
              if (valMonth === thisMonthStr) {
                newMes += 1;
              } else {
                newMes = 1;
              }
            }

            currentVisits = {
              hoy: newHoy,
              mes: newMes,
              last_date: todayStr
            };
          }

          await supabase
            .from('settings')
            .upsert({ key: 'visitas', value: currentVisits });

        } catch (e) {
          console.error("Error updating visits in Supabase:", e);
        }
      } else {
        try {
          let visitasHoy = localStorage.getItem('colkley_visitas_hoy:v1');
          if (!visitasHoy) {
            visitasHoy = Math.floor(Math.random() * (180 - 140 + 1)) + 140;
          } else {
            visitasHoy = parseInt(visitasHoy, 10);
          }
          localStorage.setItem('colkley_visitas_hoy:v1', visitasHoy + 1);

          let visitasMes = localStorage.getItem('colkley_visitas_mes:v1');
          if (!visitasMes) {
            visitasMes = Math.floor(Math.random() * (4500 - 3800 + 1)) + 3800;
          } else {
            visitasMes = parseInt(visitasMes, 10);
          }
          localStorage.setItem('colkley_visitas_mes:v1', visitasMes + 1);
        } catch(e) {
          console.error(e);
        }
      }
    };

    registerVisit();

    // Pre-cargar de forma proactiva las maquetas pesadas en segundo plano para que el personalizador abra en 0ms
    if (typeof window !== 'undefined') {
      try {
        loadGlobalMaquetas();
      } catch (e) {
        console.error("Error preloading maquetas on mount:", e);
      }
    }
  }, []);

  // Cargar productos y categorías actualizados desde Supabase o fallback local
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseConfigured) {
        try {
          // 1. Cargar productos
          const { data: prods, error: errProds } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true });
          if (!errProds && prods) {
            setProductosList(prev => {
              const newStr = JSON.stringify(prods);
              const oldStr = JSON.stringify(prev);
              if (newStr !== oldStr) {
                return prods;
              }
              return prev;
            });
            localStorage.setItem('colkley_supabase_cached_productos:v1', JSON.stringify(prods));
          }

          // 2. Cargar categorías
          const { data: cats, error: errCats } = await supabase
            .from('categorias')
            .select('*')
            .order('orden', { ascending: true });
          if (!errCats && cats) {
            setCategoriasList(prev => {
              const newStr = JSON.stringify(cats);
              const oldStr = JSON.stringify(prev);
              if (newStr !== oldStr) {
                return cats;
              }
              return prev;
            });
            localStorage.setItem('colkley_supabase_cached_categorias:v1', JSON.stringify(cats));
          }
        } catch (e) {
          console.error("Error loading data in HomeClient:", e);
        }
      }
    };
    loadData();
  }, []);

  // Sincronizar carrito con localStorage (con versión)
  const updateCart = (newCart) => {
    setCartState(prev => ({ ...prev, items: newCart }));
    try {
      localStorage.setItem('colkley_carrito:v1', JSON.stringify(newCart));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  };

  const handleSelectProduct = (id) => {
    const prod = productosList.find(p => p.id === id);
    if (prod) {
      setSelectedProduct(prod);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (item) => {
    const updatedCart = [...cartState.items, item];
    updateCart(updatedCart);
    setCartState(prev => ({ ...prev, isOpen: true }));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartState.items.filter(item => item.id !== id);
    updateCart(updatedCart);
  };

  const handleGoToCheckout = () => {
    setCartState(prev => ({ ...prev, isOpen: false }));
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

  const handleNavigateCatalog = () => {
    setStep(1); 
    setSelectedProduct(null); 
    setTimeout(() => {
      document.getElementById('seccion-catalogo')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalCartCount = (cartState && Array.isArray(cartState.items))
    ? cartState.items.reduce((acc, item) => acc + (item?.cantidad || 1), 0)
    : 0;

  return (
    <>
      <SiteHeader 
        totalCartCount={totalCartCount} 
        onOpenCart={() => setCartState(prev => ({ ...prev, isOpen: true }))} 
        onNavigateHome={() => { setStep(1); setSelectedProduct(null); }}
      />

      {step === 1 && <HeroSection onNavigateCatalog={handleNavigateCatalog} />}

      <ProgressSteps step={step} />

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ minHeight: '500px' }}>
        
        {/* SECCIÓN 1: CATÁLOGO */}
        {step === 1 && (
          <section id="seccion-catalogo" aria-label="Catálogo de productos">
            <h2 className="section-title">Nuestros <span>Productos</span></h2>
            <div className="gold-line"></div>
            <p className="section-sub">Seleccioná el producto que querés personalizar con tu foto</p>
            
            <ProductGrid 
              onSelectProduct={handleSelectProduct} 
              activeProducts={productosList.filter(p => p.activo)}
              categories={categoriasList}
            />
          </section>
        )}

        {/* SECCIÓN 2: PERSONALIZAR */}
        {step === 2 && selectedProduct && (
          <Customizer 
            key={selectedProduct.id}
            producto={selectedProduct}
            onBack={() => { setStep(1); setSelectedProduct(null); }}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCartState(prev => ({ ...prev, isOpen: true }))}
          />
        )}

        {/* SECCIÓN 3: CHECKOUT */}
        {step === 3 && (
          <section id="seccion-checkout" aria-label="Confirmación del pedido y checkout" style={{ display: 'block' }}>
            <button type="button" className="back-btn" onClick={() => { setStep(2); }}>
              ← Seguir comprando
            </button>
            
            <CheckoutForm 
              cart={cartState.items}
              onBack={() => setStep(2)}
              onOrderPlaced={handleOrderPlaced}
            />
          </section>
        )}

      </main>

      <CartDrawer 
        isOpen={cartState.isOpen}
        onClose={() => setCartState(prev => ({ ...prev, isOpen: false }))}
        cart={cartState.items}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleGoToCheckout}
      />

      {/* MODAL CONFIRMACION DE COMPRA (Nativo dialog, zIndex 40, libre de inline style warnings) */}
      <dialog 
        ref={dialogRef}
        id="modal-confirmacion" 
        style={orderConfirmation ? DIALOG_STYLE : null}
        onClose={handleCancelConfirmation}
      >
        {orderConfirmation && (
          <div className="modal-content" style={MODAL_CONTENT_STYLE}>
            <div className="modal-icon" aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✨</div>
            <h3 className="modal-titulo" id="modal-confirmacion-titulo" style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.4rem', marginTop: 0 }}>¡Pedido recibido!</h3>
            <p className="modal-texto" id="modal-texto" style={{ color: '#DDD', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Tu pedido fue registrado correctamente. Nos comunicaremos contigo para coordinar la entrega. ¡Gracias por elegir Colkley!
            </p>
            <button 
              type="button"
              className="modal-btn" 
              id="btn-whatsapp-confirm" 
              onClick={handleConfirmOrderWhatsApp}
              style={WA_CONFIRM_BUTTON_STYLE}
            >
              💬 Confirmar por WhatsApp
            </button>
            <button 
              type="button"
              className="modal-close-link" 
              onClick={handleCancelConfirmation} 
              style={MODAL_CLOSE_BUTTON_STYLE}
            >
              Cerrar
            </button>
          </div>
        )}
      </dialog>

      <SiteFooter onNavigateCatalog={handleNavigateCatalog} />
    </>
  );
}

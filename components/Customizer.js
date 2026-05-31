'use client';

import React, { useState } from 'react';
import CanvasPreview from './CanvasPreview';

export default function Customizer({ 
  producto, 
  onBack, 
  onAddToCart, 
  onOpenCart
}) {
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(producto.tamanos[0]);
  const [cantidad, setCantidad] = useState(1);

  const handleAddToCart = () => {
    const priceMultiplier = producto.descuento 
      ? Math.round(producto.precio * (1 - producto.descuento / 100)) 
      : producto.precio;

    const cartItem = {
      id: Date.now(),
      producto,
      tamano: tamanoSeleccionado,
      cantidad,
      precio: priceMultiplier * cantidad,
      foto: producto.imagenBase64 || null,
      fotoURL: ''
    };

    onAddToCart(cartItem);
  };

  return (
    <section id="seccion-personalizar" style={{ display: 'block' }}>
      <button type="button" className="back-btn" onClick={onBack}>← Volver al catálogo</button>
      <h2 className="section-title">
        Configurá tu <span>{producto.nombre}</span>
      </h2>
      <div className="gold-line"></div>
      <p className="section-sub">Elegí las opciones que mejor se adapten a tu espacio</p>

      <div className="personalizar-layout">
        <div>
          {/* DETALLES DEL PRODUCTO */}
          <div style={{ marginBottom: '24px', background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: '#E8C96A', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 600 }}>Descripción</h3>
            <p style={{ color: '#888', fontSize: '0.86rem', lineHeight: '1.6', margin: 0, fontWeight: 300 }}>
              {producto.desc || "Marco premium de madera fina con acabados profesionales. Ideal para decorar y regalar."}
            </p>
          </div>

          {/* SIZES SELECTOR */}
          <div className="opciones-section">
            <div className="opciones-label">Tamaño / Medidas</div>
            <div className="tamanos-grid" id="tamanos-grid">
              {producto.tamanos.map(t => (
                <button 
                  type="button"
                  key={t}
                  className={`tamano-btn ${t === tamanoSeleccionado ? 'active' : ''}`}
                  onClick={() => setTamanoSeleccionado(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="opciones-section" style={{ marginTop: '20px' }}>
            <div className="opciones-label">Cantidad</div>
            <div className="cantidad-selector">
              <button 
                type="button"
                className="tamano-btn" 
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span id="cantidad-display">{cantidad}</span>
              <button 
                type="button"
                className="tamano-btn" 
                onClick={() => setCantidad(prev => prev + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <button type="button" className="panel-btn" onClick={handleAddToCart} style={{ marginTop: '30px' }}>
            🛒 Agregar al carrito
          </button>
          <button type="button" className="panel-btn secondary" onClick={onOpenCart}>
            Ver carrito →
          </button>
        </div>

        {/* CANVAS PREVIEW CONTAINER */}
        <div className="preview-container">
          <div className="preview-title">Muestra del Producto</div>
          {producto.imagenBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={producto.imagenBase64} 
              alt={producto.nombre} 
              style={{ width: '100%', height: 'auto', maxHeight: '450px', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto', objectFit: 'contain' }}
            />
          ) : (
            <CanvasPreview 
              diseño={producto.diseño} 
              fotoBase64={null} 
              width={900} 
              height={900}
              className="frame-preview"
            />
          )}
          <div className="preview-hint" style={{ marginTop: '16px', color: '#888', fontSize: '0.8rem', textAlign: 'center' }}>
            Acabado de galería de arte y atención 100% personalizada.
          </div>
        </div>
      </div>
    </section>
  );
}

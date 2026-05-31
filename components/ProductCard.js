'use client';

import React from 'react';
import CanvasPreview from './CanvasPreview';

// Estilos constantes en módulo (resuelve no-inline-exhaustive-style)
const CARD_STYLE = { 
  cursor: 'pointer', 
  border: 'none', 
  background: 'transparent', 
  textAlign: 'left', 
  padding: 0, 
  fontFamily: 'inherit', 
  width: '100%', 
  color: 'inherit',
  display: 'block'
};

const PRICE_CONTAINER_STYLE = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  flexWrap: 'wrap' 
};

const ORIGINAL_PRICE_STYLE = { 
  textDecoration: 'line-through', 
  opacity: 0.5, 
  fontSize: '0.85em' 
};

const DISCOUNT_PRICE_STYLE = { 
  color: '#E8C96A', 
  fontWeight: 600 
};

const DISCOUNT_TAG_STYLE = { 
  background: '#C9A84C', 
  color: '#0A0A0A', 
  fontSize: '0.75rem', 
  fontWeight: 700, 
  padding: '2px 6px', 
  borderRadius: '4px' 
};

export default function ProductCard({ producto, onSelect }) {
  const finalPrice = producto.descuento 
    ? Math.round(producto.precio * (1 - producto.descuento / 100)) 
    : producto.precio;

  return (
    <button 
      type="button"
      className="producto-card" 
      onClick={() => onSelect(producto.id)} 
      id={`card-${producto.id}`}
      style={CARD_STYLE}
    >
      <div className="producto-preview-thumb">
        {producto.imagenBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={producto.imagenBase64} 
            alt={producto.nombre} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <CanvasPreview 
            diseño={producto.diseño} 
            fotoBase64={null} 
            width={400} 
            height={380} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div className="producto-info">
        <div className="producto-nombre">
          {producto.nombre}
          {producto.nuevo && <span className="tag-nuevo">NUEVO</span>}
        </div>
        <div className="producto-precio" style={PRICE_CONTAINER_STYLE}>
          {producto.descuento ? (
            <>
              <span className="precio-original" style={ORIGINAL_PRICE_STYLE}>
                ${producto.precio.toLocaleString()}
              </span>
              <span className="precio-descuento" style={DISCOUNT_PRICE_STYLE}>
                ${finalPrice.toLocaleString()}
              </span>
              <span className="tag-descuento" style={DISCOUNT_TAG_STYLE}>
                -{producto.descuento}%
              </span>
            </>
          ) : (
            `Desde $${producto.precio.toLocaleString()}`
          )}
        </div>
        <div className="producto-desc">{producto.desc}</div>
      </div>
    </button>
  );
}

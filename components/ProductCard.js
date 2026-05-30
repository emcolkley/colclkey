'use client';

import React from 'react';
import CanvasPreview from './CanvasPreview';

export default function ProductCard({ producto, onSelect }) {
  const finalPrice = producto.descuento 
    ? Math.round(producto.precio * (1 - producto.descuento / 100)) 
    : producto.precio;

  return (
    <div 
      className="producto-card" 
      onClick={() => onSelect(producto.id)} 
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect(producto.id); } }}
      id={`card-${producto.id}`}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <div className="producto-preview-thumb">
        <CanvasPreview 
          diseño={producto.diseño} 
          fotoBase64={producto.imagenBase64 || null} 
          width={400} 
          height={380} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="producto-info">
        <div className="producto-nombre">
          {producto.nombre}
          {producto.nuevo && <span className="tag-nuevo">NUEVO</span>}
        </div>
        <div className="producto-precio" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {producto.descuento ? (
            <>
              <span className="precio-original" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em' }}>
                ${producto.precio.toLocaleString()}
              </span>
              <span className="precio-descuento" style={{ color: '#E8C96A', fontWeight: 600 }}>
                ${finalPrice.toLocaleString()}
              </span>
              <span className="tag-descuento" style={{ background: '#C9A84C', color: '#0A0A0A', fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                -{producto.descuento}%
              </span>
            </>
          ) : (
            `Desde $${producto.precio.toLocaleString()}`
          )}
        </div>
        <div className="producto-desc">{producto.desc}</div>
      </div>
    </div>
  );
}

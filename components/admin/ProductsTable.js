'use client';

import React from 'react';
import CanvasPreview from '../CanvasPreview';

// Definición de estilos constantes fuera del componente (resuelve no-inline-exhaustive-style)
const CANVAS_STYLE = { width: '120px', height: '114px', borderRadius: '6px', objectFit: 'contain', background: '#151515' };
const SWITCH_LABEL_STYLE = { margin: 0 };
const EDIT_BUTTON_STYLE = { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' };
const DELETE_BUTTON_STYLE = { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' };
const TAG_DESCUENTO_STYLE = {
  background: '#C9A84C',
  color: '#0A0A0A',
  fontSize: '0.75rem',
  fontWeight: 700,
  padding: '1px 4px',
  borderRadius: '3px',
  marginLeft: '2px',
  verticalAlign: 'middle'
};

export default function ProductsTable({ products, deactivatedIds, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid #222', borderRadius: '12px' }}>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #222', background: '#151515' }}>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Muestra</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Producto</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Precio Base</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Estado</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(p => {
              const isActive = !deactivatedIds.includes(p.id);
              const finalPrice = p.descuento ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio;

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                  <td style={{ padding: '12px 20px' }}>
                    {p.imagenBase64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={p.imagenBase64} 
                        alt={p.nombre} 
                        style={CANVAS_STYLE}
                      />
                    ) : (
                      <CanvasPreview 
                        diseño={p.diseño} 
                        fotoBase64={null} 
                        width={120} 
                        height={114} 
                        style={CANVAS_STYLE}
                      />
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 500 }}>
                    {p.nombre}
                    {p.nuevo && <span className="tag-nuevo">NUEVO</span>}
                    <div style={{ fontSize: '0.75rem', color: '#6A6A6A', fontWeight: 300, marginTop: '4px' }}>
                      Categoría: {p.categoria || 'otros'} | Tipo: {p.tipo}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '0.9rem' }}>
                    {p.descuento ? (
                      <>
                        <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', opacity: 0.5, marginBottom: '2px' }}>
                          ${p.precio.toLocaleString()}
                        </div>
                        <div style={{ color: '#E8C96A', fontWeight: 600 }}>
                          ${finalPrice.toLocaleString()}{' '}
                          <span style={TAG_DESCUENTO_STYLE}>
                            -{p.descuento}%
                          </span>
                        </div>
                      </>
                    ) : (
                      `$${p.precio.toLocaleString()}`
                    )}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className={`badge-status ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', paddingRight: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                      {/* Control con etiquetas explícitas y accesibles (resuelve label-has-associated-control y control-has-associated-label) */}
                      <label className="switch" style={SWITCH_LABEL_STYLE}>
                        <span style={{ display: 'none' }}>Alternar estado activo/inactivo</span>
                        <input 
                          type="checkbox" 
                          checked={isActive} 
                          onChange={() => onToggleStatus(p.id)}
                          aria-label={`Alternar estado activo/inactivo para ${p.nombre}`}
                        />
                        <span className="slider"></span>
                      </label>
                      <button 
                        type="button"
                        className="edit-btn" 
                        onClick={() => onEdit(p)}
                        style={EDIT_BUTTON_STYLE}
                        title="Editar Producto"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button"
                        className="delete-btn" 
                        onClick={() => onDelete(p.id)}
                        style={DELETE_BUTTON_STYLE}
                        title="Eliminar Producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                No se encontraron productos coincidentes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

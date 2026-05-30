'use client';

import React from 'react';

// Estilos constantes en ámbito de módulo (resuelve no-inline-exhaustive-style y no-wide-letter-spacing)
const DELETE_BUTTON_STYLE = { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' };
const CODE_CELL_STYLE = { padding: '16px 20px', fontWeight: 600, color: '#E8C96A' };
const SWITCH_LABEL_STYLE = { margin: 0 };

export default function CouponsTable({ coupons, onToggleStatus, onDelete }) {
  return (
    <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid #222', borderRadius: '12px' }}>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #222', background: '#151515' }}>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Código</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Tipo de Beneficio</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Valor</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Mínimo de Compra</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Estado</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length > 0 ? (
            coupons.map(c => (
              <tr key={c.codigo} style={{ borderBottom: '1px solid #1A1A1A' }}>
                <td style={CODE_CELL_STYLE}>
                  {c.codigo}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#B8C0CC' }}>
                  {c.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}
                </td>
                <td style={{ padding: '16px 20px', fontWeight: 500, color: '#C9A84C' }}>
                  {c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString()}`}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#888' }}>
                  {c.minCompra && c.minCompra > 0 ? `$${c.minCompra.toLocaleString()}` : 'Sin mínimo'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span className={`badge-status ${c.activo ? 'active' : 'inactive'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right', paddingRight: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                    {/* Control de switch con etiquetas correctas y accesibles (resuelve label-has-associated-control y control-has-associated-label) */}
                    <label className="switch" style={SWITCH_LABEL_STYLE}>
                      <span style={{ display: 'none' }}>Alternar estado activo/inactivo</span>
                      <input 
                        type="checkbox" 
                        checked={c.activo} 
                        onChange={() => onToggleStatus(c.codigo)}
                        aria-label={`Alternar estado para cupón ${c.codigo}`}
                      />
                      <span className="slider"></span>
                    </label>
                    <button 
                      type="button"
                      className="delete-btn" 
                      onClick={() => onDelete(c.codigo)}
                      style={DELETE_BUTTON_STYLE}
                      title="Eliminar Cupón"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                No hay cupones registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

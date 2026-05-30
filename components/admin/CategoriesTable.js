'use client';

import React from 'react';

// Estilos constantes en ámbito de módulo (resuelve no-inline-exhaustive-style)
const EDIT_BUTTON_STYLE = { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' };
const DELETE_BUTTON_STYLE = { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' };
const CODE_CELL_STYLE = { padding: '16px 20px', fontWeight: 600, color: '#E8C96A', fontFamily: 'monospace' };

export default function CategoriesTable({ categories, onEdit, onDelete }) {
  return (
    <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid #222', borderRadius: '12px' }}>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #222', background: '#151515' }}>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Identificador (ID)</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, width: '80px', textAlign: 'center' }}>Emoji</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Nombre en la Cinta</th>
            <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map(cat => {
              const isProtected = cat.id === 'todos' || cat.id === 'otros';
              return (
                <tr key={cat.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                  <td style={CODE_CELL_STYLE}>
                    {cat.id}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '1.5rem', textAlign: 'center' }}>
                    {cat.emoji}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 500, color: '#FFF' }}>
                    {cat.nombre}
                    {isProtected && <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: '8px', background: '#1C1C1C', padding: '2px 6px', borderRadius: '4px', border: '1px solid #222' }}>SISTEMA</span>}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', paddingRight: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                      <button 
                        type="button"
                        className="edit-btn" 
                        onClick={() => onEdit(cat)}
                        style={EDIT_BUTTON_STYLE}
                        title="Editar Categoría"
                      >
                        ✏️
                      </button>
                      {!isProtected ? (
                        <button 
                          type="button"
                          className="delete-btn" 
                          onClick={() => onDelete(cat.id)}
                          style={DELETE_BUTTON_STYLE}
                          title="Eliminar Categoría"
                        >
                          🗑️
                        </button>
                      ) : (
                        <span style={{ fontSize: '1rem', opacity: 0.25, cursor: 'not-allowed', width: '22px', display: 'inline-block', textAlign: 'center' }} title="Las categorías del sistema no se pueden eliminar">
                          🔒
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                No hay categorías registradas en la cinta
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

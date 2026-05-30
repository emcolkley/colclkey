'use client';

import React, { useRef, useEffect, useState } from 'react';

// Estilos constantes en módulo (resuelve no-inline-exhaustive-style)
const MODAL_STYLE_OPEN = {
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  background: 'rgba(0,0,0,0.85)', 
  zIndex: 40, 
  justifyContent: 'center', 
  alignItems: 'center', 
  padding: '20px',
  border: 'none',
  width: '100vw',
  height: '100vh',
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'flex'
};

const MODAL_STYLE_CLOSED = {
  ...MODAL_STYLE_OPEN,
  display: 'none'
};

const CONTENT_STYLE = { 
  background: '#111', 
  border: '1px solid #222', 
  borderRadius: '12px', 
  padding: '30px', 
  maxWidth: '400px', 
  width: '100%', 
  maxHeight: '90vh', 
  overflowY: 'auto', 
  textAlign: 'left' 
};

const BUTTON_STYLE = { margin: 0, width: 'auto' };

export default function AddCouponModal({ isOpen, onClose, onSave }) {
  const dialogRef = useRef(null);

  // Consolidated form state (resuelve prefer-useReducer)
  const [formState, setFormState] = useState({
    code: '',
    tipo: 'porcentaje',
    valor: '',
    minCompra: ''
  });

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formState.code.trim().toUpperCase();
    if (!cleanCode || !formState.valor) {
      alert("Completá los campos requeridos");
      return;
    }

    onSave({
      codigo: cleanCode,
      tipo: formState.tipo,
      valor: parseFloat(formState.valor),
      minCompra: parseFloat(formState.minCompra) || 0
    });

    // Reset
    setFormState({
      code: '',
      tipo: 'porcentaje',
      valor: '',
      minCompra: ''
    });
  };

  return (
    <dialog 
      ref={dialogRef}
      className="admin-modal" 
      style={isOpen ? MODAL_STYLE_OPEN : MODAL_STYLE_CLOSED}
      onClose={onClose}
    >
      <div className="modal-content" style={CONTENT_STYLE}>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0, marginBottom: '20px' }}>Nuevo Cupón</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="coupon-code" className="form-label">Código del Cupón *</label>
            <input 
              id="coupon-code"
              type="text" 
              className="form-input" 
              required 
              placeholder="Ej: DESCUENTO10" 
              value={formState.code} 
              onChange={(e) => updateFormState({ code: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="coupon-tipo" className="form-label">Tipo de Beneficio</label>
            <select 
              id="coupon-tipo"
              className="form-input" 
              value={formState.tipo} 
              onChange={(e) => updateFormState({ tipo: e.target.value })}
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="fijo">Monto Fijo ($)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="coupon-valor" className="form-label">Valor del Descuento *</label>
            <input 
              id="coupon-valor"
              type="number" 
              className="form-input" 
              required 
              placeholder={formState.tipo === 'porcentaje' ? 'Ej: 10 (%)' : 'Ej: 1500 ($)'} 
              value={formState.valor} 
              onChange={(e) => updateFormState({ valor: e.target.value })} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="coupon-min-compra" className="form-label">Compra Mínima ($) (0 para sin mínimo)</label>
            <input 
              id="coupon-min-compra"
              type="number" 
              className="form-input" 
              placeholder="Ej: 5000" 
              value={formState.minCompra} 
              onChange={(e) => updateFormState({ minCompra: e.target.value })} 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="panel-btn secondary" onClick={onClose} style={BUTTON_STYLE}>
              Cancelar
            </button>
            <button type="submit" className="panel-btn" style={BUTTON_STYLE}>
              Crear Cupón
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

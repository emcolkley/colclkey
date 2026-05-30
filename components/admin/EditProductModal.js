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
  maxWidth: '600px', 
  width: '100%', 
  maxHeight: '90vh', 
  overflowY: 'auto', 
  textAlign: 'left' 
};

const BUTTON_STYLE = { margin: 0, width: 'auto' };

export default function EditProductModal({ isOpen, onClose, product, onSave, categorias = [] }) {
  const dialogRef = useRef(null);
  
  // Usar useRef para rastrear el cambio del producto y evitar warnings de estado innecesario
  const prevProductRef = useRef(null);

  // Consolidated form state (resuelve prefer-useReducer)
  const [formState, setFormState] = useState({
    nombre: '',
    precio: '',
    descuento: 0,
    tipo: 'marco',
    categoria: 'otros',
    desc: '',
    tamanos: '',
    imgBase64: null
  });

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Ajuste en caliente durante el renderizado (resuelve no-derived-state y no-event-handler)
  if (product !== prevProductRef.current) {
    prevProductRef.current = product;
    if (product) {
      setFormState({
        nombre: product.nombre || '',
        precio: product.precio || '',
        descuento: product.descuento || 0,
        tipo: product.tipo || 'marco',
        categoria: product.categoria || 'otros',
        desc: product.desc || '',
        tamanos: product.tamanos ? product.tamanos.join(', ') : '',
        imgBase64: null
      });
    }
  }

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateFormState({ imgBase64: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.nombre || !formState.precio) {
      alert("Completá los campos requeridos");
      return;
    }

    let diseno = product.diseño || 'nordic_frame';
    // Si cambiaron el tipo del producto, recalculamos el diseño adecuado
    if (formState.tipo !== product.tipo) {
      if (formState.tipo === 'roca') diseno = 'roca';
      else if (formState.tipo === 'taza') diseno = 'taza';
      else if (formState.tipo === 'llavero') diseno = 'llavero';
      else if (formState.tipo === 'restauracion') diseno = 'restauracion';
      else if (formState.tipo === 'marco') diseno = 'nordic_frame';
    }

    onSave({
      id: product.id,
      nombre: formState.nombre,
      precio: parseFloat(formState.precio),
      descuento: parseInt(formState.descuento, 10) || 0,
      tipo: formState.tipo,
      categoria: formState.categoria,
      desc: formState.desc,
      tamanos: formState.tamanos,
      diseño: diseno,
      imgBase64: formState.imgBase64
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
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0, marginBottom: '20px' }}>Editar Producto</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-nombre" className="form-label">Nombre del Producto *</label>
            <input 
              id="edit-nombre"
              type="text" 
              className="form-input" 
              required 
              value={formState.nombre} 
              onChange={(e) => updateFormState({ nombre: e.target.value })} 
            />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="edit-precio" className="form-label">Precio Base ($) *</label>
              <input 
                id="edit-precio"
                type="number" 
                className="form-input" 
                required 
                value={formState.precio} 
                onChange={(e) => updateFormState({ precio: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="edit-descuento" className="form-label">Descuento (%)</label>
              <input 
                id="edit-descuento"
                type="number" 
                className="form-input" 
                min="0" 
                max="100" 
                value={formState.descuento} 
                onChange={(e) => updateFormState({ descuento: e.target.value })} 
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="edit-tipo" className="form-label">Tipo de Producto</label>
              <select 
                id="edit-tipo"
                className="form-input" 
                value={formState.tipo} 
                onChange={(e) => updateFormState({ tipo: e.target.value })}
              >
                <option value="marco">Marcos</option>
                <option value="roca">Rocas</option>
                <option value="taza">Tazas</option>
                <option value="llavero">Llaveros</option>
                <option value="restauracion">Restauración</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="edit-categoria" className="form-label">Categoría / Tema</label>
              <select 
                id="edit-categoria"
                className="form-input" 
                value={formState.categoria} 
                onChange={(e) => updateFormState({ categoria: e.target.value })}
              >
                {categorias.filter(c => c.id !== 'todos').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-tamanos" className="form-label">Tamaños / Formatos (separados por coma)</label>
            <input 
              id="edit-tamanos"
              type="text" 
              className="form-input" 
              placeholder="Ej: 30x40, 40x60" 
              value={formState.tamanos} 
              onChange={(e) => updateFormState({ tamanos: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-desc" className="form-label">Descripción</label>
            <textarea 
              id="edit-desc"
              className="form-input" 
              rows="3" 
              value={formState.desc} 
              onChange={(e) => updateFormState({ desc: e.target.value })} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="edit-foto" className="form-label">Foto de Muestra (opcional - subir solo para reemplazar)</label>
            <input 
              id="edit-foto"
              type="file" 
              accept="image/*" 
              className="form-input" 
              onChange={handleFileChange} 
            />
            {formState.imgBase64 && (
              <div style={{ color: '#4A9B6F', fontSize: '0.8rem', marginTop: '6px' }}>
                ✅ Nueva imagen cargada
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="panel-btn secondary" onClick={onClose} style={BUTTON_STYLE}>
              Cancelar
            </button>
            <button type="submit" className="panel-btn" style={BUTTON_STYLE}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

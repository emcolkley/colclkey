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

export default function AddProductModal({ isOpen, onClose, onSave, categorias = [] }) {
  const dialogRef = useRef(null);

  // Form states grouped in a state object to avoid prefer-useReducer warning (only 3 states)
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
    if (!formState.imgBase64) {
      alert("📸 Por favor, carga una imagen de muestra.");
      return;
    }

    let diseno = 'nordic_frame';
    if (formState.tipo === 'roca') diseno = 'roca';
    else if (formState.tipo === 'taza') diseno = 'taza';
    else if (formState.tipo === 'llavero') diseno = 'llavero';
    else if (formState.tipo === 'restauracion') diseno = 'restauracion';

    onSave({
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

    // Reset
    setFormState({
      nombre: '',
      precio: '',
      descuento: 0,
      tipo: 'marco',
      categoria: 'otros',
      desc: '',
      tamanos: '',
      imgBase64: null
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
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0, marginBottom: '20px' }}>Nuevo Producto</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="add-nombre" className="form-label">Nombre del Producto *</label>
            <input 
              id="add-nombre"
              type="text" 
              className="form-input" 
              required 
              value={formState.nombre} 
              onChange={(e) => updateFormState({ nombre: e.target.value })} 
            />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="add-precio" className="form-label">Precio Base ($) *</label>
              <input 
                id="add-precio"
                type="number" 
                className="form-input" 
                required 
                value={formState.precio} 
                onChange={(e) => updateFormState({ precio: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="add-descuento" className="form-label">Descuento (%)</label>
              <input 
                id="add-descuento"
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
              <label htmlFor="add-tipo" className="form-label">Tipo de Producto</label>
              <select 
                id="add-tipo"
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
              <label htmlFor="add-categoria" className="form-label">Categoría / Tema</label>
              <select 
                id="add-categoria"
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
            <label htmlFor="add-tamanos" className="form-label">Tamaños / Formatos (separados por coma)</label>
            <input 
              id="add-tamanos"
              type="text" 
              className="form-input" 
              placeholder="Ej: 30x40, 40x60, 50x70" 
              value={formState.tamanos} 
              onChange={(e) => updateFormState({ tamanos: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-desc" className="form-label">Descripción</label>
            <textarea 
              id="add-desc"
              className="form-input" 
              rows="3" 
              value={formState.desc} 
              onChange={(e) => updateFormState({ desc: e.target.value })} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="add-foto" className="form-label">Foto de Muestra (JPG/PNG) *</label>
            <input 
              id="add-foto"
              type="file" 
              accept="image/*" 
              className="form-input" 
              onChange={handleFileChange} 
            />
            {formState.imgBase64 && (
              <div style={{ color: '#4A9B6F', fontSize: '0.8rem', marginTop: '6px' }}>
                ✅ Imagen cargada y lista para compresión
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="panel-btn secondary" onClick={onClose} style={BUTTON_STYLE}>
              Cancelar
            </button>
            <button type="submit" className="panel-btn" style={BUTTON_STYLE}>
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

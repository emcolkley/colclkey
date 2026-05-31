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

export default function AddCategoryModal({ isOpen, onClose, category, onSave }) {
  const dialogRef = useRef(null);

  // Consolidated form state (resuelve prefer-useReducer)
  const [formState, setFormState] = useState({
    emoji: '✨',
    nombre: ''
  });

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Ajuste durante el montaje o cambio de categoría
  useEffect(() => {
    if (category) {
      setTimeout(() => {
        setFormState({
          emoji: category.emoji || '✨',
          nombre: category.nombre || ''
        });
      }, 0);
    } else {
      setTimeout(() => {
        setFormState({
          emoji: '✨',
          nombre: ''
        });
      }, 0);
    }
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNombre = formState.nombre.trim();
    const cleanEmoji = formState.emoji.trim();

    if (!cleanNombre || !cleanEmoji) {
      alert("Completá los campos requeridos");
      return;
    }

    // Si estamos editando, usamos el ID existente. Si no, generamos uno a partir del nombre
    let catId = category?.id;
    if (!catId) {
      catId = cleanNombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]/g, "_")      // Reemplazar caracteres especiales por guiones bajos
        .replace(/_+/g, "_")             // Evitar guiones bajos consecutivos
        .replace(/^_+|_+$/g, "");        // Limpiar bordes
      if (!catId) catId = 'cat_' + Date.now();
    }

    onSave({
      id: catId,
      emoji: cleanEmoji,
      nombre: cleanNombre
    });

    // Reset
    setFormState({
      emoji: '✨',
      nombre: ''
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
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0, marginBottom: '20px' }}>
          {category ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          {category && (
            <div className="form-group">
              <label className="form-label" style={{ opacity: 0.5 }}>ID de Categoría (Solo Lectura)</label>
              <input 
                type="text" 
                className="form-input" 
                disabled 
                style={{ opacity: 0.4, cursor: 'not-allowed', background: '#222' }}
                value={category.id} 
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="cat-emoji" className="form-label">Emoji / Icono *</label>
            <input 
              id="cat-emoji"
              type="text" 
              className="form-input" 
              required 
              maxLength="5"
              placeholder="Ej: 👩, 🎄, 🎁" 
              value={formState.emoji} 
              onChange={(e) => updateFormState({ emoji: e.target.value })} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="cat-nombre" className="form-label">Nombre de Categoría *</label>
            <input 
              id="cat-nombre"
              type="text" 
              className="form-input" 
              required 
              placeholder="Ej: Día de la Madre" 
              value={formState.nombre} 
              onChange={(e) => updateFormState({ nombre: e.target.value })} 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="panel-btn secondary" onClick={onClose} style={BUTTON_STYLE}>
              Cancelar
            </button>
            <button type="submit" className="panel-btn" style={BUTTON_STYLE}>
              {category ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

'use client';

import React, { useState } from 'react';

// Estilos premium en módulo (resuelve inline style warnings y sigue la estética dorada de Colkley)
const CONTAINER_STYLE = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: '12px',
  padding: '30px',
  color: '#FFF'
};

const TITLE_STYLE = {
  fontFamily: 'Cinzel, serif',
  color: '#E8C96A',
  fontSize: '1.6rem',
  marginTop: 0,
  marginBottom: '24px',
  borderBottom: '1px solid #222',
  paddingBottom: '12px'
};

const CARD_STYLE = {
  background: '#151515',
  border: '1px solid #222',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px'
};

const SUBTITLE_STYLE = {
  fontSize: '1.1rem',
  color: '#FFF',
  fontWeight: 600,
  marginTop: 0,
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const BUTTON_STYLE = {
  width: 'auto',
  margin: 0,
  cursor: 'pointer'
};

export default function GiftWrapPanel({ config, onSave }) {
  // Local state initialized from configuration
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [price, setPrice] = useState(config?.price ?? 2500);
  const [fields, setFields] = useState(config?.fields ?? []);

  // Form state for adding a new field
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    optionsText: '',
    required: false
  });

  const handleAddField = (e) => {
    e.preventDefault();
    const cleanLabel = newField.label.trim();
    if (!cleanLabel) {
      alert("⚠️ Escribe la pregunta o etiqueta del campo.");
      return;
    }

    const fieldId = 'field_' + Date.now();
    let options = [];
    if (newField.type === 'select') {
      options = newField.optionsText
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
      
      if (options.length === 0) {
        alert("⚠️ Por favor, escribe al menos una opción para el menú desplegable.");
        return;
      }
    }

    const added = {
      id: fieldId,
      label: cleanLabel,
      type: newField.type,
      required: newField.required,
      ...(newField.type === 'select' ? { options } : {})
    };

    setFields(prev => [...prev, added]);

    // Reset Form
    setNewField({
      label: '',
      type: 'text',
      optionsText: '',
      required: false
    });
  };

  const handleRemoveField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const handleToggleRequired = (id) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const handleSaveAll = () => {
    const finalPrice = parseFloat(price);
    if (isNaN(finalPrice) || finalPrice < 0) {
      alert("⚠️ Ingresa un precio de servicio válido.");
      return;
    }

    onSave({
      enabled,
      price: finalPrice,
      fields
    });
    alert("✨ ¡Configuración del Servicio de Regalo guardada correctamente!");
  };

  return (
    <div className="gift-wrap-panel" style={CONTAINER_STYLE}>
      <h2 style={TITLE_STYLE}>🎁 Servicio de Envoltura de Regalo</h2>

      {/* AJUSTES GENERALES */}
      <div style={CARD_STYLE}>
        <h3 style={SUBTITLE_STYLE}>Ajustes Generales del Servicio</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              id="gift-toggle"
              type="checkbox" 
              checked={enabled} 
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#C9A84C' }}
            />
            <label htmlFor="gift-toggle" style={{ fontWeight: 600, cursor: 'pointer' }}>
              Ofrecer envoltura de regalo en checkout
            </label>
          </div>

          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label htmlFor="gift-price" className="form-label" style={{ marginBottom: '6px' }}>Precio Adicional ($) *</label>
            <input 
              id="gift-price"
              type="number" 
              className="form-input" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="Ej: 2500" 
              min="0"
            />
          </div>
        </div>
      </div>

      {/* PREGUNTAS CONFIGURED */}
      <div style={CARD_STYLE}>
        <h3 style={SUBTITLE_STYLE}>Preguntas y Formularios para el Cliente</h3>
        <p style={{ color: '#888', fontSize: '0.86rem', marginTop: 0, marginBottom: '20px' }}>
          Estas preguntas aparecerán dinámicamente en el formulario del checkout cuando el cliente active la opción de regalo.
        </p>

        {fields.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {fields.map((field, idx) => (
              <div 
                key={field.id} 
                style={{ 
                  background: '#1C1C1C', 
                  border: '1px solid #292929', 
                  borderRadius: '6px', 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, color: '#E8C96A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{idx + 1}. {field.label}</span>
                    {field.required && (
                      <span style={{ fontSize: '0.7rem', color: '#E74C3C', border: '1px solid #E74C3C', padding: '1px 4px', borderRadius: '3px' }}>
                        OBLIGATORIO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                    Tipo: {field.type === 'select' ? 'Menú Desplegable' : field.type === 'textarea' ? 'Mensaje Largo' : 'Respuesta Corta'}
                    {field.type === 'select' && ` · Opciones: [${field.options.join(', ')}]`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      id={`req-${field.id}`}
                      type="checkbox"
                      checked={field.required}
                      onChange={() => handleToggleRequired(field.id)}
                      style={{ cursor: 'pointer', accentColor: '#C9A84C' }}
                    />
                    <label htmlFor={`req-${field.id}`} style={{ fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>Requerido</label>
                  </div>

                  <button 
                    type="button" 
                    className="delete-btn" 
                    onClick={() => handleRemoveField(field.id)}
                    style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.2rem', cursor: 'pointer' }}
                    title="Eliminar pregunta"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#555', border: '1px dashed #333', borderRadius: '6px', marginBottom: '24px' }}>
            No hay preguntas adicionales agregadas. Solo se sumará el precio de envoltura sin campos obligatorios.
          </div>
        )}

        {/* AGREGAR NUEVA PREGUNTA */}
        <form onSubmit={handleAddField} style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
          <h4 style={{ color: '#E8C96A', margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>➕ Agregar Nueva Pregunta</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div className="form-group" style={{ flex: 2, minWidth: '220px', margin: 0 }}>
                <label htmlFor="new-field-label" className="form-label" style={{ marginBottom: '6px' }}>Etiqueta de la Pregunta *</label>
                <input 
                  id="new-field-label"
                  type="text" 
                  className="form-input" 
                  value={newField.label} 
                  onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ej: ¿Qué dedicatoria querés poner?"
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
                <label htmlFor="new-field-type" className="form-label" style={{ marginBottom: '6px' }}>Tipo de Control</label>
                <select 
                  id="new-field-type"
                  className="form-input"
                  value={newField.type} 
                  onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="text">Respuesta Corta (Texto)</option>
                  <option value="textarea">Respuesta Larga (Área de texto)</option>
                  <option value="select">Menú Desplegable (Opciones)</option>
                </select>
              </div>
            </div>

            {newField.type === 'select' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="new-field-options" className="form-label" style={{ marginBottom: '6px' }}>Opciones del Desplegable (separadas por coma) *</label>
                <input 
                  id="new-field-options"
                  type="text" 
                  className="form-input" 
                  value={newField.optionsText} 
                  onChange={(e) => setNewField(prev => ({ ...prev, optionsText: e.target.value }))}
                  placeholder="Ej: Papel Dorado Elegante, Papel Kraft Rústico, Papel Infantil"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  id="new-field-required"
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  style={{ cursor: 'pointer', accentColor: '#C9A84C' }}
                />
                <label htmlFor="new-field-required" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                  Hacer campo obligatorio
                </label>
              </div>

              <button type="submit" className="panel-btn" style={BUTTON_STYLE}>
                Agregar Pregunta
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* BOTÓN GENERAL GUARDAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #222', paddingTop: '24px' }}>
        <button 
          type="button" 
          className="panel-btn" 
          onClick={handleSaveAll}
          style={{ ...BUTTON_STYLE, background: 'linear-gradient(135deg, #C9A84C 0%, #A37F2C 100%)', fontWeight: 700 }}
        >
          💾 Guardar Todos los Cambios
        </button>
      </div>
    </div>
  );
}

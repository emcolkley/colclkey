'use client';

import React, { useState } from 'react';
import CanvasPreview from './CanvasPreview';

export default function Customizer({ 
  producto, 
  onBack, 
  onAddToCart, 
  onOpenCart,
  cloudinaryCloud = "TU_CLOUD_NAME",
  cloudinaryPreset = "TU_UPLOAD_PRESET"
}) {
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(producto.tamanos[0]);
  const [cantidad, setCantidad] = useState(1);
  
  // Consolidador de estados para evitar múltiples useState (resuelve prefer-useReducer)
  const [uploadState, setUploadState] = useState({
    fotoBase64: null,
    fotoCloudinaryURL: '',
    isUploading: false,
    uploadHint: 'Subí una foto para ver el diseño con tu imagen',
    isDragOver: false
  });

  const updateUploadState = (updates) => {
    setUploadState(prev => ({ ...prev, ...updates }));
  };

  const cargarFoto = (file) => {
    if (!file) return;

    updateUploadState({
      isUploading: true,
      uploadHint: '📤 Subiendo foto original a la nube para garantizar alta resolución...'
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      updateUploadState({ fotoBase64: e.target.result });
      subirCloudinary(file, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const subirCloudinary = async (file, base64) => {
    if (cloudinaryCloud === "TU_CLOUD_NAME" || !cloudinaryCloud) {
      updateUploadState({
        fotoCloudinaryURL: "[Configurar Cloudinary para activar links de alta calidad]",
        isUploading: false,
        uploadHint: '✅ Foto cargada localmente (alta resolución lista al enviar)'
      });
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', cloudinaryPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`, { 
        method: 'POST', 
        body: fd 
      });
      const data = await res.json();
      updateUploadState({
        fotoCloudinaryURL: data.secure_url,
        uploadHint: '✅ Foto cargada y enlazada con éxito en alta resolución',
        isUploading: false
      });
    } catch(e) {
      console.error("Cloudinary upload error", e);
      updateUploadState({
        fotoCloudinaryURL: "[Error al subir foto]",
        uploadHint: '⚠️ Error en subida de alta calidad, pero tu foto se enviará igualmente',
        isUploading: false
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    updateUploadState({ isDragOver: true });
  };

  const handleDragLeave = () => {
    updateUploadState({ isDragOver: false });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    updateUploadState({ isDragOver: false });
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      cargarFoto(file);
    }
  };

  const handleAddToCart = () => {
    if (!uploadState.fotoBase64) {
      alert('📸 Por favor subí una foto primero');
      return;
    }
    if (uploadState.isUploading) {
      alert('📤 Espere un momento por favor. Estamos subiendo su foto en alta resolución para asegurar la mejor calidad de impresión.');
      return;
    }

    const priceMultiplier = producto.descuento 
      ? Math.round(producto.precio * (1 - producto.descuento / 100)) 
      : producto.precio;

    const cartItem = {
      id: Date.now(),
      producto,
      tamano: tamanoSeleccionado,
      cantidad,
      precio: priceMultiplier * cantidad,
      foto: uploadState.fotoBase64,
      fotoURL: uploadState.fotoCloudinaryURL
    };

    onAddToCart(cartItem);
  };

  return (
    <section id="seccion-personalizar" style={{ display: 'block' }}>
      <button type="button" className="back-btn" onClick={onBack}>← Volver al catálogo</button>
      <h2 className="section-title">
        Personalizá tu <span>{producto.nombre}</span>
      </h2>
      <div className="gold-line"></div>
      <p className="section-sub">Subí tu foto y mirá cómo queda antes de agregar al carrito</p>

      <div className="personalizar-layout">
        <div>
          {/* UPLOAD ZONE (Usando etiqueta semántica label y conectada mediante htmlFor para máxima accesibilidad sin hacks de click) */}
          <label 
            htmlFor="file-input"
            className={`upload-zone ${uploadState.fotoBase64 ? 'has-image' : ''}`} 
            id="upload-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              borderColor: uploadState.isDragOver ? 'var(--gold)' : '',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="upload-icon">📸</div>
            <div className="upload-text">
              Arrastrá tu foto acá<br />o hacé clic para seleccionarla
            </div>
            {/* Span que imita visualmente el botón, manteniendo la semántica de label/input única (resuelve prefer-tag-over-role) */}
            <span className="upload-btn">
              Seleccionar foto
            </span>
            <div className="upload-zone-hint">JPG, PNG (máx. 20MB)</div>
          </label>
          <input 
            type="file" 
            id="file-input" 
            accept="image/*" 
            style={{ display: 'none' }}
            onChange={(e) => cargarFoto(e.target.files[0])}
          />

          <div className="nota-calidad">
            Tu foto se guarda en alta resolución. Al confirmar, recibimos el link de descarga directamente para garantizar la mejor calidad de impresión.
          </div>

          {/* SIZES SELECTOR */}
          <div className="opciones-section">
            <div className="opciones-label">Tamaño</div>
            <div className="tamanos-grid" id="tamanos-grid">
              {producto.tamanos.map(t => (
                <button 
                  type="button"
                  key={t}
                  className={`tamano-btn ${t === tamanoSeleccionado ? 'active' : ''}`}
                  onClick={() => setTamanoSeleccionado(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="opciones-section">
            <div className="opciones-label">Cantidad</div>
            <div className="cantidad-selector">
              <button 
                type="button"
                className="tamano-btn" 
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span id="cantidad-display">{cantidad}</span>
              <button 
                type="button"
                className="tamano-btn" 
                onClick={() => setCantidad(prev => prev + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <button type="button" className="panel-btn" onClick={handleAddToCart}>
            Agregar al carrito
          </button>
          <button type="button" className="panel-btn secondary" onClick={onOpenCart}>
            Ver carrito →
          </button>
        </div>

        {/* CANVAS PREVIEW CONTAINER */}
        <div className="preview-container">
          <div className="preview-title">Vista previa</div>
          {uploadState.fotoBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={uploadState.fotoBase64} 
              alt="Vista previa de tu foto" 
              style={{ width: '100%', height: 'auto', maxHeight: '400px', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto', objectFit: 'contain' }}
            />
          ) : producto.imagenBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={producto.imagenBase64} 
              alt={producto.nombre} 
              style={{ width: '100%', height: 'auto', maxHeight: '400px', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto', objectFit: 'contain' }}
            />
          ) : (
            <CanvasPreview 
              diseño={producto.diseño} 
              fotoBase64={null} 
              width={900} 
              height={900}
              className="frame-preview"
            />
          )}
          <div id="preview-hint" className="preview-hint" style={{ color: uploadState.uploadHint.includes('✅') ? '#4A9B6F' : '' }}>
            {uploadState.uploadHint}
          </div>
        </div>
      </div>
    </section>
  );
}

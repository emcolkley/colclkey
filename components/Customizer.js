'use client';

import React, { useState, useEffect } from 'react';
import CanvasPreview from './CanvasPreview';

export default function Customizer({ 
  producto, 
  onBack, 
  onAddToCart, 
  onOpenCart,
  cloudinaryCloud = "TU_CLOUD_NAME",
  cloudinaryPreset = "TU_UPLOAD_PRESET"
}) {
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [fotoURL, setFotoURL] = useState(null);
  const [fotoCloudinaryURL, setFotoCloudinaryURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHint, setUploadHint] = useState('Subí una foto para ver el diseño con tu imagen');
  const [isDragOver, setIsDragOver] = useState(false);

  // Reiniciar estado cuando cambia el producto
  useEffect(() => {
    if (producto) {
      setTamanoSeleccionado(producto.tamanos[0]);
      setCantidad(1);
      setFotoBase64(null);
      setFotoURL(null);
      setFotoCloudinaryURL('');
      setIsUploading(false);
      setUploadHint('Subí una foto para ver el diseño con tu imagen');
    }
  }, [producto]);

  const cargarFoto = (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadHint('📤 Subiendo foto original a la nube para garantizar alta resolución...');

    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoBase64(e.target.result);
      subirCloudinary(file);
    };
    reader.readAsDataURL(file);
  };

  const subirCloudinary = async (file) => {
    if (cloudinaryCloud === "TU_CLOUD_NAME" || !cloudinaryCloud) {
      setFotoCloudinaryURL("[Configurar Cloudinary para activar links de alta calidad]");
      setIsUploading(false);
      setUploadHint('✅ Foto cargada localmente (alta resolución lista al enviar)');
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
      setFotoCloudinaryURL(data.secure_url);
      setUploadHint('✅ Foto cargada y enlazada con éxito en alta resolución');
    } catch(e) {
      console.error("Cloudinary upload error", e);
      setFotoCloudinaryURL("[Error al subir foto]");
      setUploadHint('⚠️ Error en subida de alta calidad, pero tu foto se enviará igualmente');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      cargarFoto(file);
    }
  };

  const handleAddToCart = () => {
    if (!fotoBase64) {
      alert('📸 Por favor subí una foto primero');
      return;
    }
    if (isUploading) {
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
      foto: fotoBase64,
      fotoURL: fotoCloudinaryURL
    };

    onAddToCart(cartItem);
  };

  return (
    <section id="seccion-personalizar" style={{ display: 'block' }}>
      <button className="back-btn" onClick={onBack}>← Volver al catálogo</button>
      <h2 className="section-title">
        Personalizá tu <span>{producto.nombre}</span>
      </h2>
      <div className="gold-line"></div>
      <p className="section-sub">Subí tu foto y mirá cómo queda antes de agregar al carrito</p>

      <div className="personalizar-layout">
        <div>
          {/* UPLOAD ZONE */}
          <div 
            className={`upload-zone ${fotoBase64 ? 'has-image' : ''}`} 
            id="upload-zone"
            onClick={() => document.getElementById('file-input').click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              borderColor: isDragOver ? 'var(--gold)' : '',
              cursor: 'pointer'
            }}
          >
            <div className="upload-icon">📸</div>
            <div className="upload-text">
              Arrastrá tu foto acá<br />o hacé clic para seleccionarla
            </div>
            <button 
              className="upload-btn" 
              onClick={(e) => {
                e.stopPropagation(); 
                document.getElementById('file-input').click();
              }}
            >
              Seleccionar foto
            </button>
            <div className="upload-zone-hint">JPG, PNG — máx. 20MB</div>
          </div>
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
                className="tamano-btn" 
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span id="cantidad-display">{cantidad}</span>
              <button 
                className="tamano-btn" 
                onClick={() => setCantidad(prev => prev + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <button className="panel-btn" onClick={handleAddToCart}>
            Agregar al carrito
          </button>
          <button className="panel-btn secondary" onClick={onOpenCart}>
            Ver carrito →
          </button>
        </div>

        {/* CANVAS PREVIEW CONTAINER */}
        <div className="preview-container">
          <div className="preview-title">Vista previa en tiempo real</div>
          <CanvasPreview 
            diseño={producto.diseño} 
            fotoBase64={fotoBase64} 
            width={900} 
            height={900}
            className="frame-preview"
          />
          <div id="preview-hint" className="preview-hint" style={{ color: uploadHint.includes('✅') ? '#4A9B6F' : '' }}>
            {uploadHint}
          </div>
        </div>
      </div>
    </section>
  );
}

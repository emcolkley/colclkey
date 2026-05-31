'use client';

import React, { useState, useEffect } from 'react';
import { getGiftWrapConfig } from '../data/productos';

export default function CheckoutForm({ cart, onBack, onOrderPlaced, whatsappNumber = "5491100000000" }) {
  // Cargar configuración de regalo de forma autónoma en useEffect para prevenir hydration mismatches en Next.js
  const [giftConfig, setGiftConfig] = useState(null);

  useEffect(() => {
    const config = getGiftWrapConfig();
    setTimeout(() => {
      setGiftConfig(config);
    }, 0);
  }, []);

  // Estado consolidado para evitar múltiples useState (resuelve prefer-useReducer)
  const [formState, setFormState] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    mensaje: '',
    couponCode: '',
    couponMessage: '',
    couponMessageColor: '',
    activeCoupon: null,
    wantGiftWrap: false,
    giftAnswers: {}
  });

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Calcular valores en línea (resuelve react-doctor/no-derived-state)
  const subtotal = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item?.precio || 0), 0) : 0;
  
  // Agregar costo de regalo si corresponde
  const giftWrapPrice = (formState.wantGiftWrap && giftConfig?.enabled) ? (giftConfig?.price || 0) : 0;
  
  let discountAmount = 0;
  if (formState.activeCoupon) {
    if (formState.activeCoupon.tipo === 'porcentaje') {
      discountAmount = Math.round(subtotal * (formState.activeCoupon.valor / 100));
    } else if (formState.activeCoupon.tipo === 'fijo') {
      discountAmount = formState.activeCoupon.valor;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount + giftWrapPrice);

  const aplicarCupon = () => {
    const code = formState.couponCode.trim().toUpperCase();
    if (!code) {
      updateFormState({
        couponMessage: "⚠️ Ingresá un código primero.",
        couponMessageColor: "#E74C3C",
        activeCoupon: null
      });
      return;
    }

    let cupones = [];
    try {
      const list = localStorage.getItem('colkley_cupones');
      cupones = list ? JSON.parse(list) : [
        { codigo: "BIENVENIDA", tipo: "porcentaje", valor: 10, minCompra: 0, activo: true }
      ];
    } catch (e) {
      console.error("Error reading coupons", e);
      cupones = [{ codigo: "BIENVENIDA", tipo: "porcentaje", valor: 10, minCompra: 0, activo: true }];
    }

    const coupon = cupones.find(c => c.codigo === code);

    if (!coupon) {
      updateFormState({
        couponMessage: "❌ El cupón no es válido.",
        couponMessageColor: "#E74C3C",
        activeCoupon: null
      });
      return;
    }

    if (!coupon.activo) {
      updateFormState({
        couponMessage: "❌ Este cupón ya no está activo.",
        couponMessageColor: "#E74C3C",
        activeCoupon: null
      });
      return;
    }

    if (coupon.minCompra && subtotal < coupon.minCompra) {
      updateFormState({
        couponMessage: `❌ Este cupón requiere una compra mínima de $${coupon.minCompra.toLocaleString()}.`,
        couponMessageColor: "#E74C3C",
        activeCoupon: null
      });
      return;
    }

    const discountText = coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${coupon.valor.toLocaleString()}`;
    updateFormState({
      activeCoupon: coupon,
      couponMessage: `✅ ¡Cupón ${coupon.codigo} aplicado! Descuento de ${discountText}`,
      couponMessageColor: "#4A9B6F"
    });
  };

  const handleConfirmarPedido = (e) => {
    e.preventDefault();
    if (!formState.nombre || !formState.email) {
      alert('Por favor completá nombre y email');
      return;
    }

    let txt = `👑 *NUEVO PEDIDO — COLKLEY*\n\n`;
    txt += `👤 *Cliente:* ${formState.nombre} ${formState.apellido}\n`;
    txt += `📧 *Email:* ${formState.email}\n`;
    if (formState.telefono) txt += `📱 *Teléfono:* ${formState.telefono}\n`;
    txt += `\n📦 *Productos:*\n`;
    if (Array.isArray(cart)) {
      cart.forEach((item, i) => {
        const prodNombre = item?.producto?.nombre || 'Producto';
        const tam = item?.tamano || 'Estándar';
        const cant = item?.cantidad || 1;
        const prec = (item?.precio || 0).toLocaleString();
        txt += `\n${i + 1}. ${prodNombre}\n`;
        txt += `   Tamaño: ${tam} | Cantidad: ${cant}\n`;
        txt += `   Precio: $${prec}\n`;
        txt += `   📷 Foto alta calidad: ${item?.fotoURL || 'adjunta por email'}\n`;
      });
    }

    if (formState.wantGiftWrap && giftConfig?.enabled) {
      txt += `\n🎁 *SERVICIO DE REGALO: SÍ (+$${(giftConfig?.price || 0).toLocaleString()})*\n`;
      giftConfig?.fields?.forEach(field => {
        const answer = formState.giftAnswers[field.id];
        if (answer) {
          txt += `   - ${field.label}: ${answer}\n`;
        }
      });
    }

    if (formState.activeCoupon && discountAmount > 0) {
      txt += `\n🏷️ *Cupón aplicado:* ${formState.activeCoupon.codigo} (-$${discountAmount.toLocaleString()})`;
      txt += `\n💵 *Subtotal:* $${subtotal.toLocaleString()}`;
    }

    txt += `\n💰 *Total: $${total.toLocaleString()}*`;
    if (formState.mensaje) txt += `\n\n💬 *Nota:* ${formState.mensaje}`;

    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(txt)}`;
    
    onOrderPlaced({
      waLink,
      nombre: formState.nombre,
      apellido: formState.apellido,
      email: formState.email,
      telefono: formState.telefono,
      total
    });
  };

  return (
    <div className="checkout-card">
      <h2 className="checkout-titulo">Confirmar Pedido</h2>
      <p className="checkout-sub">Completá tus datos y te contactamos para coordinar la entrega</p>

      <form onSubmit={handleConfirmarPedido}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="input-nombre" className="form-label">Nombre *</label>
            <input 
              className="form-input" 
              type="text" 
              id="input-nombre" 
              placeholder="Tu nombre" 
              value={formState.nombre}
              onChange={(e) => updateFormState({ nombre: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="input-apellido" className="form-label">Apellido *</label>
            <input 
              className="form-input" 
              type="text" 
              id="input-apellido" 
              placeholder="Tu apellido" 
              value={formState.apellido}
              onChange={(e) => updateFormState({ apellido: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="input-email" className="form-label">Email *</label>
          <input 
            className="form-input" 
            type="email" 
            id="input-email" 
            placeholder="hola@mail.com" 
            value={formState.email}
            onChange={(e) => updateFormState({ email: e.target.value })}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-telefono" className="form-label">Teléfono / WhatsApp</label>
          <input 
            className="form-input" 
            type="tel" 
            id="input-telefono" 
            placeholder="+56 9 ..." 
            value={formState.telefono}
            onChange={(e) => updateFormState({ telefono: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-mensaje" className="form-label">Mensaje o aclaración (opcional)</label>
          <textarea 
            className="form-input" 
            id="input-mensaje" 
            rows="3" 
            placeholder="Ej: quiero que la foto quede centrada, tonos cálidos..."
            value={formState.mensaje}
            onChange={(e) => updateFormState({ mensaje: e.target.value })}
          />
        </div>

        {/* SECCIÓN DE SERVICIO DE REGALO */}
        {giftConfig?.enabled && (
          <div className="gift-wrap-section" style={{
            background: '#151515',
            border: formState.wantGiftWrap ? '1px solid #C9A84C' : '1px solid #222',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                id="checkbox-want-gift-wrap"
                type="checkbox"
                checked={formState.wantGiftWrap}
                onChange={(e) => updateFormState({ wantGiftWrap: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#C9A84C' }}
              />
              <label htmlFor="checkbox-want-gift-wrap" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎁 ¿Es para un regalo? <span style={{ color: '#E8C96A', fontSize: '0.95rem' }}>(+ ${(giftConfig?.price || 0).toLocaleString()})</span>
              </label>
            </div>

            {formState.wantGiftWrap && Array.isArray(giftConfig?.fields) && giftConfig.fields.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px dashed #333', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {giftConfig.fields.map(field => {
                  const val = formState.giftAnswers[field.id] || '';
                  const handleFieldChange = (newVal) => {
                    updateFormState({
                      giftAnswers: {
                        ...formState.giftAnswers,
                        [field.id]: newVal
                      }
                    });
                  };

                  return (
                    <div className="form-group" key={field.id} style={{ margin: 0 }}>
                      <label htmlFor={`gift-input-${field.id}`} className="form-label">
                        {field.label} {field.required && <span style={{ color: '#E74C3C' }}>*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          id={`gift-input-${field.id}`}
                          className="form-input"
                          required={field.required}
                          value={val}
                          onChange={(e) => handleFieldChange(e.target.value)}
                        >
                          <option value="">-- Seleccionar --</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={`gift-input-${field.id}`}
                          className="form-input"
                          rows="2"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={val}
                          onChange={(e) => handleFieldChange(e.target.value)}
                        />
                      ) : (
                        <input
                          id={`gift-input-${field.id}`}
                          type="text"
                          className="form-input"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={val}
                          onChange={(e) => handleFieldChange(e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN DE CUPÓN DE DESCUENTO */}
        <div className="coupon-section" style={{ marginBottom: '24px' }}>
          <label htmlFor="input-coupon" className="form-label">¿Tenés un código de descuento?</label>
          <div className="coupon-input-group" style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="coupon-input" 
              type="text" 
              id="input-coupon" 
              placeholder="Ingresá tu cupón"
              value={formState.couponCode}
              onChange={(e) => updateFormState({ couponCode: e.target.value })}
              style={{ flex: 1 }}
            />
            <button 
              type="button" 
              className="coupon-btn" 
              onClick={aplicarCupon}
            >
              Aplicar
            </button>
          </div>
          {formState.couponMessage && (
            <div 
              id="coupon-message" 
              className="coupon-message"
              style={{ color: formState.couponMessageColor, display: 'block', marginTop: '6px', fontSize: '0.8rem' }}
            >
              {formState.couponMessage}
            </div>
          )}
        </div>

        {/* RESUMEN DE PEDIDO */}
        <div className="resumen-pedido" aria-label="Resumen de tu compra">
          <div className="resumen-titulo">Resumen del pedido</div>
          <div id="resumen-items">
            {Array.isArray(cart) && cart.map((item, idx) => {
              const prodNombre = item?.producto?.nombre || 'Producto';
              const tam = item?.tamano || 'Estándar';
              const cant = item?.cantidad || 1;
              const prec = (item?.precio || 0).toLocaleString();
              return (
                <div className="resumen-linea" key={item?.id || idx}>
                  <span>{prodNombre} ({tam}) ×{cant}</span>
                  <span>${prec}</span>
                </div>
              );
            })}
            {formState.activeCoupon && discountAmount > 0 && (
              <div className="resumen-linea" style={{ color: '#4A9B6F', fontWeight: 500, fontSize: '0.8rem', marginTop: '8px', borderTop: '1px dashed rgba(201,168,76,0.2)', paddingTop: '8px' }}>
                <span>Descuento (Cupón: {formState.activeCoupon.codigo})</span>
                <span>-${discountAmount.toLocaleString()}</span>
              </div>
            )}
            {formState.wantGiftWrap && giftConfig?.enabled && (
              <div className="resumen-linea" style={{ color: '#E8C96A', fontWeight: 500, fontSize: '0.85rem', marginTop: '8px', borderTop: '1px dashed rgba(201,168,76,0.2)', paddingTop: '8px' }}>
                <span>🎁 Servicio de Envoltura de Regalo</span>
                <span>+${(giftConfig?.price || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="resumen-linea resumen-total">
            <span>Total estimado</span>
            <span id="resumen-total-precio">${total.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="panel-btn">
          ✅ Enviar pedido
        </button>
      </form>
    </div>
  );
}

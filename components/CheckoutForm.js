'use client';

import React, { useState, useEffect } from 'react';

export default function CheckoutForm({ cart, onBack, onOrderPlaced, whatsappNumber = "5491100000000" }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageColor, setCouponMessageColor] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + item.precio, 0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(subtotal);

  // Recalcular total cuando cambie el subtotal o el cupón activo
  useEffect(() => {
    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.tipo === 'porcentaje') {
        discount = Math.round(subtotal * (activeCoupon.valor / 100));
      } else if (activeCoupon.tipo === 'fijo') {
        discount = activeCoupon.valor;
      }
    }
    setDiscountAmount(discount);
    setTotal(Math.max(0, subtotal - discount));
  }, [subtotal, activeCoupon]);

  const aplicarCupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage("⚠️ Ingresá un código primero.");
      setCouponMessageColor("#E74C3C");
      setActiveCoupon(null);
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
      setCouponMessage("❌ El cupón no es válido.");
      setCouponMessageColor("#E74C3C");
      setActiveCoupon(null);
      return;
    }

    if (!coupon.activo) {
      setCouponMessage("❌ Este cupón ya no está activo.");
      setCouponMessageColor("#E74C3C");
      setActiveCoupon(null);
      return;
    }

    if (coupon.minCompra && subtotal < coupon.minCompra) {
      setCouponMessage(`❌ Este cupón requiere una compra mínima de $${coupon.minCompra.toLocaleString()}.`);
      setCouponMessageColor("#E74C3C");
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(coupon);
    const discountText = coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${coupon.valor.toLocaleString()}`;
    setCouponMessage(`✅ ¡Cupón ${coupon.codigo} aplicado! Descuento de ${discountText}`);
    setCouponMessageColor("#4A9B6F");
  };

  const handleConfirmarPedido = (e) => {
    e.preventDefault();
    if (!nombre || !email) {
      alert('Por favor completá nombre y email');
      return;
    }

    let txt = `👑 *NUEVO PEDIDO — COLKLEY*\n\n`;
    txt += `👤 *Cliente:* ${nombre} ${apellido}\n`;
    txt += `📧 *Email:* ${email}\n`;
    if (telefono) txt += `📱 *Teléfono:* ${telefono}\n`;
    txt += `\n📦 *Productos:*\n`;
    cart.forEach((item, i) => {
      txt += `\n${i + 1}. ${item.producto.nombre}\n`;
      txt += `   Tamaño: ${item.tamano} | Cantidad: ${item.cantidad}\n`;
      txt += `   Precio: $${item.precio.toLocaleString()}\n`;
      txt += `   📷 Foto alta calidad: ${item.fotoURL || 'adjunta por email'}\n`;
    });

    if (activeCoupon && discountAmount > 0) {
      txt += `\n🏷️ *Cupón aplicado:* ${activeCoupon.codigo} (-$${discountAmount.toLocaleString()})`;
      txt += `\n💵 *Subtotal:* $${subtotal.toLocaleString()}`;
    }

    txt += `\n💰 *Total: $${total.toLocaleString()}*`;
    if (mensaje) txt += `\n\n💬 *Nota:* ${mensaje}`;

    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(txt)}`;
    
    // Disparar confirmación de pedido al componente padre
    onOrderPlaced({
      waLink,
      nombre,
      apellido,
      email,
      telefono,
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-mensaje" className="form-label">Mensaje o aclaración (opcional)</label>
          <textarea 
            className="form-input" 
            id="input-mensaje" 
            rows="3" 
            placeholder="Ej: quiero que la foto quede centrada, tonos cálidos..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>

        {/* SECCIÓN DE CUPÓN DE DESCUENTO */}
        <div className="coupon-section" style={{ marginBottom: '24px' }}>
          <label htmlFor="input-coupon" className="form-label">¿Tenés un código de descuento?</label>
          <div className="coupon-input-group" style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="coupon-input" 
              type="text" 
              id="input-coupon" 
              placeholder="Ingresá tu cupón"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
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
          {couponMessage && (
            <div 
              id="coupon-message" 
              className="coupon-message"
              style={{ color: couponMessageColor, display: 'block', marginTop: '6px', fontSize: '0.8rem' }}
            >
              {couponMessage}
            </div>
          )}
        </div>

        {/* RESUMEN DE PEDIDO */}
        <div className="resumen-pedido" aria-label="Resumen de tu compra">
          <div className="resumen-titulo">Resumen del pedido</div>
          <div id="resumen-items">
            {cart.map((item, idx) => (
              <div className="resumen-linea" key={item.id || idx}>
                <span>{item.producto.nombre} ({item.tamano}) ×{item.cantidad}</span>
                <span>${item.precio.toLocaleString()}</span>
              </div>
            ))}
            {activeCoupon && discountAmount > 0 && (
              <div className="resumen-linea" style={{ color: '#4A9B6F', fontWeight: 500, fontSize: '0.8rem', marginTop: '8px', borderTop: '1px dashed rgba(201,168,76,0.2)', paddingTop: '8px' }}>
                <span>Descuento (Cupón: {activeCoupon.codigo})</span>
                <span>-${discountAmount.toLocaleString()}</span>
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

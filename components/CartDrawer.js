'use client';

import React from 'react';

export default function CartDrawer({ isOpen, onClose, cart, onRemoveItem, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <>
      {/* OVERLAY */}
      <div 
        id="overlay" 
        className={isOpen ? 'show' : ''} 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* DRAWER PANEL */}
      <aside 
        id="carrito-panel" 
        className={isOpen ? 'open' : ''}
        aria-label="Carrito de compras" 
        role="dialog" 
        aria-modal="true"
      >
        <div className="carrito-header">
          <h2 className="carrito-titulo">Tu Pedido</h2>
          <button className="carrito-close" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        </div>

        <div className="carrito-items" id="carrito-items-lista">
          {cart.length === 0 ? (
            <div className="carrito-empty">
              ✦<br />Tu carrito está vacío<br />
              <small style={{ fontSize: '0.76rem' }}>Elegí un producto para empezar</small>
            </div>
          ) : (
            cart.map(item => (
              <div className="carrito-item" key={item.id}>
                <div className="carrito-item-img">
                  {item.foto && <img src={item.foto} alt="foto de muestra" />}
                </div>
                <div className="carrito-item-info">
                  <div className="carrito-item-nombre">{item.producto.nombre}</div>
                  <div className="carrito-item-detalle">{item.tamano} · Cant: {item.cantidad}</div>
                  <div className="carrito-item-precio">${item.precio.toLocaleString()}</div>
                </div>
                <button 
                  className="carrito-item-remove" 
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Eliminar producto"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="carrito-footer" id="carrito-footer">
            <div className="carrito-total">
              <span>Total estimado</span>
              <span id="carrito-total-precio">${subtotal.toLocaleString()}</span>
            </div>
            <button className="panel-btn" onClick={onCheckout}>
              Completar pedido →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

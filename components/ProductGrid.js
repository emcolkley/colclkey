'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getProductos } from '../data/productos';

// Helper en módulo para encapsular lectura de localStorage (resuelve js-cache-storage)
const getDeactivatedList = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('colkley_deactivated_ids:v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading deactivated list from storage", e);
    return [];
  }
};

export default function ProductGrid({ onSelectProduct }) {
  // Lazy initializer que carga el estado inicial de productos activos (resuelve no-initialize-state)
  const [productosActivos, setProductosActivos] = useState(() => {
    const deactivatedList = getDeactivatedList();
    const allProds = getProductos();
    return allProds.filter(p => !deactivatedList.includes(p.id));
  });

  useEffect(() => {
    const fetchActiveProducts = () => {
      const deactivatedList = getDeactivatedList();
      const allProds = getProductos();
      setProductosActivos(allProds.filter(p => !deactivatedList.includes(p.id)));
    };

    // Escuchar posibles cambios externos en localStorage (por ejemplo si se activa/desactiva un producto desde el Admin)
    window.addEventListener('storage', fetchActiveProducts);
    return () => window.removeEventListener('storage', fetchActiveProducts);
  }, []);

  return (
    <div className="productos-grid" id="productos-grid" suppressHydrationWarning>
      {productosActivos.length > 0 ? (
        productosActivos.map(p => (
          <ProductCard 
            key={p.id} 
            producto={p} 
            onSelect={onSelectProduct} 
          />
        ))
      ) : (
        <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888', padding: '40px 0' }}>
          ✦ No hay productos disponibles en este momento ✦
        </div>
      )}
    </div>
  );
}

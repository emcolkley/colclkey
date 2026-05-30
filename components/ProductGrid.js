'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getProductos } from '../data/productos';

export default function ProductGrid({ onSelectProduct }) {
  const [productosActivos, setProductosActivos] = useState([]);

  useEffect(() => {
    // Leer los IDs desactivados de localStorage en el montaje del lado del cliente
    const fetchActiveProducts = () => {
      try {
        const deactivatedListRaw = localStorage.getItem('colkley_deactivated_ids');
        const deactivatedList = deactivatedListRaw ? JSON.parse(deactivatedListRaw) : [];
        const allProds = getProductos();
        
        // Filtrar productos que no estén desactivados
        const filtered = allProds.filter(p => !deactivatedList.includes(p.id));
        setProductosActivos(filtered);
      } catch (e) {
        console.error("Error fetching active products", e);
        setProductosActivos(getProductos());
      }
    };

    fetchActiveProducts();

    // Escuchar posibles cambios externos en localStorage (por ejemplo si se activa/desactiva un producto desde el Admin)
    window.addEventListener('storage', fetchActiveProducts);
    return () => window.removeEventListener('storage', fetchActiveProducts);
  }, []);

  return (
    <div className="productos-grid" id="productos-grid">
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

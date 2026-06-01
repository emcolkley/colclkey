'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getProductos, getCategoriasList } from '../data/productos';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

const BAR_CONTAINER_STYLE = {
  display: 'flex',
  overflowX: 'auto',
  gap: '8px',
  padding: '10px 4px 20px 4px',
  marginBottom: '20px',
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE/Edge
  maxWidth: '100%',
};

const BUTTON_STYLE = {
  flexShrink: 0,
  padding: '10px 18px',
  borderRadius: '24px',
  border: '1px solid #222',
  background: '#111',
  color: '#888',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const BUTTON_ACTIVE_STYLE = {
  ...BUTTON_STYLE,
  border: '1px solid #C9A84C',
  background: 'rgba(201, 168, 76, 0.1)',
  color: '#E8C96A',
  boxShadow: '0 0 12px rgba(201, 168, 76, 0.15)',
};

export default function ProductGrid({ onSelectProduct }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [categorias, setCategorias] = useState(() => getCategoriasList());

  // Lazy initializer que carga el estado inicial de productos activos (resuelve no-initialize-state)
  const [productosActivos, setProductosActivos] = useState(() => {
    const deactivatedList = getDeactivatedList();
    const allProds = getProductos();
    return allProds.filter(p => !deactivatedList.includes(p.id));
  });

  useEffect(() => {
    const fetchActiveProducts = async () => {
      if (isSupabaseConfigured) {
        try {
          // 1. Cargar productos activos de Supabase
          const { data: prods, error: errProds } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('id', { ascending: true });

          // 2. Cargar categorías activas de Supabase
          const { data: cats, error: errCats } = await supabase
            .from('categorias')
            .select('*')
            .order('id', { ascending: true });

          if (errProds || errCats) {
            console.error("Error loading products/categories from Supabase:", errProds, errCats);
            return;
          }

          if (prods) setProductosActivos(prods);
          if (cats) setCategorias(cats);
        } catch (e) {
          console.error("Error fetching active products:", e);
        }
      } else {
        const deactivatedList = getDeactivatedList();
        const allProds = getProductos();
        setProductosActivos(allProds.filter(p => !deactivatedList.includes(p.id)));
        setCategorias(getCategoriasList());
      }
    };

    fetchActiveProducts();

    // Escuchar posibles cambios externos en localStorage (para fallback local)
    if (!isSupabaseConfigured) {
      window.addEventListener('storage', fetchActiveProducts);
      return () => window.removeEventListener('storage', fetchActiveProducts);
    }
  }, []);

  const productosFiltrados = productosActivos.filter(p => {
    if (categoriaSeleccionada === 'todos') return true;
    return p.categoria === categoriaSeleccionada;
  });

  const selectedCatObj = categorias.find(c => c.id === categoriaSeleccionada);
  const selectedCatName = selectedCatObj ? selectedCatObj.nombre : '';

  return (
    <div>
      <style>{`
        .categoria-scroll-bar::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>

      {/* Selector de categorías horizontal */}
      <div 
        className="categoria-scroll-bar" 
        style={BAR_CONTAINER_STYLE}
        aria-label="Filtrar productos por categoría"
      >
        {categorias.filter(cat => cat.activo !== false).map(cat => {
          const isActive = cat.id === categoriaSeleccionada;
          return (
            <button
              type="button"
              key={cat.id}
              style={isActive ? BUTTON_ACTIVE_STYLE : BUTTON_STYLE}
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.emoji ? `${cat.emoji} ` : ''}{cat.nombre}
            </button>
          );
        })}
      </div>

      <div className="productos-grid" id="productos-grid" suppressHydrationWarning>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map(p => (
            <ProductCard 
              key={p.id} 
              producto={p} 
              onSelect={onSelectProduct} 
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888', padding: '60px 0', fontFamily: 'inherit' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '10px' }}>✦</span>
            Próximamente nuevos diseños en esta categoría
          </div>
        )}
      </div>

      {/* Botón WhatsApp de consulta de catálogo específico */}
      {categoriaSeleccionada !== 'todos' && selectedCatName && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <a
            href={`https://wa.me/5491100000000?text=${encodeURIComponent(`Hola! Me gustaría consultar el catálogo de: ${selectedCatName}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#25D366',
              color: '#FFF',
              padding: '14px 28px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.25)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 211, 102, 0.4)';
              e.currentTarget.style.backgroundColor = '#20ba56';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.25)';
              e.currentTarget.style.backgroundColor = '#25D366';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>💬</span>
            Consultar catálogo: {selectedCatName}
          </a>
        </div>
      )}
    </div>
  );
}

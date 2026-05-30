'use client';

import React from 'react';
import Link from 'next/link';

// Hook personalizado para el estado de administración
import useAdminState from './admin/useAdminState';

// Subcomponentes modulares de administración
import StatsCards from './admin/StatsCards';
import ProductsTable from './admin/ProductsTable';
import CouponsTable from './admin/CouponsTable';
import CategoriesTable from './admin/CategoriesTable';
import AddProductModal from './admin/AddProductModal';
import EditProductModal from './admin/EditProductModal';
import AddCouponModal from './admin/AddCouponModal';
import AddCategoryModal from './admin/AddCategoryModal';

// Mover constantes fijas al ámbito de módulo
const NAME_MAPPING = {
  "dorado": "Marco Dorado Clásico",
  "collage": "Marco Collage Romántico",
  "roca": "Cuadro en Roca",
  "taza": "Taza Personalizada",
  "llavero": "Llavero con Foto",
  "restauracion": "Restauración Profesional",
  "spotify_negro": "Spotify Minimalista Negro",
  "nordic_frame": "Nordic Frame Premium",
  "nordic_room": "Nordic Room Premium"
};

// Estilos constantes en módulo (resuelve no-inline-exhaustive-style)
const MAIN_CONTAINER_STYLE = { 
  padding: '40px 20px', 
  maxWidth: '1200px', 
  margin: '0 auto', 
  background: '#0A0A0A', 
  color: '#FFF' 
};

const HEADER_CONTAINER_STYLE = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  flexWrap: 'wrap', 
  gap: '20px', 
  marginBottom: '40px', 
  borderBottom: '1px solid #1A1A1A', 
  paddingBottom: '20px' 
};

const HEADER_TITLE_STYLE = { 
  fontFamily: 'Cinzel, serif', 
  fontSize: '2.2rem', 
  color: '#FFF', 
  margin: 0 
};

const HEADER_SUBTITLE_STYLE = { 
  color: '#888', 
  margin: '6px 0 0', 
  fontSize: '0.9rem' 
};

const HEADER_ACTIONS_STYLE = { 
  display: 'flex', 
  gap: '12px' 
};

const BUTTON_ACTION_STYLE = { 
  width: 'auto', 
  margin: 0 
};

const LINK_STORE_STYLE = { 
  textDecoration: 'none', 
  display: 'flex', 
  alignItems: 'center', 
  margin: 0, 
  width: 'auto',
  color: '#C9A84C'
};

const TAB_CONTAINER_STYLE = { 
  display: 'flex', 
  gap: '24px', 
  borderBottom: '1px solid #1A1A1A', 
  marginBottom: '30px' 
};

const TAB_BUTTON_STYLE_ACTIVE = {
  background: 'none', 
  border: 'none', 
  color: '#C9A84C',
  padding: '12px 6px', 
  fontSize: '1rem', 
  fontWeight: 600, 
  cursor: 'pointer',
  borderBottom: '3px solid #C9A84C'
};

const TAB_BUTTON_STYLE_INACTIVE = {
  ...TAB_BUTTON_STYLE_ACTIVE,
  color: '#777',
  borderBottom: 'none'
};

// Subcomponentes funcionales auxiliares (resuelve no-giant-component)
function DashboardHeader({ activeTab, onOpenAddModal, onOpenCouponModal, onOpenCategoryModal }) {
  return (
    <div className="admin-header" style={HEADER_CONTAINER_STYLE}>
      <div>
        <h1 style={HEADER_TITLE_STYLE}>Panel de Control</h1>
        <p style={HEADER_SUBTITLE_STYLE}>Administración central y métricas en tiempo real</p>
      </div>
      <div style={HEADER_ACTIONS_STYLE}>
        {activeTab === 'productos' && (
          <button type="button" className="panel-btn" onClick={onOpenAddModal} style={BUTTON_ACTION_STYLE}>
            ➕ Nuevo Producto
          </button>
        )}
        {activeTab === 'cupones' && (
          <button type="button" className="panel-btn" onClick={onOpenCouponModal} style={BUTTON_ACTION_STYLE}>
            ➕ Nuevo Cupón
          </button>
        )}
        {activeTab === 'categorias' && (
          <button type="button" className="panel-btn" onClick={onOpenCategoryModal} style={BUTTON_ACTION_STYLE}>
            ➕ Nueva Categoría
          </button>
        )}
        <Link href="/" className="panel-btn secondary" style={LINK_STORE_STYLE}>
          Ir a la tienda →
        </Link>
      </div>
    </div>
  );
}

function FilterBar({ filters, onUpdateFilters, availableMarcos, availableFormats }) {
  return (
    <div className="filters-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <label htmlFor="filter-search" style={{ display: 'none' }}>Buscar productos</label>
      <input 
        id="filter-search"
        type="text" 
        className="filter-search-input"
        placeholder="🔍 Buscar productos..." 
        value={filters.search}
        onChange={(e) => onUpdateFilters({ search: e.target.value })}
      />
      
      <label htmlFor="filter-tipo" style={{ display: 'none' }}>Filtrar por tipo</label>
      <select 
        id="filter-tipo"
        className="filter-select-input"
        value={filters.tipo} 
        onChange={(e) => onUpdateFilters({ tipo: e.target.value })}
      >
        <option value="">📂 Todos los Tipos</option>
        <option value="marco">Marcos</option>
        <option value="roca">Rocas</option>
        <option value="taza">Tazas</option>
        <option value="llavero">Llaveros</option>
        <option value="restauracion">Restauración</option>
      </select>
      
      <label htmlFor="filter-marco" style={{ display: 'none' }}>Filtrar por marco</label>
      <select 
        id="filter-marco"
        className="filter-select-input"
        value={filters.marco} 
        onChange={(e) => onUpdateFilters({ marco: e.target.value })}
      >
        <option value="">🖼️ Todos los Marcos</option>
        {availableMarcos.map(m => (
          <option key={m} value={m}>{NAME_MAPPING[m] || m}</option>
        ))}
      </select>
      
      <label htmlFor="filter-formato" style={{ display: 'none' }}>Filtrar por formato</label>
      <select 
        id="filter-formato"
        className="filter-select-input"
        value={filters.formato} 
        onChange={(e) => onUpdateFilters({ formato: e.target.value })}
      >
        <option value="">📏 Todos los Tamaños</option>
        {availableFormats.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );
}

function TabSelector({ activeTab, onSelectTab }) {
  return (
    <div className="admin-tabs" style={TAB_CONTAINER_STYLE}>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
        onClick={() => onSelectTab('productos')}
        style={activeTab === 'productos' ? TAB_BUTTON_STYLE_ACTIVE : TAB_BUTTON_STYLE_INACTIVE}
      >
        🖼️ Catálogo de Productos
      </button>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'cupones' ? 'active' : ''}`}
        onClick={() => onSelectTab('cupones')}
        style={activeTab === 'cupones' ? TAB_BUTTON_STYLE_ACTIVE : TAB_BUTTON_STYLE_INACTIVE}
      >
        🏷️ Cupones de Descuento
      </button>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
        onClick={() => onSelectTab('categorias')}
        style={activeTab === 'categorias' ? TAB_BUTTON_STYLE_ACTIVE : TAB_BUTTON_STYLE_INACTIVE}
      >
        🎗️ Cinta de Opciones
      </button>
    </div>
  );
}

// Extracción de panel de catálogo para cumplir con no-giant-component
function ProductosPanel({ filters, onUpdateFilters, availableMarcos, availableFormats, filteredProducts, deactivatedIds, onToggleStatus, onEdit, onDelete }) {
  return (
    <div id="content-tab-productos">
      <FilterBar 
        filters={filters}
        onUpdateFilters={onUpdateFilters}
        availableMarcos={availableMarcos}
        availableFormats={availableFormats}
      />
      <ProductsTable 
        products={filteredProducts}
        deactivatedIds={deactivatedIds}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const {
    dataState,
    uiState,
    setUiState,
    toggleModal,
    updateFilters,
    availableFormats,
    availableMarcos,
    handleToggleProductStatus,
    handleToggleCouponStatus,
    handleEliminarCupon,
    handleEliminarProducto,
    handleGuardarNuevoProducto,
    handleAbrirModalEdit,
    handleGuardarEdicionProducto,
    handleGuardarNuevoCupon,
    handleGuardarCategoria,
    handleEliminarCategoria,
    handleAbrirModalCategoryEdit,
    filteredProducts
  } = useAdminState();

  return (
    <main className="admin-container" style={MAIN_CONTAINER_STYLE}>
      
      {/* HEADER DE ADMINISTRACIÓN */}
      <DashboardHeader 
        activeTab={uiState.activeTab}
        onOpenAddModal={() => toggleModal('modalAdd', true)}
        onOpenCouponModal={() => toggleModal('modalCoupon', true)}
        onOpenCategoryModal={() => {
          setUiState(prev => ({ ...prev, selectedCategory: null }));
          toggleModal('modalCategory', true);
        }}
      />

      {/* TARJETAS DE ESTADÍSTICAS */}
      <StatsCards 
        totalProductos={dataState.productosList.length}
        activos={dataState.productosList.length - dataState.deactivatedIds.length}
        desactivados={dataState.deactivatedIds.length}
        visitasHoy={dataState.visitas.hoy}
        visitasMes={dataState.visitas.mes}
      />

      {/* PESTAÑAS (TABS) */}
      <TabSelector 
        activeTab={uiState.activeTab}
        onSelectTab={(tab) => toggleModal('activeTab', tab)}
      />

      {/* CONTENIDO DE TAB PRODUCTOS */}
      {uiState.activeTab === 'productos' && (
        <ProductosPanel 
          filters={uiState}
          onUpdateFilters={updateFilters}
          availableMarcos={availableMarcos}
          availableFormats={availableFormats}
          filteredProducts={filteredProducts}
          deactivatedIds={dataState.deactivatedIds}
          onToggleStatus={handleToggleProductStatus}
          onEdit={handleAbrirModalEdit}
          onDelete={handleEliminarProducto}
        />
      )}

      {/* CONTENIDO DE TAB CUPONES */}
      {uiState.activeTab === 'cupones' && (
        <div id="content-tab-cupones">
          <CouponsTable 
            coupons={dataState.cupones}
            onToggleStatus={handleToggleCouponStatus}
            onDelete={handleEliminarCupon}
          />
        </div>
      )}

      {/* CONTENIDO DE TAB CATEGORIAS */}
      {uiState.activeTab === 'categorias' && (
        <div id="content-tab-categorias">
          <CategoriesTable 
            categories={dataState.categorias}
            onEdit={handleAbrirModalCategoryEdit}
            onDelete={handleEliminarCategoria}
          />
        </div>
      )}

      {/* MODALES SEMÁNTICOS NATIVAS <dialog> */}
      <AddProductModal 
        isOpen={uiState.modalAdd}
        onClose={() => toggleModal('modalAdd', false)}
        onSave={handleGuardarNuevoProducto}
        categorias={dataState.categorias}
      />

      <EditProductModal 
        isOpen={uiState.modalEdit}
        onClose={() => toggleModal('modalEdit', false)}
        product={uiState.selectedProduct}
        onSave={handleGuardarEdicionProducto}
        categorias={dataState.categorias}
      />

      <AddCouponModal 
        isOpen={uiState.modalCoupon}
        onClose={() => toggleModal('modalCoupon', false)}
        onSave={handleGuardarNuevoCupon}
      />

      <AddCategoryModal 
        isOpen={uiState.modalCategory}
        onClose={() => {
          toggleModal('modalCategory', false);
          // Limpiar categoría seleccionada al cerrar
          setUiState(prev => ({ ...prev, selectedCategory: null }));
        }}
        category={uiState.selectedCategory}
        onSave={handleGuardarCategoria}
      />

    </main>
  );
}

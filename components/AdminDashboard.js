'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductos } from '../data/productos';
import CanvasPreview from './CanvasPreview';

// Mover constantes fijas al ámbito de módulo (resuelve rerender-memo y static-value de react-doctor)
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

// Comprimir imagen para localStorage - Pure helper function in module scope (resuelve prefer-module-scope-pure-function)
const compressImage = (base64Str, maxWidth = 600, maxHeight = 600) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64Str;
  });
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('productos');
  const [productosList, setProductosList] = useState([]);
  const [deactivatedIds, setDeactivatedIds] = useState([]);
  const [visitasHoy, setVisitasHoy] = useState(0);
  const [visitasMes, setVisitasMes] = useState(0);

  // Filtros
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [marcoFilter, setMarcoFilter] = useState('');
  const [formatoFilter, setFormatoFilter] = useState('');

  // Opciones dinámicas de filtros
  const [availableFormats, setAvailableFormats] = useState([]);
  const [availableMarcos, setAvailableMarcos] = useState([]);

  // Cupones
  const [cupones, setCupones] = useState([]);

  // Modales y estados de formularios
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Formulario agregar producto
  const [addNombre, setAddNombre] = useState('');
  const [addPrecio, setAddPrecio] = useState('');
  const [addDescuento, setAddDescuento] = useState(0);
  const [addTipo, setAddTipo] = useState('marco');
  const [addDesc, setAddDesc] = useState('');
  const [addTamanos, setAddTamanos] = useState('');
  const [addDiseno, setAddDiseno] = useState('nordic_frame');
  const [addImgBase64, setAddImgBase64] = useState(null);

  // Formulario editar producto
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editDescuento, setEditDescuento] = useState(0);
  const [editTipo, setEditTipo] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTamanos, setEditTamanos] = useState('');
  const [editDiseno, setEditDiseno] = useState('');
  const [editImgBase64, setEditImgBase64] = useState(null);

  // Formulario agregar cupón
  const [couponCode, setCouponCode] = useState('');
  const [couponTipo, setCouponTipo] = useState('porcentaje');
  const [couponValor, setCouponValor] = useState('');
  const [couponMinCompra, setCouponMinCompra] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    // 1. Productos
    setProductosList(getProductos());

    // 2. IDs Desactivados
    try {
      const list = localStorage.getItem('colkley_deactivated_ids');
      setDeactivatedIds(list ? JSON.parse(list) : []);
    } catch(e) { console.error(e); }

    // 3. Visitas
    try {
      setVisitasHoy(parseInt(localStorage.getItem('colkley_visitas_hoy') || '0', 10));
      setVisitasMes(parseInt(localStorage.getItem('colkley_visitas_mes') || '0', 10));
    } catch(e) { console.error(e); }

    // 4. Cupones
    try {
      const list = localStorage.getItem('colkley_cupones');
      setCupones(list ? JSON.parse(list) : [
        { codigo: "BIENVENIDA", tipo: "porcentaje", valor: 10, minCompra: 0, activo: true }
      ]);
    } catch(e) { console.error(e); }
  }, []);

  // Extraer tamaños y marcos dinámicamente cuando cambie la lista de productos
  useEffect(() => {
    const formats = new Set();
    const marcos = new Set();

    productosList.forEach(p => {
      if (p.tamanos) p.tamanos.forEach(t => formats.add(t.trim()));
      if (p.diseño) marcos.add(p.diseño.trim());
    });

    setAvailableFormats(Array.from(formats).sort());
    setAvailableMarcos(Array.from(marcos).sort());
  }, [productosList]);

  // Alternar el estado activo/inactivo de un producto
  const handleToggleProductStatus = (id) => {
    let updated;
    if (deactivatedIds.includes(id)) {
      updated = deactivatedIds.filter(x => x !== id);
    } else {
      updated = [...deactivatedIds, id];
    }
    setDeactivatedIds(updated);
    localStorage.setItem('colkley_deactivated_ids', JSON.stringify(updated));
  };

  // Alternar estado de cupón
  const handleToggleCouponStatus = (codigo) => {
    const updated = cupones.map(c => {
      if (c.codigo === codigo) {
        return { ...c, activo: !c.activo };
      }
      return c;
    });
    setCupones(updated);
    localStorage.setItem('colkley_cupones', JSON.stringify(updated));
  };

  // Eliminar cupón
  const handleEliminarCupon = (codigo) => {
    if (!confirm(`⚠️ ¿Estás seguro de que querés eliminar el cupón "${codigo}"?`)) return;
    const updated = cupones.filter(c => c.codigo !== codigo);
    setCupones(updated);
    localStorage.setItem('colkley_cupones', JSON.stringify(updated));
  };

  // Eliminar producto personalizado
  const handleEliminarProducto = (id) => {
    if (!confirm("⚠️ ¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.")) return;
    
    try {
      const custom = localStorage.getItem('colkley_custom_productos');
      let customList = custom ? JSON.parse(custom) : [];
      customList = customList.filter(p => p.id !== id);
      localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));

      // Limpiar también su desactivación si existía
      const updatedDeactivated = deactivatedIds.filter(x => x !== id);
      setDeactivatedIds(updatedDeactivated);
      localStorage.setItem('colkley_deactivated_ids', JSON.stringify(updatedDeactivated));

      // Refrescar lista de productos
      setProductosList(getProductos());
    } catch (e) {
      console.error(e);
    }
  };

  // Archivo agregar cargado
  const handleAddFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAddImgBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Guardar nuevo producto
  const handleGuardarNuevoProducto = (e) => {
    e.preventDefault();
    if (!addNombre || !addPrecio) {
      alert("Completá los campos requeridos");
      return;
    }
    if (!addImgBase64) {
      alert("📸 Por favor, carga una imagen de muestra.");
      return;
    }

    // Iteración en una sola pasada usando flatMap (resuelve js-flatmap-filter)
    const sizes = addTamanos.split(',').flatMap(s => s.trim() ? [s.trim()] : []);

    compressImage(addImgBase64).then(compressed => {
      const newProd = {
        id: Date.now(),
        nombre: addNombre,
        tipo: addTipo,
        precio: parseFloat(addPrecio),
        descuento: parseInt(addDescuento, 10) || 0,
        desc: addDesc,
        tamanos: sizes,
        diseño: addDiseno,
        imagenBase64: compressed,
        nuevo: true,
        isCustom: true
      };

      try {
        const custom = localStorage.getItem('colkley_custom_productos');
        const customList = custom ? JSON.parse(custom) : [];
        customList.push(newProd);
        localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));

        // Reset y cerrar
        setAddNombre('');
        setAddPrecio('');
        setAddDescuento(0);
        setAddDesc('');
        setAddTamanos('');
        setAddImgBase64(null);
        setShowAddModal(false);

        // Refrescar
        setProductosList(getProductos());
      } catch (err) {
        alert("❌ Error al guardar producto. La imagen puede ser demasiado grande.");
      }
    });
  };

  // Cargar datos para editar
  const handleAbrirModalEdit = (p) => {
    setEditId(p.id);
    setEditNombre(p.nombre);
    setEditPrecio(p.precio);
    setEditDescuento(p.descuento || 0);
    setEditDesc(p.desc || '');
    setEditTamanos(p.tamanos ? p.tamanos.join(', ') : '');
    setEditTipo(p.tipo || 'marco');
    setEditDiseno(p.diseño || 'nordic_frame');
    setEditImgBase64(null); // Solo se reemplaza si sube una nueva
    setShowEditModal(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditImgBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Guardar edición
  const handleGuardarEdicionProducto = (e) => {
    e.preventDefault();
    // Iteración en una sola pasada usando flatMap (resuelve js-flatmap-filter)
    const sizes = editTamanos.split(',').flatMap(s => s.trim() ? [s.trim()] : []);
    const existing = productosList.find(x => x.id === editId);

    const saveOverride = (base64Img) => {
      const updatedProd = {
        id: editId,
        nombre: editNombre,
        tipo: editTipo,
        precio: parseFloat(editPrecio),
        descuento: parseInt(editDescuento, 10) || 0,
        desc: editDesc,
        tamanos: sizes,
        diseño: editDiseno,
        imagenBase64: base64Img,
        nuevo: existing ? existing.nuevo : true,
        isCustom: true // Forzamos true para que se almacene en custom de localStorage
      };

      try {
        const custom = localStorage.getItem('colkley_custom_productos');
        let customList = custom ? JSON.parse(custom) : [];

        const index = customList.findIndex(c => c.id === editId);
        if (index !== -1) {
          customList[index] = updatedProd;
        } else {
          customList.push(updatedProd);
        }
        localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));

        setShowEditModal(false);
        setProductosList(getProductos());
      } catch (err) {
        alert("❌ Error al guardar. Intenta con una imagen de muestra más liviana.");
      }
    };

    if (editImgBase64) {
      compressImage(editImgBase64).then(compressed => {
        saveOverride(compressed);
      });
    } else {
      saveOverride(existing ? existing.imagenBase64 : null);
    }
  };

  // Guardar Cupón
  const handleGuardarNuevoCupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code || !couponValor) {
      alert("Completá los campos requeridos");
      return;
    }

    const newCoupon = {
      codigo: code,
      tipo: couponTipo,
      valor: parseFloat(couponValor),
      minCompra: parseFloat(couponMinCompra) || 0,
      activo: true
    };

    try {
      if (cupones.some(c => c.codigo === code)) {
        alert("⚠️ Ya existe un cupón con este código.");
        return;
      }

      const updated = [...cupones, newCoupon];
      setCupones(updated);
      localStorage.setItem('colkley_cupones', JSON.stringify(updated));

      setCouponCode('');
      setCouponValor('');
      setCouponMinCompra('');
      setShowCouponModal(false);
    } catch(err) {
      alert("❌ Error al guardar el cupón");
    }
  };

  // Filtrado de productos en frontend
  const filteredProducts = productosList.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          (p.desc && p.desc.toLowerCase().includes(search.toLowerCase()));
    const matchesTipo = tipoFilter ? p.tipo === tipoFilter : true;
    const matchesMarco = marcoFilter ? p.diseño === marcoFilter : true;
    const matchesFormat = formatoFilter ? p.tamanos && p.tamanos.some(sz => sz.trim() === formatoFilter) : true;

    return matchesSearch && matchesTipo && matchesMarco && matchesFormat;
  });

  return (
    <main className="admin-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', background: '#0A0A0A', color: '#FFF' }}>
      
      {/* HEADER DE ADMINISTRACIÓN */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #1A1A1A', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', color: '#FFF', margin: 0 }}>Panel de Control</h1>
          <p style={{ color: '#888', margin: '6px 0 0', fontSize: '0.9rem' }}>Administración central y métricas en tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {activeTab === 'productos' ? (
            <button className="panel-btn" onClick={() => setShowAddModal(true)}>
              ➕ Nuevo Producto
            </button>
          ) : (
            <button className="panel-btn" onClick={() => setShowCouponModal(true)}>
              ➕ Nuevo Cupón
            </button>
          )}
          {/* Usar Link en vez de <a> para navegación óptima en Next.js (resuelve nextjs-no-a-element) */}
          <Link href="/" className="panel-btn secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Ir a la tienda →
          </Link>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#E8C96A', fontWeight: 600 }}>{productosList.length}</div>
          <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>Total Productos</div>
        </div>
        <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#4A9B6F', fontWeight: 600 }}>{productosList.length - deactivatedIds.length}</div>
          <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>Activos</div>
        </div>
        <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#E74C3C', fontWeight: 600 }}>{deactivatedIds.length}</div>
          <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>Desactivados</div>
        </div>
        <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontWeight: 600 }}>{visitasHoy.toLocaleString()}</div>
          <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>Visitas Hoy</div>
        </div>
        <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontWeight: 600 }}>{visitasMes.toLocaleString()}</div>
          <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>Visitas Mes</div>
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #1A1A1A', marginBottom: '30px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'productos' ? '#C9A84C' : '#777',
            padding: '12px 6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'productos' ? '3px solid #C9A84C' : 'none'
          }}
        >
          🖼️ Catálogo de Productos
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'cupones' ? 'active' : ''}`}
          onClick={() => setActiveTab('cupones')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'cupones' ? '#C9A84C' : '#777',
            padding: '12px 6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'cupones' ? '3px solid #C9A84C' : 'none'
          }}
        >
          🏷️ Cupones de Descuento
        </button>
      </div>

      {/* CONTENIDO DE TAB PRODUCTOS */}
      {activeTab === 'productos' && (
        <div id="content-tab-productos">
          
          {/* BARRA DE FILTROS */}
          <div className="filters-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="🔍 Buscar productos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '2', minWidth: '200px', background: '#111', border: '1px solid #222',
                color: '#FFF', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem'
              }}
            />
            <select 
              value={tipoFilter} 
              onChange={(e) => setTipoFilter(e.target.value)}
              style={{
                flex: '1', minWidth: '150px', background: '#111', border: '1px solid #222',
                color: '#FFF', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem'
              }}
            >
              <option value="">📂 Todos los Tipos</option>
              <option value="marco">Marcos</option>
              <option value="roca">Rocas</option>
              <option value="taza">Tazas</option>
              <option value="llavero">Llaveros</option>
              <option value="restauracion">Restauración</option>
            </select>
            <select 
              value={marcoFilter} 
              onChange={(e) => setMarcoFilter(e.target.value)}
              style={{
                flex: '1', minWidth: '150px', background: '#111', border: '1px solid #222',
                color: '#FFF', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem'
              }}
            >
              <option value="">🖼️ Todos los Marcos</option>
              {availableMarcos.map(m => (
                <option key={m} value={m}>{NAME_MAPPING[m] || m}</option>
              ))}
            </select>
            <select 
              value={formatoFilter} 
              onChange={(e) => setFormatoFilter(e.target.value)}
              style={{
                flex: '1', minWidth: '150px', background: '#111', border: '1px solid #222',
                color: '#FFF', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem'
              }}
            >
              <option value="">📏 Todos los Tamaños</option>
              {availableFormats.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* TABLA DE PRODUCTOS */}
          <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid #222', borderRadius: '12px' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222', background: '#151515' }}>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Muestra</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Producto</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Precio Base</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isActive = !deactivatedIds.includes(p.id);
                  const finalPrice = p.descuento ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <CanvasPreview 
                          diseño={p.diseño} 
                          fotoBase64={p.imagenBase64 || null} 
                          width={120} 
                          height={114} 
                          style={{ width: '120px', height: '114px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 500 }}>
                        {p.nombre}
                        {p.nuevo && <span className="tag-nuevo">NUEVO</span>}
                        <div style={{ fontSize: '0.72rem', color: '#6A6A6A', fontWeight: 300, marginTop: '4px' }}>
                          Diseño: {p.diseño} | Tipo: {p.tipo}
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '0.9rem' }}>
                        {p.descuento ? (
                          <>
                            <div style={{ fontSize: '0.72rem', textDecoration: 'line-through', opacity: 0.5, marginBottom: '2px' }}>${p.precio.toLocaleString()}</div>
                            <div style={{ color: '#E8C96A', fontWeight: 600 }}>${finalPrice.toLocaleString()} <span style={{ background: '#C9A84C', color: '#0A0A0A', fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', marginLeft: '2px', verticalAlign: 'middle' }}>-{p.descuento}%</span></div>
                          </>
                        ) : (
                          `$${p.precio.toLocaleString()}`
                        )}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span className={`badge-status ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', paddingRight: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                          <label className="switch" style={{ margin: 0 }}>
                            <input 
                              type="checkbox" 
                              checked={isActive} 
                              onChange={() => handleToggleProductStatus(p.id)}
                            />
                            <span className="slider"></span>
                          </label>
                          <button 
                            className="edit-btn" 
                            onClick={() => handleAbrirModalEdit(p)}
                            style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' }}
                            title="Editar Producto"
                          >
                            ✏️
                          </button>
                          {p.isCustom && (
                            <button 
                              className="delete-btn" 
                              onClick={() => handleEliminarProducto(p.id)}
                              style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' }}
                              title="Eliminar Producto"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB CUPONES */}
      {activeTab === 'cupones' && (
        <div id="content-tab-cupones">
          <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid #222', borderRadius: '12px' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222', background: '#151515' }}>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Código</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Tipo de Beneficio</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Valor</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Mínimo de Compra</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: '16px 20px', color: '#666', fontWeight: 600, textAlign: 'right', paddingRight: '2.5rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cupones.map(c => (
                  <tr key={c.codigo} style={{ borderBottom: '1px solid #1A1A1A' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#E8C96A', letterSpacing: '1px' }}>
                      {c.codigo}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#B8C0CC' }}>
                      {c.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 500, color: '#C9A84C' }}>
                      {c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString()}`}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#888' }}>
                      {c.minCompra && c.minCompra > 0 ? `$${c.minCompra.toLocaleString()}` : 'Sin mínimo'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge-status ${c.activo ? 'active' : 'inactive'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', paddingRight: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <label className="switch" style={{ margin: 0 }}>
                          <input 
                            type="checkbox" 
                            checked={c.activo} 
                            onChange={() => handleToggleCouponStatus(c.codigo)}
                          />
                          <span className="slider"></span>
                        </label>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleEliminarCupon(c.codigo)}
                          style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PRODUCTO */}
      {showAddModal && (
        <div className="admin-modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '30px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0 }}>Nuevo Producto</h3>
            
            <form onSubmit={handleGuardarNuevoProducto}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input type="text" className="form-input" required value={addNombre} onChange={(e) => setAddNombre(e.target.value)} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Precio Base ($) *</label>
                  <input type="number" className="form-input" required value={addPrecio} onChange={(e) => setAddPrecio(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Descuento (%)</label>
                  <input type="number" className="form-input" min="0" max="100" value={addDescuento} onChange={(e) => setAddDescuento(e.target.value)} />
                </div>
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Tipo de Producto</label>
                  <select className="form-input" value={addTipo} onChange={(e) => setAddTipo(e.target.value)}>
                    <option value="marco">Marcos</option>
                    <option value="roca">Rocas</option>
                    <option value="taza">Tazas</option>
                    <option value="llavero">Llaveros</option>
                    <option value="restauracion">Restauración</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Diseño / Plantilla</label>
                  <select className="form-input" value={addDiseno} onChange={(e) => setAddDiseno(e.target.value)}>
                    <option value="nordic_frame">Nordic Frame Premium</option>
                    <option value="nordic_room">Nordic Room Premium</option>
                    <option value="spotify_negro">Spotify Minimalista Negro</option>
                    <option value="dorado">Marco Dorado Clásico</option>
                    <option value="collage">Marco Collage Romántico</option>
                    <option value="roca">Cuadro en Roca</option>
                    <option value="taza">Taza Personalizada</option>
                    <option value="llavero">Llavero con Foto</option>
                    <option value="restauracion">Restauración Profesional</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tamaños / Formatos (separados por coma)</label>
                <input type="text" className="form-input" placeholder="Ej: 30x40, 40x60, 50x70" value={addTamanos} onChange={(e) => setAddTamanos(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows="3" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Foto de Muestra (JPG/PNG) *</label>
                <input type="file" accept="image/*" className="form-input" onChange={handleAddFileChange} />
                {addImgBase64 && <div style={{ color: '#4A9B6F', fontSize: '0.8rem', marginTop: '6px' }}>✅ Imagen cargada y lista para compresión</div>}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="panel-btn secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="panel-btn">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRODUCTO */}
      {showEditModal && (
        <div className="admin-modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '30px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0 }}>Editar Producto</h3>
            
            <form onSubmit={handleGuardarEdicionProducto}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input type="text" className="form-input" required value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Precio Base ($) *</label>
                  <input type="number" className="form-input" required value={editPrecio} onChange={(e) => setEditPrecio(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Descuento (%)</label>
                  <input type="number" className="form-input" min="0" max="100" value={editDescuento} onChange={(e) => setEditDescuento(e.target.value)} />
                </div>
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Tipo de Producto</label>
                  <select className="form-input" value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
                    <option value="marco">Marcos</option>
                    <option value="roca">Rocas</option>
                    <option value="taza">Tazas</option>
                    <option value="llavero">Llaveros</option>
                    <option value="restauracion">Restauración</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Diseño / Plantilla</label>
                  <select className="form-input" value={editDiseno} onChange={(e) => setEditDiseno(e.target.value)}>
                    <option value="nordic_frame">Nordic Frame Premium</option>
                    <option value="nordic_room">Nordic Room Premium</option>
                    <option value="spotify_negro">Spotify Minimalista Negro</option>
                    <option value="dorado">Marco Dorado Clásico</option>
                    <option value="collage">Marco Collage Romántico</option>
                    <option value="roca">Cuadro en Roca</option>
                    <option value="taza">Taza Personalizada</option>
                    <option value="llavero">Llavero con Foto</option>
                    <option value="restauracion">Restauración Profesional</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tamaños / Formatos (separados por coma)</label>
                <input type="text" className="form-input" placeholder="Ej: 30x40, 40x60" value={editTamanos} onChange={(e) => setEditTamanos(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows="3" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Foto de Muestra (opcional - subir solo para reemplazar)</label>
                <input type="file" accept="image/*" className="form-input" onChange={handleEditFileChange} />
                {editImgBase64 && <div style={{ color: '#4A9B6F', fontSize: '0.8rem', marginTop: '6px' }}>✅ Nueva imagen cargada</div>}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="panel-btn secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="panel-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR CUPÓN */}
      {showCouponModal && (
        <div className="admin-modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '30px', maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#E8C96A', fontSize: '1.5rem', marginTop: 0 }}>Nuevo Cupón</h3>
            
            <form onSubmit={handleGuardarNuevoCupon}>
              <div className="form-group">
                <label className="form-label">Código del Cupón *</label>
                <input type="text" className="form-input" required placeholder="Ej: DESCUENTO10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Beneficio</label>
                <select className="form-input" value={couponTipo} onChange={(e) => setCouponTipo(e.target.value)}>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="fijo">Monto Fijo ($)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valor del Descuento *</label>
                <input type="number" className="form-input" required placeholder={couponTipo === 'porcentaje' ? 'Ej: 10 (%)' : 'Ej: 1500 ($)'} value={couponValor} onChange={(e) => setCouponValor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Compra Mínima ($) (0 para sin mínimo)</label>
                <input type="number" className="form-input" placeholder="Ej: 5000" value={couponMinCompra} onChange={(e) => setCouponMinCompra(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="panel-btn secondary" onClick={() => setShowCouponModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="panel-btn">
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

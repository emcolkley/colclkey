import { useState, useMemo } from 'react';
import { getProductos, getCategoriasList, getGiftWrapConfig } from '../../data/productos';

// Helper en módulo para encapsular lectura de desactivados
export const getDeactivatedList = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('colkley_deactivated_ids:v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

// Helper en módulo para encapsular lectura de productos customizados
export const getCustomProductos = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('colkley_custom_productos:v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

// Helper de compresión de imágenes
export const compressImage = (base64Str, maxWidth = 600, maxHeight = 600) => {
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

export default function useAdminState() {
  // 1. Consolidated Data State (prefer-useReducer)
  const [dataState, setDataState] = useState(() => {
    const deactivatedList = getDeactivatedList();
    let hoy = 0;
    let mes = 0;
    let cuponesList = [{ codigo: "BIENVENIDA", tipo: "porcentaje", valor: 10, minCompra: 0, activo: true }];
    
    if (typeof window !== 'undefined') {
      try {
        hoy = parseInt(localStorage.getItem('colkley_visitas_hoy:v1') || '0', 10);
        mes = parseInt(localStorage.getItem('colkley_visitas_mes:v1') || '0', 10);
        
        const cup = localStorage.getItem('colkley_cupones:v1');
        if (cup) cuponesList = JSON.parse(cup);
      } catch (e) {
        console.error(e);
      }
    }
    
    return {
      productosList: getProductos(),
      deactivatedIds: deactivatedList,
      visitas: { hoy, mes },
      cupones: cuponesList,
      categorias: getCategoriasList(),
      giftWrapConfig: getGiftWrapConfig()
    };
  });

  // 2. Consolidated UI State
  const [uiState, setUiState] = useState({
    activeTab: 'productos',
    search: '',
    tipo: '',
    marco: '',
    formato: '',
    modalAdd: false,
    modalEdit: false,
    modalCoupon: false,
    modalCategory: false,
    selectedProduct: null,
    selectedCategory: null
  });

  const toggleModal = (modalKey, val) => {
    setUiState(prev => ({ ...prev, [modalKey]: val }));
  };

  const updateFilters = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  // Cómputos en renderizado usando useMemo
  const availableFormats = useMemo(() => {
    const formats = new Set();
    dataState.productosList.forEach(p => {
      if (p.tamanos) p.tamanos.forEach(t => formats.add(t.trim()));
    });
    return Array.from(formats).sort();
  }, [dataState.productosList]);

  const availableMarcos = useMemo(() => {
    const marcos = new Set();
    dataState.productosList.forEach(p => {
      if (p.diseño) marcos.add(p.diseño.trim());
    });
    return Array.from(marcos).sort();
  }, [dataState.productosList]);

  // Alternar el estado activo/inactivo de un producto
  const handleToggleProductStatus = (id) => {
    let updated;
    if (dataState.deactivatedIds.includes(id)) {
      updated = dataState.deactivatedIds.filter(x => x !== id);
    } else {
      updated = [...dataState.deactivatedIds, id];
    }
    setDataState(prev => ({ ...prev, deactivatedIds: updated }));
    localStorage.setItem('colkley_deactivated_ids:v1', JSON.stringify(updated));
  };

  // Alternar estado de cupón
  const handleToggleCouponStatus = (codigo) => {
    const updated = dataState.cupones.map(c => {
      if (c.codigo === codigo) {
        return { ...c, activo: !c.activo };
      }
      return c;
    });
    setDataState(prev => ({ ...prev, cupones: updated }));
    localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
  };

  // Eliminar cupón
  const handleEliminarCupon = (codigo) => {
    if (!confirm(`⚠️ ¿Estás seguro de que querés eliminar el cupón "${codigo}"?`)) return;
    const updated = dataState.cupones.filter(c => c.codigo !== codigo);
    setDataState(prev => ({ ...prev, cupones: updated }));
    localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
  };

  // Eliminar producto personalizado
  const handleEliminarProducto = (id) => {
    if (!confirm("⚠️ ¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.")) return;
    
    try {
      let customList = getCustomProductos();
      customList = customList.filter(p => p.id !== id);
      localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

      const updatedDeactivated = dataState.deactivatedIds.filter(x => x !== id);
      localStorage.setItem('colkley_deactivated_ids:v1', JSON.stringify(updatedDeactivated));

      setDataState(prev => ({
        ...prev,
        deactivatedIds: updatedDeactivated,
        productosList: getProductos()
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Guardar nuevo producto
  const handleGuardarNuevoProducto = (prodData) => {
    const sizes = prodData.tamanos.split(',').flatMap(s => s.trim() ? [s.trim()] : []);

    compressImage(prodData.imgBase64).then(compressed => {
      const newProd = {
        id: Date.now(),
        nombre: prodData.nombre,
        tipo: prodData.tipo,
        categoria: prodData.categoria || 'otros',
        precio: prodData.precio,
        descuento: prodData.descuento,
        desc: prodData.desc,
        tamanos: sizes,
        diseño: prodData.diseño,
        imagenBase64: compressed,
        nuevo: true,
        isCustom: true
      };

      try {
        const customList = getCustomProductos();
        customList.push(newProd);
        localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

        toggleModal('modalAdd', false);
        setDataState(prev => ({ ...prev, productosList: getProductos() }));
      } catch (err) {
        alert("❌ Error al guardar producto. La imagen puede ser demasiado grande.");
      }
    });
  };

  // Cargar datos para editar
  const handleAbrirModalEdit = (p) => {
    setUiState(prev => ({ ...prev, selectedProduct: p, modalEdit: true }));
  };

  // Guardar edición
  const handleGuardarEdicionProducto = (editData) => {
    const sizes = editData.tamanos.split(',').flatMap(s => s.trim() ? [s.trim()] : []);
    const existing = dataState.productosList.find(x => x.id === editData.id);

    const saveOverride = (base64Img) => {
      const updatedProd = {
        id: editData.id,
        nombre: editData.nombre,
        tipo: editData.tipo,
        categoria: editData.categoria || 'otros',
        precio: editData.precio,
        descuento: editData.descuento,
        desc: editData.desc,
        tamanos: sizes,
        diseño: editData.diseño,
        imagenBase64: base64Img,
        nuevo: existing ? existing.nuevo : true,
        isCustom: true
      };

      try {
        let customList = getCustomProductos();
        const index = customList.findIndex(c => c.id === editData.id);
        if (index !== -1) {
          customList[index] = updatedProd;
        } else {
          customList.push(updatedProd);
        }
        localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

        toggleModal('modalEdit', false);
        setDataState(prev => ({ ...prev, productosList: getProductos() }));
      } catch (err) {
        alert("❌ Error al guardar. Intenta con una imagen de muestra más liviana.");
      }
    };

    if (editData.imgBase64) {
      compressImage(editData.imgBase64).then(compressed => {
        saveOverride(compressed);
      });
    } else {
      saveOverride(existing ? existing.imagenBase64 : null);
    }
  };

  // Guardar Cupón
  const handleGuardarNuevoCupon = (couponData) => {
    if (dataState.cupones.some(c => c.codigo === couponData.codigo)) {
      alert("⚠️ Ya existe un cupón con este código.");
      return;
    }

    const newCoupon = {
      codigo: couponData.codigo,
      tipo: couponData.tipo,
      valor: couponData.valor,
      minCompra: couponData.minCompra,
      activo: true
    };

    try {
      const updated = [...dataState.cupones, newCoupon];
      setDataState(prev => ({ ...prev, cupones: updated }));
      localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
      toggleModal('modalCoupon', false);
    } catch(err) {
      alert("❌ Error al guardar el cupón");
    }
  };

  // Guardar o Editar Categoría
  const handleGuardarCategoria = (catData) => {
    const existing = dataState.categorias.find(c => c.id === catData.id);
    let updated;
    if (existing) {
      updated = dataState.categorias.map(c => c.id === catData.id ? catData : c);
    } else {
      updated = [...dataState.categorias, catData];
    }

    setDataState(prev => ({ ...prev, categorias: updated }));
    localStorage.setItem('colkley_categorias:v1', JSON.stringify(updated));
    setUiState(prev => ({ ...prev, selectedCategory: null, modalCategory: false }));
  };

  // Eliminar Categoría
  const handleEliminarCategoria = (id) => {
    if (id === 'todos') {
      alert("⚠️ La categoría 'Todos' es del sistema y no puede eliminarse.");
      return;
    }
    if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar esta categoría? Esto podría afectar a los productos asociados.")) return;

    const updated = dataState.categorias.filter(c => c.id !== id);
    setDataState(prev => ({ ...prev, categorias: updated }));
    localStorage.setItem('colkley_categorias:v1', JSON.stringify(updated));
  };

  // Abrir Modal de Categoría para editar
  const handleAbrirModalCategoryEdit = (cat) => {
    setUiState(prev => ({ ...prev, selectedCategory: cat, modalCategory: true }));
  };

  // Guardar configuración del servicio de regalo
  const handleGuardarGiftWrapConfig = (newConfig) => {
    setDataState(prev => ({ ...prev, giftWrapConfig: newConfig }));
    localStorage.setItem('colkley_gift_wrap_config:v1', JSON.stringify(newConfig));
  };

  // Filtrado de productos en frontend
  const filteredProducts = useMemo(() => {
    return dataState.productosList.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(uiState.search.toLowerCase()) || 
                            (p.desc && p.desc.toLowerCase().includes(uiState.search.toLowerCase()));
      const matchesTipo = uiState.tipo ? p.tipo === uiState.tipo : true;
      const matchesMarco = uiState.marco ? p.diseño === uiState.marco : true;
      const matchesFormat = uiState.formato ? p.tamanos && p.tamanos.some(sz => sz.trim() === uiState.formato) : true;

      return matchesSearch && matchesTipo && matchesMarco && matchesFormat;
    });
  }, [dataState.productosList, uiState]);

  return {
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
    handleGuardarGiftWrapConfig,
    filteredProducts
  };
}

import { useState, useMemo, useEffect } from 'react';
import { getProductos, getCategoriasList, getGiftWrapConfig, getDeletedStaticIds } from '../../data/productos';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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
    let prodList = getProductos();
    let catList = getCategoriasList();
    
    if (typeof window !== 'undefined') {
      try {
        hoy = parseInt(localStorage.getItem('colkley_visitas_hoy:v1') || '0', 10);
        mes = parseInt(localStorage.getItem('colkley_visitas_mes:v1') || '0', 10);
        
        const cup = localStorage.getItem('colkley_cupones:v1');
        if (cup) cuponesList = JSON.parse(cup);

        if (isSupabaseConfigured) {
          const cachedProds = localStorage.getItem('colkley_supabase_cached_productos:v1');
          if (cachedProds) {
            const parsed = JSON.parse(cachedProds);
            if (Array.isArray(parsed) && parsed.length > 0) prodList = parsed;
          }
          const cachedCats = localStorage.getItem('colkley_supabase_cached_categorias:v1');
          if (cachedCats) {
            const parsed = JSON.parse(cachedCats);
            if (Array.isArray(parsed) && parsed.length > 0) catList = parsed;
          }
          const cachedCups = localStorage.getItem('colkley_supabase_cached_cupones:v1');
          if (cachedCups) {
            const parsed = JSON.parse(cachedCups);
            if (Array.isArray(parsed) && parsed.length > 0) cuponesList = parsed;
          }
        }
      } catch (e) {
        console.error("Error reading cached data in useAdminState init", e);
      }
    }
    
    return {
      productosList: prodList,
      deactivatedIds: deactivatedList,
      visitas: { hoy, mes },
      cupones: cuponesList,
      categorias: catList,
      giftWrapConfig: getGiftWrapConfig()
    };
  });

  // Carga asíncrona de datos desde Supabase si está configurado
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchSupabaseData = async () => {
      try {
        // 1. Cargar productos
        const { data: prods, error: errProds } = await supabase
          .from('productos')
          .select('*')
          .order('id', { ascending: true });

        // 2. Cargar categorías
        const { data: cats, error: errCats } = await supabase
          .from('categorias')
          .select('*')
          .order('orden', { ascending: true });

        // 3. Cargar cupones
        const { data: cups, error: errCups } = await supabase
          .from('cupones')
          .select('*')
          .order('codigo', { ascending: true });

        // 4. Cargar configuraciones (gift_wrap, visitas)
        const { data: settings, error: errSettings } = await supabase
          .from('settings')
          .select('*');

        if (errProds || errCats || errCups || errSettings) {
          console.error("Error cargando datos de Supabase:", { errProds, errCats, errCups, errSettings });
          return;
        }

        const deactivatedIds = prods.filter(p => !p.activo).map(p => p.id);
        
        let giftWrapConfig = getGiftWrapConfig();
        let visitas = { hoy: dataState.visitas.hoy, mes: dataState.visitas.mes };
        
        if (settings) {
          const gw = settings.find(s => s.key === 'gift_wrap');
          if (gw) giftWrapConfig = gw.value;
          
          const vis = settings.find(s => s.key === 'visitas');
          if (vis) visitas = vis.value;
        }

        // Persistir caché en localStorage para visitas rápidas e instantáneas sin saltos de datos
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('colkley_supabase_cached_productos:v1', JSON.stringify(prods));
            localStorage.setItem('colkley_supabase_cached_categorias:v1', JSON.stringify(cats));
            localStorage.setItem('colkley_supabase_cached_cupones:v1', JSON.stringify(cups || []));
          } catch (e) {
            console.error("Error writing supabase caches in admin", e);
          }
        }

        setDataState({
          productosList: prods,
          deactivatedIds: deactivatedIds,
          visitas: visitas,
          cupones: cups || [],
          categorias: cats || [],
          giftWrapConfig: giftWrapConfig
        });
      } catch (e) {
        console.error("Error en fetchSupabaseData:", e);
      }
    };

    fetchSupabaseData();
  }, []);

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
      if (p.tipo === 'marco' && p.diseño) {
        marcos.add(p.diseño.trim());
      }
    });
    return Array.from(marcos).sort();
  }, [dataState.productosList]);

  // Alternar el estado activo/inactivo de un producto
  const handleToggleProductStatus = async (id) => {
    const isDeactivated = dataState.deactivatedIds.includes(id);
    let updatedDeactivated;
    if (isDeactivated) {
      updatedDeactivated = dataState.deactivatedIds.filter(x => x !== id);
    } else {
      updatedDeactivated = [...dataState.deactivatedIds, id];
    }
    setDataState(prev => ({ ...prev, deactivatedIds: updatedDeactivated }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('productos')
        .update({ activo: isDeactivated })
        .eq('id', id);
      if (error) console.error("Error updating product status in Supabase:", error);
    } else {
      localStorage.setItem('colkley_deactivated_ids:v1', JSON.stringify(updatedDeactivated));
    }
  };

  // Alternar estado de cupón
  const handleToggleCouponStatus = async (codigo) => {
    const cup = dataState.cupones.find(c => c.codigo === codigo);
    if (!cup) return;
    const newActivo = !cup.activo;

    const updated = dataState.cupones.map(c => {
      if (c.codigo === codigo) {
        return { ...c, activo: newActivo };
      }
      return c;
    });
    setDataState(prev => ({ ...prev, cupones: updated }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cupones')
        .update({ activo: newActivo })
        .eq('codigo', codigo);
      if (error) console.error(error);
    } else {
      localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
    }
  };

  // Eliminar cupón
  const handleEliminarCupon = async (codigo) => {
    if (!confirm(`⚠️ ¿Estás seguro de que querés eliminar el cupón "${codigo}"?`)) return;
    const updated = dataState.cupones.filter(c => c.codigo !== codigo);
    setDataState(prev => ({ ...prev, cupones: updated }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cupones')
        .delete()
        .eq('codigo', codigo);
      if (error) console.error(error);
    } else {
      localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
    }
  };

  // Eliminar producto personalizado o estático
  const handleEliminarProducto = async (id) => {
    if (!confirm("⚠️ ¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.")) return;
    
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      if (error) {
        alert("❌ Error al eliminar producto en Supabase: " + error.message);
        return;
      }
      
      const updatedDeactivated = dataState.deactivatedIds.filter(x => x !== id);
      const updatedList = dataState.productosList.filter(p => p.id !== id);
      setDataState(prev => ({
        ...prev,
        deactivatedIds: updatedDeactivated,
        productosList: updatedList
      }));
    } else {
      try {
        // 1. Si es personalizado o editado
        let customList = getCustomProductos();
        customList = customList.filter(p => p.id !== id);
        localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

        // 2. Si es estático (IDs 1 a 9)
        const staticIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (staticIds.includes(id)) {
          const deletedStatic = getDeletedStaticIds();
          if (!deletedStatic.includes(id)) {
            const updatedDeleted = [...deletedStatic, id];
            localStorage.setItem('colkley_deleted_static_ids:v1', JSON.stringify(updatedDeleted));
          }
        }

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
    }
  };

  // Guardar nuevo producto
  const handleGuardarNuevoProducto = (prodData) => {
    const sizes = prodData.tamanos.split(',').flatMap(s => s.trim() ? [s.trim()] : []);

    compressImage(prodData.imgBase64).then(async (compressed) => {
      const newProd = {
        id: Date.now(),
        nombre: prodData.nombre,
        tipo: prodData.tipo,
        categoria: prodData.categoria || 'otros',
        precio: parseInt(prodData.precio, 10),
        descuento: parseInt(prodData.descuento || '0', 10),
        desc: prodData.desc,
        tamanos: sizes,
        diseño: prodData.diseño,
        imagenBase64: compressed,
        nuevo: true,
        is_custom: true,
        activo: true
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('productos')
          .insert([newProd]);
        if (error) {
          alert("❌ Error al guardar producto en Supabase: " + error.message);
          return;
        }
        toggleModal('modalAdd', false);
        const { data: prods } = await supabase.from('productos').select('*').order('id', { ascending: true });
        if (prods) setDataState(prev => ({ ...prev, productosList: prods }));
      } else {
        const localProd = { ...newProd, isCustom: true, imagenBase64: compressed };
        try {
          const customList = getCustomProductos();
          customList.push(localProd);
          localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

          toggleModal('modalAdd', false);
          setDataState(prev => ({ ...prev, productosList: getProductos() }));
        } catch (err) {
          alert("❌ Error al guardar producto. La imagen puede ser demasiado grande.");
        }
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

    const saveOverride = async (base64Img) => {
      const updatedProd = {
        id: editData.id,
        nombre: editData.nombre,
        tipo: editData.tipo,
        categoria: editData.categoria || 'otros',
        precio: parseInt(editData.precio, 10),
        descuento: parseInt(editData.descuento || '0', 10),
        desc: editData.desc,
        tamanos: sizes,
        diseño: editData.diseño,
        imagenBase64: base64Img,
        nuevo: existing ? existing.nuevo : true,
        is_custom: true,
        activo: existing ? existing.activo : true
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('productos')
          .upsert([updatedProd]);
        if (error) {
          alert("❌ Error al guardar edición en Supabase: " + error.message);
          return;
        }
        toggleModal('modalEdit', false);
        const { data: prods } = await supabase.from('productos').select('*').order('id', { ascending: true });
        if (prods) setDataState(prev => ({ ...prev, productosList: prods }));
      } else {
        const localProd = { ...updatedProd, isCustom: true, imagenBase64: base64Img };
        try {
          let customList = getCustomProductos();
          const index = customList.findIndex(c => c.id === editData.id);
          if (index !== -1) {
            customList[index] = localProd;
          } else {
            customList.push(localProd);
          }
          localStorage.setItem('colkley_custom_productos:v1', JSON.stringify(customList));

          toggleModal('modalEdit', false);
          setDataState(prev => ({ ...prev, productosList: getProductos() }));
        } catch (err) {
          alert("❌ Error al guardar. Intenta con una imagen de muestra más liviana.");
        }
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
  const handleGuardarNuevoCupon = async (couponData) => {
    if (dataState.cupones.some(c => c.codigo === couponData.codigo)) {
      alert("⚠️ Ya existe un cupón con este código.");
      return;
    }

    const newCoupon = {
      codigo: couponData.codigo,
      tipo: couponData.tipo,
      valor: parseFloat(couponData.valor),
      minCompra: parseFloat(couponData.minCompra || '0'),
      activo: true
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cupones')
        .insert([newCoupon]);
      if (error) {
        alert("❌ Error al guardar el cupón en Supabase: " + error.message);
        return;
      }
      toggleModal('modalCoupon', false);
      const { data: cups } = await supabase.from('cupones').select('*').order('codigo', { ascending: true });
      if (cups) setDataState(prev => ({ ...prev, cupones: cups }));
    } else {
      try {
        const updated = [...dataState.cupones, newCoupon];
        setDataState(prev => ({ ...prev, cupones: updated }));
        localStorage.setItem('colkley_cupones:v1', JSON.stringify(updated));
        toggleModal('modalCoupon', false);
      } catch(err) {
        alert("❌ Error al guardar el cupón");
      }
    }
  };

  // Guardar o Editar Categoría
  const handleGuardarCategoria = async (catData) => {
    const existing = dataState.categorias.find(c => c.id === catData.id);
    const updatedCat = {
      id: catData.id,
      nombre: catData.nombre,
      emoji: catData.emoji,
      activo: existing ? (existing.activo !== false) : true
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('categorias')
        .upsert([updatedCat]);
      if (error) {
        alert("❌ Error al guardar la categoría en Supabase: " + error.message);
        return;
      }
      setUiState(prev => ({ ...prev, selectedCategory: null, modalCategory: false }));
      const { data: cats } = await supabase.from('categorias').select('*').order('orden', { ascending: true });
      if (cats) setDataState(prev => ({ ...prev, categorias: cats }));
    } else {
      let updated;
      if (existing) {
        updated = dataState.categorias.map(c => c.id === catData.id ? { ...catData, activo: c.activo !== false } : c);
      } else {
        updated = [...dataState.categorias, { ...catData, activo: true }];
      }

      setDataState(prev => ({ ...prev, categorias: updated }));
      localStorage.setItem('colkley_categorias:v1', JSON.stringify(updated));
      setUiState(prev => ({ ...prev, selectedCategory: null, modalCategory: false }));
    }
  };

  // Alternar el estado activo/inactivo de una categoría
  const handleToggleCategoryStatus = async (id) => {
    if (id === 'todos') {
      alert("⚠️ La categoría 'Todos' es del sistema y no se puede desactivar.");
      return;
    }
    const cat = dataState.categorias.find(c => c.id === id);
    if (!cat) return;
    const newActivo = cat.activo === false ? true : false;

    const updated = dataState.categorias.map(c => {
      if (c.id === id) {
        return { ...c, activo: newActivo };
      }
      return c;
    });
    setDataState(prev => ({ ...prev, categorias: updated }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('categorias')
        .update({ activo: newActivo })
        .eq('id', id);
      if (error) console.error(error);
    } else {
      localStorage.setItem('colkley_categorias:v1', JSON.stringify(updated));
    }
  };

  // Eliminar Categoría
  const handleEliminarCategoria = async (id) => {
    if (id === 'todos') {
      alert("⚠️ La categoría 'Todos' es del sistema y no puede eliminarse.");
      return;
    }
    if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar esta categoría? Esto podría afectar a los productos asociados.")) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      if (error) {
        alert("❌ Error al eliminar categoría en Supabase: " + error.message);
        return;
      }
      const { data: cats } = await supabase.from('categorias').select('*').order('orden', { ascending: true });
      if (cats) setDataState(prev => ({ ...prev, categorias: cats }));
    } else {
      const updated = dataState.categorias.filter(c => c.id !== id);
      setDataState(prev => ({ ...prev, categorias: updated }));
      localStorage.setItem('colkley_categorias:v1', JSON.stringify(updated));
    }
  };

  // Abrir Modal de Categoría para editar
  const handleAbrirModalCategoryEdit = (cat) => {
    setUiState(prev => ({ ...prev, selectedCategory: cat, modalCategory: true }));
  };

  // Guardar configuración del servicio de regalo
  const handleGuardarGiftWrapConfig = async (newConfig) => {
    setDataState(prev => ({ ...prev, giftWrapConfig: newConfig }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('settings')
        .upsert([{ key: 'gift_wrap', value: newConfig }]);
      if (error) console.error("Error saving gift wrap config to Supabase:", error);
    } else {
      localStorage.setItem('colkley_gift_wrap_config:v1', JSON.stringify(newConfig));
    }
  };

  // Reordenar categorías
  const handleReorderCategory = async (id, direction) => {
    const list = [...dataState.categorias];
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return; // Fuera de límites

    // Intercambiar elementos
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // Actualizar el índice 'orden'
    const updatedList = list.map((cat, idx) => ({
      ...cat,
      orden: idx
    }));

    setDataState(prev => ({ ...prev, categorias: updatedList }));

    if (isSupabaseConfigured) {
      const mappedCats = updatedList.map(c => ({
        id: c.id,
        nombre: c.nombre,
        emoji: c.emoji,
        activo: c.activo !== false,
        orden: c.orden
      }));

      const { error } = await supabase
        .from('categorias')
        .upsert(mappedCats);
      if (error) console.error("Error al reordenar categorías en Supabase:", error);
    } else {
      localStorage.setItem('colkley_categorias:v1', JSON.stringify(updatedList));
    }
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
    handleToggleCategoryStatus,
    handleEliminarCategoria,
    handleAbrirModalCategoryEdit,
    handleGuardarGiftWrapConfig,
    handleReorderCategory,
    filteredProducts
  };
}

// ══════════════════════════════════════════
// ESTADO Y PERSISTENCIA DEL ADMINISTRADOR
// ══════════════════════════════════════════

// Variables para guardar temporalmente las imágenes cargadas en Base64
let newProductImageBase64 = null;
let editProductImageBase64 = null;

// Filtros del Administrador
let filterSearch = "";
let filterTipo = "";
let filterFormato = "";
let filterMarco = "";

// Obtiene la lista de IDs desactivados desde localStorage
function getDeactivatedIDs() {
  try {
    const list = localStorage.getItem('colkley_deactivated_ids');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error("Error al acceder a localStorage", e);
    return [];
  }
}

// Alterna el estado de un producto (activo/desactivado)
function toggleProductStatus(id) {
  let deactivated = getDeactivatedIDs();
  if (deactivated.includes(id)) {
    deactivated = deactivated.filter(dId => dId !== id);
  } else {
    deactivated.push(id);
  }
  localStorage.setItem('colkley_deactivated_ids', JSON.stringify(deactivated));
  
  // Re-renderizar el panel administrativo
  renderAdminDashboard();
}

// Dibuja el panel administrativo
function renderAdminDashboard() {
  const tbody = document.getElementById('admin-productos-rows');
  if (!tbody) return;

  const deactivated = getDeactivatedIDs();
  const allProds = getProductos();
  const totalCount = allProds.length;
  const inactiveCount = allProds.filter(p => deactivated.includes(p.id)).length;
  const activeCount = totalCount - inactiveCount;

  // Cargar estadísticas de visitas reales en el navegador
  let visitasHoy = localStorage.getItem('colkley_visitas_hoy') || "0";
  let visitasMes = localStorage.getItem('colkley_visitas_mes') || "0";

  // Actualizar estadísticas con estética premium
  document.getElementById('stat-total').textContent = totalCount;
  document.getElementById('stat-activos').textContent = activeCount;
  document.getElementById('stat-desactivados').textContent = inactiveCount;
  document.getElementById('stat-visitas-hoy').textContent = parseInt(visitasHoy, 10).toLocaleString();
  document.getElementById('stat-visitas-mes').textContent = parseInt(visitasMes, 10).toLocaleString();

  // 1. Poblar dinámicamente los selectores de marcos y tamaños del catálogo real
  populateMarcoFilter();
  populateSizeFilter();

  // 2. Aplicar filtros de búsqueda, tipo de producto, marco y formato
  let filteredProds = allProds;
  if (filterSearch) {
    filteredProds = filteredProds.filter(p => 
      p.nombre.toLowerCase().includes(filterSearch) || 
      (p.desc && p.desc.toLowerCase().includes(filterSearch))
    );
  }
  if (filterTipo) {
    filteredProds = filteredProds.filter(p => p.tipo === filterTipo);
  }
  if (filterMarco) {
    filteredProds = filteredProds.filter(p => p.diseño === filterMarco);
  }
  if (filterFormato) {
    filteredProds = filteredProds.filter(p => p.tamanos && p.tamanos.some(sz => sz.trim() === filterFormato));
  }

  // 3. Renderizar filas filtradas en la tabla
  tbody.innerHTML = filteredProds.map(p => {
    const isActive = !deactivated.includes(p.id);
    
    // Cálculo de precio final con descuento para la vista administrativa
    const finalPrice = p.descuento ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio;
    const priceDisplay = p.descuento ? `
      <div style="font-size: 0.72rem; text-decoration: line-through; opacity: 0.5; margin-bottom: 2px;">$${p.precio.toLocaleString()}</div>
      <div style="color: #E8C96A; font-weight: 600;">$${finalPrice.toLocaleString()} <span style="background: #C9A84C; color: #0A0A0A; font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-left: 2px; vertical-align: middle;">-${p.descuento}%</span></div>
    ` : `$${p.precio.toLocaleString()}`;

    // Botón de edición en oro disponible para TODOS los productos
    const editBtn = `
      <button class="edit-btn" onclick="abrirModalEdit(${p.id})" style="background: transparent; border: none; color: #C9A84C; font-size: 1.1rem; cursor: pointer; transition: color 0.2s, transform 0.2s; padding: 4px;" title="Editar Producto" onmouseover="this.style.color='#E8C96A'; this.style.transform='scale(1.15)';" onmouseout="this.style.color='#C9A84C'; this.style.transform='scale(1)';">✏️</button>
    `;

    // Botón de eliminación en oro disponible únicamente para productos personalizados o modificados
    const deleteBtn = p.isCustom ? `
      <button class="delete-btn" onclick="eliminarProducto(${p.id})" style="background: transparent; border: none; color: #C9A84C; font-size: 1.1rem; cursor: pointer; transition: color 0.2s, transform 0.2s; padding: 4px;" title="Eliminar Producto" onmouseover="this.style.color='#E8C96A'; this.style.transform='scale(1.15)';" onmouseout="this.style.color='#C9A84C'; this.style.transform='scale(1)';">🗑️</button>
    ` : '';
    
    return `
      <tr>
        <td>
          <canvas id="admin-thumb-${p.id}" class="admin-thumb-canvas" width="120" height="114"></canvas>
        </td>
        <td style="font-weight: 500; font-size: 0.88rem; color: #F5F5F5;">
          ${p.nombre}
          ${p.nuevo ? '<span class="tag-nuevo">NUEVO</span>' : ''}
          <div style="font-size: 0.72rem; color: #6A6A6A; font-weight: 300; margin-top: 4px;">
            Diseño: ${p.diseño} | Tipo: ${p.tipo}
          </div>
        </td>
        <td style="font-family: 'Cinzel', serif; color: #C9A84C; font-weight: 500; font-size: 0.86rem; line-height: 1.2;">
          ${priceDisplay}
        </td>
        <td>
          <span class="badge-status ${isActive ? 'active' : 'inactive'}">
            ${isActive ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td style="text-align: right; padding-right: 2rem;">
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; min-height: 34px;">
            <label class="switch" style="margin: 0;">
              <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleProductStatus(${p.id})">
              <span class="slider"></span>
            </label>
            ${editBtn}
            ${deleteBtn}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 4. Dibujar los mini canvases correspondientes a las filas filtradas
  filteredProds.forEach(p => {
    const canvas = document.getElementById(`admin-thumb-${p.id}`);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (p.imagenBase64) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = p.imagenBase64;
      } else {
        dibujarDiseño(ctx, p.diseño, canvas.width, canvas.height, null);
      }
    }
  });
}

// ══════════════════════════════════════════
// FILTROS Y BÚSQUEDAS DINÁMICAS (ADMINISTRADOR)
// ══════════════════════════════════════════

// Aplica los filtros seleccionados por el administrador
function applyAdminFilters() {
  filterSearch = document.getElementById('admin-search').value.toLowerCase().trim();
  filterTipo = document.getElementById('admin-filter-tipo').value;
  filterMarco = document.getElementById('admin-filter-marco').value;
  filterFormato = document.getElementById('admin-filter-formato').value;
  
  renderAdminDashboard();
}

// Popula dinámicamente el selector de formatos buscando todos los tamaños únicos del catálogo
function populateSizeFilter() {
  const select = document.getElementById('admin-filter-formato');
  if (!select) return;
  
  const currentVal = select.value;
  const allProds = getProductos();
  const sizesSet = new Set();
  
  allProds.forEach(p => {
    if (p.tamanos && Array.isArray(p.tamanos)) {
      p.tamanos.forEach(sz => {
        if (sz) sizesSet.add(sz.trim());
      });
    }
  });
  
  const sortedSizes = Array.from(sizesSet).sort();
  
  select.innerHTML = '<option value="">📏 Todos los Tamaños</option>' + 
    sortedSizes.map(sz => `<option value="${sz}">${sz}</option>`).join('');
    
  if (sortedSizes.includes(currentVal)) {
    select.value = currentVal;
  } else {
    select.value = "";
    filterFormato = "";
  }
}

// Popula dinámicamente el selector de marcos buscando todos los diseños únicos del catálogo
function populateMarcoFilter() {
  const select = document.getElementById('admin-filter-marco');
  if (!select) return;
  
  const currentVal = select.value;
  const allProds = getProductos();
  const marcosSet = new Set();
  
  allProds.forEach(p => {
    if (p.diseño) {
      marcosSet.add(p.diseño.trim());
    }
  });
  
  const sortedMarcos = Array.from(marcosSet).sort();
  
  const nameMapping = {
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
  
  select.innerHTML = '<option value="">🖼️ Todos los Marcos</option>' + 
    sortedMarcos.map(m => {
      const displayName = nameMapping[m] || m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<option value="${m}">${displayName}</option>`;
    }).join('');
    
  if (sortedMarcos.includes(currentVal)) {
    select.value = currentVal;
  } else {
    select.value = "";
    filterMarco = "";
  }
}

// ══════════════════════════════════════════
// GESTIÓN DEL MODAL DE AGREGAR PRODUCTOS
// ══════════════════════════════════════════

// Abre el modal
function abrirModalAdd() {
  document.getElementById('form-add-producto').reset();
  document.getElementById('add-file-preview-text').style.display = 'none';
  newProductImageBase64 = null;
  document.getElementById('modal-add-producto').style.display = 'flex';
}

// Cierra el modal
function cerrarModalAdd() {
  document.getElementById('modal-add-producto').style.display = 'none';
}

// Escuchar subida de archivos
document.addEventListener('DOMContentLoaded', () => {
  // Mockup creación
  const fileInput = document.getElementById('add-file');
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        newProductImageBase64 = e.target.result;
        document.getElementById('add-file-preview-text').style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // Mockup edición
  const fileEditInput = document.getElementById('edit-file');
  if (fileEditInput) {
    fileEditInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        editProductImageBase64 = e.target.result;
        document.getElementById('edit-file-preview-text').style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }
});

// Comprime una imagen a dimensiones máximas de 600px en base64 jpeg
function compressImage(base64Str, maxWidth = 600, maxHeight = 600) {
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
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% de calidad para tamaño super liviano
    };
    img.src = base64Str;
  });
}

// Guarda el nuevo producto en localStorage
function guardarNuevoProducto(event) {
  event.preventDefault();

  const name = document.getElementById('add-nombre').value.trim();
  const price = parseFloat(document.getElementById('add-precio').value);
  const discount = parseInt(document.getElementById('add-descuento').value, 10) || 0;
  const type = document.getElementById('add-tipo').value;
  const description = document.getElementById('add-desc').value.trim();
  const sizesRaw = document.getElementById('add-tamanos').value;
  const design = document.getElementById('add-diseno').value;

  if (!newProductImageBase64) {
    alert("📸 Por favor, carga una imagen de muestra.");
    return;
  }

  const sizes = sizesRaw.split(',').map(s => s.trim()).filter(Boolean);

  // Comprimir la imagen de forma inteligente antes de guardarla
  compressImage(newProductImageBase64).then(compressedBase64 => {
    const newProd = {
      id: Date.now(),
      nombre: name,
      tipo: type,
      precio: price,
      descuento: discount,
      desc: description,
      tamanos: sizes,
      diseño: design,
      imagenBase64: compressedBase64,
      nuevo: true,
      isCustom: true
    };

    try {
      const custom = localStorage.getItem('colkley_custom_productos');
      const customList = custom ? JSON.parse(custom) : [];
      customList.push(newProd);
      localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));

      cerrarModalAdd();
      renderAdminDashboard();
    } catch (e) {
      console.error("Error al guardar en localStorage", e);
      alert("❌ Error al guardar producto. La imagen puede ser demasiado grande.");
    }
  });
}

// ══════════════════════════════════════════
// GESTIÓN DEL MODAL DE EDICIÓN DE PRODUCTOS
// ══════════════════════════════════════════

// Abre el modal de edición cargando los datos del producto actual
function abrirModalEdit(id) {
  const allProds = getProductos();
  const p = allProds.find(item => item.id === id);
  if (!p) return;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-nombre').value = p.nombre;
  document.getElementById('edit-precio').value = p.precio;
  document.getElementById('edit-descuento').value = p.descuento || 0;
  document.getElementById('edit-desc').value = p.desc;
  document.getElementById('edit-tamanos').value = p.tamanos.join(', ');
  document.getElementById('edit-tipo').value = p.tipo;
  document.getElementById('edit-diseno').value = p.diseño;
  
  // Limpiar selector de archivo de edición
  document.getElementById('edit-file').value = '';
  document.getElementById('edit-file-preview-text').style.display = 'none';
  editProductImageBase64 = null;

  document.getElementById('modal-edit-producto').style.display = 'flex';
}

// Cierra el modal de edición
function cerrarModalEdit() {
  document.getElementById('modal-edit-producto').style.display = 'none';
}

// Guarda los cambios de edición en localStorage
function guardarEdicionProducto(event) {
  event.preventDefault();

  const id = parseFloat(document.getElementById('edit-id').value);
  const name = document.getElementById('edit-nombre').value.trim();
  const price = parseFloat(document.getElementById('edit-precio').value);
  const discount = parseInt(document.getElementById('edit-descuento').value, 10) || 0;
  const type = document.getElementById('edit-tipo').value;
  const description = document.getElementById('edit-desc').value.trim();
  const sizesRaw = document.getElementById('edit-tamanos').value;
  const design = document.getElementById('edit-diseno').value;

  const sizes = sizesRaw.split(',').map(s => s.trim()).filter(Boolean);
  const existingProd = getProductos().find(p => p.id === id);

  const saveProductOverride = (base64Img) => {
    const updatedProd = {
      id: id,
      nombre: name,
      tipo: type,
      precio: price,
      descuento: discount,
      desc: description,
      tamanos: sizes,
      diseño: design,
      imagenBase64: base64Img,
      nuevo: existingProd ? existingProd.nuevo : true,
      isCustom: true // Forzamos true para permitir su borrado o override en localStorage
    };

    try {
      const custom = localStorage.getItem('colkley_custom_productos');
      let customList = custom ? JSON.parse(custom) : [];

      const index = customList.findIndex(c => c.id === id);
      if (index !== -1) {
        customList[index] = updatedProd;
      } else {
        customList.push(updatedProd);
      }
      localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));

      cerrarModalEdit();
      renderAdminDashboard();
    } catch (e) {
      console.error("Error al guardar la edición en localStorage", e);
      alert("❌ Error al guardar los cambios. Intenta con una imagen de muestra más liviana.");
    }
  };

  if (editProductImageBase64) {
    compressImage(editProductImageBase64).then(compressed => {
      saveProductOverride(compressed);
    });
  } else {
    saveProductOverride(existingProd ? existingProd.imagenBase64 : null);
  }
}

// Elimina un producto personalizado o modificado
function eliminarProducto(id) {
  if (!confirm("⚠️ ¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.")) return;
  
  try {
    const custom = localStorage.getItem('colkley_custom_productos');
    let customList = custom ? JSON.parse(custom) : [];
    customList = customList.filter(p => p.id !== id);
    localStorage.setItem('colkley_deactivated_ids', JSON.stringify(getDeactivatedIDs().filter(dId => dId !== id)));
    localStorage.setItem('colkley_custom_productos', JSON.stringify(customList));
    
    renderAdminDashboard();
  } catch (e) {
    console.error("Error al eliminar producto", e);
  }
}

// ══════════════════════════════════════════
// NAVEGACIÓN ENTRE PESTAÑAS (TABS)
// ══════════════════════════════════════════

function switchAdminTab(tabName) {
  const btnProds = document.getElementById('btn-tab-productos');
  const btnCupones = document.getElementById('btn-tab-cupones');
  const contentProds = document.getElementById('content-tab-productos');
  const contentCupones = document.getElementById('content-tab-cupones');

  if (tabName === 'productos') {
    btnProds.classList.add('active');
    btnProds.style.borderBottom = '3px solid #C9A84C';
    btnProds.style.color = '#C9A84C';
    
    btnCupones.classList.remove('active');
    btnCupones.style.borderBottom = 'none';
    btnCupones.style.color = '#777';
    
    contentProds.style.display = 'block';
    contentCupones.style.display = 'none';
    
    renderAdminDashboard();
  } else if (tabName === 'cupones') {
    btnCupones.classList.add('active');
    btnCupones.style.borderBottom = '3px solid #C9A84C';
    btnCupones.style.color = '#C9A84C';
    
    btnProds.classList.remove('active');
    btnProds.style.borderBottom = 'none';
    btnProds.style.color = '#777';
    
    contentCupones.style.display = 'block';
    contentProds.style.display = 'none';
    
    renderCuponesDashboard();
  }
}

// ══════════════════════════════════════════
// PANEL DE ADMINISTRACIÓN DE CUPONES
// ══════════════════════════════════════════

// Obtiene la lista de cupones de localStorage (o default)
function getCupones() {
  try {
    const list = localStorage.getItem('colkley_cupones');
    if (!list) {
      const defaultCupones = [
        { codigo: "BIENVENIDA", tipo: "porcentaje", valor: 10, minCompra: 0, activo: true }
      ];
      localStorage.setItem('colkley_cupones', JSON.stringify(defaultCupones));
      return defaultCupones;
    }
    return JSON.parse(list);
  } catch (e) {
    console.error("Error al leer cupones", e);
    return [];
  }
}

// Dibuja el panel administrativo de cupones
function renderCuponesDashboard() {
  const tbody = document.getElementById('admin-cupones-rows');
  if (!tbody) return;

  const cupones = getCupones();

  tbody.innerHTML = cupones.map(c => {
    const typeLabel = c.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto Fijo ($)';
    const valueLabel = c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString()}`;
    const minCompraLabel = c.minCompra && c.minCompra > 0 ? `$${c.minCompra.toLocaleString()}` : 'Sin mínimo';

    return `
      <tr>
        <td style="font-weight: 600; font-size: 0.92rem; color: #E8C96A; letter-spacing: 1px; padding: 12px 1rem;">
          ${c.codigo}
        </td>
        <td style="font-size: 0.8rem; color: #B8C0CC;">
          ${typeLabel}
        </td>
        <td style="font-weight: 500; color: #C9A84C;">
          ${valueLabel}
        </td>
        <td style="font-size: 0.8rem; color: #888;">
          ${minCompraLabel}
        </td>
        <td>
          <span class="badge-status ${c.activo ? 'active' : 'inactive'}">
            ${c.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td style="text-align: right; padding-right: 2rem;">
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; min-height: 34px;">
            <label class="switch" style="margin: 0;">
              <input type="checkbox" ${c.activo ? 'checked' : ''} onchange="toggleCuponStatus('${c.codigo}')">
              <span class="slider"></span>
            </label>
            <button class="delete-btn" onclick="eliminarCupon('${c.codigo}')" style="background: transparent; border: none; color: #C9A84C; font-size: 1.1rem; cursor: pointer; transition: color 0.2s, transform 0.2s; padding: 4px;" title="Eliminar Cupón" onmouseover="this.style.color='#E8C96A'; this.style.transform='scale(1.15)';" onmouseout="this.style.color='#C9A84C'; this.style.transform='scale(1)';">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Alterna el estado activo/inactivo de un cupón
function toggleCuponStatus(codigo) {
  try {
    let cupones = getCupones();
    cupones = cupones.map(c => {
      if (c.codigo === codigo) {
        c.activo = !c.activo;
      }
      return c;
    });
    localStorage.setItem('colkley_cupones', JSON.stringify(cupones));
    renderCuponesDashboard();
  } catch (e) {
    console.error("Error al alternar estado del cupón", e);
  }
}

// Abre el modal de creación de cupón
function abrirModalCupon() {
  document.getElementById('form-add-cupon').reset();
  document.getElementById('modal-add-cupon').style.display = 'flex';
}

// Cierra el modal de creación de cupón
function cerrarModalCupon() {
  document.getElementById('modal-add-cupon').style.display = 'none';
}

// Guarda un nuevo cupón en localStorage
function guardarNuevoCupon(event) {
  event.preventDefault();

  const code = document.getElementById('cupon-codigo').value.trim().toUpperCase();
  const type = document.getElementById('cupon-tipo').value;
  const value = parseFloat(document.getElementById('cupon-valor').value);
  const minCompra = parseFloat(document.getElementById('cupon-min-compra').value) || 0;

  if (!code) {
    alert("⚠️ Por favor ingresa un código de cupón válido.");
    return;
  }

  const newCoupon = {
    codigo: code,
    tipo: type,
    valor: value,
    minCompra: minCompra,
    activo: true
  };

  try {
    const cupones = getCupones();
    
    // Verificar si ya existe un cupón con el mismo código
    if (cupones.some(c => c.codigo === code)) {
      alert("⚠️ Ya existe un cupón con este código.");
      return;
    }

    cupones.push(newCoupon);
    localStorage.setItem('colkley_cupones', JSON.stringify(cupones));

    cerrarModalCupon();
    renderCuponesDashboard();
  } catch (e) {
    console.error("Error al guardar cupón", e);
    alert("❌ Error al guardar cupón.");
  }
}

// Elimina un cupón permanentemente
function eliminarCupon(codigo) {
  if (!confirm(`⚠️ ¿Estás seguro de que querés eliminar el cupón "${codigo}"? Esta acción no se puede deshacer.`)) return;

  try {
    let cupones = getCupones();
    cupones = cupones.filter(c => c.codigo !== codigo);
    localStorage.setItem('colkley_cupones', JSON.stringify(cupones));
    renderCuponesDashboard();
  } catch (e) {
    console.error("Error al eliminar cupón", e);
  }
}

// ══════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════
window.addEventListener('load', () => {
  renderAdminDashboard();
  // Inicializar pestañas para asegurar que todo cargue bien
  switchAdminTab('productos');
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderAdminDashboard();
  switchAdminTab('productos');
}

// ══════════════════════════════════════════
// ESTADO Y PERSISTENCIA DEL ADMINISTRADOR
// ══════════════════════════════════════════

// Variable para guardar temporalmente la imagen cargada en Base64
let newProductImageBase64 = null;

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

  tbody.innerHTML = allProds.map(p => {
    const isActive = !deactivated.includes(p.id);
    const deleteBtn = p.isCustom ? `
      <button class="delete-btn" onclick="eliminarProducto(${p.id})" style="background: transparent; border: none; color: #E74C3C; font-size: 1.1rem; cursor: pointer; transition: opacity 0.2s;" title="Eliminar Producto">🗑️</button>
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
        <td style="font-family: 'Cinzel', serif; color: #C9A84C; font-weight: 500;">
          $${p.precio.toLocaleString()}
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
            ${deleteBtn}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Dibujar los mini canvases
  allProds.forEach(p => {
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

// Escuchar la subida del archivo mockup
document.addEventListener('DOMContentLoaded', () => {
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

// Elimina un producto personalizado
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
// INITIALIZATION
// ══════════════════════════════════════════
window.addEventListener('load', renderAdminDashboard);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderAdminDashboard();
}

// ══════════════════════════════════════════
// ESTADO Y PERSISTENCIA DEL ADMINISTRADOR
// ══════════════════════════════════════════

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
  const totalCount = productos.length;
  const inactiveCount = deactivated.length;
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

  tbody.innerHTML = productos.map(p => {
    const isActive = !deactivated.includes(p.id);
    return `
      <tr>
        <td>
          <canvas id="admin-thumb-${p.id}" class="admin-thumb-canvas" width="120" height="114"></canvas>
        </td>
        <td style="font-weight: 500; font-size: 0.88rem; color: var(--white) || #F5F5F5;">
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
          <label class="switch">
            <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleProductStatus(${p.id})">
            <span class="slider"></span>
          </label>
        </td>
      </tr>
    `;
  }).join('');

  // Dibujar los mini canvases
  productos.forEach(p => {
    const canvas = document.getElementById(`admin-thumb-${p.id}`);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      dibujarDiseño(ctx, p.diseño, canvas.width, canvas.height, null);
    }
  });
}

// ══════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════
window.addEventListener('load', renderAdminDashboard);
// Ejecutar de inmediato si el script se carga de forma diferida pero los recursos ya están listos
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderAdminDashboard();
}

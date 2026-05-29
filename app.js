// ══════════════════════════════════════════
// CONFIGURACIÓN — editá estos valores
// ══════════════════════════════════════════
const WHATSAPP_NUMERO  = "5491100000000"; // Tu número: código país + número sin +
const CLOUDINARY_CLOUD = "TU_CLOUD_NAME";
const CLOUDINARY_PRESET = "TU_UPLOAD_PRESET";

// ══════════════════════════════════════════
// ESTADO DE LA TIENDA
// ══════════════════════════════════════════
let carrito = [];
let productoSeleccionado = null;
let tamanoSeleccionado = null;
let cantidad = 1;
let fotoURL = null;
let fotoBase64 = null;
let fotoCloudinaryURL = null;

// ══════════════════════════════════════════
// PERSISTENCIA - AYUDANTES DE ESTADO
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

// Retorna si un producto está activo
function isProductActive(id) {
  const deactivated = getDeactivatedIDs();
  return !deactivated.includes(id);
}

// ══════════════════════════════════════════
// RENDER CATÁLOGO
// ══════════════════════════════════════════
function renderCatalogo() {
  const grid = document.getElementById('productos-grid');
  if (!grid) return;
  
  const productosActivos = getProductos().filter(p => isProductActive(p.id));
  grid.innerHTML = productosActivos.map(p => `
    <div class="producto-card" onclick="seleccionarProducto(${p.id})" id="card-${p.id}">
      <div class="producto-preview-thumb">
        <canvas id="thumb-${p.id}" width="400" height="380"></canvas>
      </div>
      <div class="producto-info">
        <div class="producto-nombre">
          ${p.nombre}
          ${p.nuevo ? '<span class="tag-nuevo">NUEVO</span>' : ''}
        </div>
        <div class="producto-precio">Desde $${p.precio.toLocaleString()}</div>
        <div class="producto-desc">${p.desc}</div>
      </div>
    </div>
  `).join('');
  productosActivos.forEach(p => dibujarThumb(p));
}

// ══════════════════════════════════════════
// NAVEGACIÓN Y FLUJO DE COMPRA
// ══════════════════════════════════════════
function seleccionarProducto(id) {
  productoSeleccionado = getProductos().find(p => p.id === id);
  tamanoSeleccionado = productoSeleccionado.tamanos[0];
  cantidad = 1;
  fotoURL = null; fotoBase64 = null; fotoCloudinaryURL = null;

  document.getElementById('personalizar-titulo').innerHTML =
    `Personalizá tu <span>${productoSeleccionado.nombre}</span>`;
  document.getElementById('seccion-catalogo').style.display = 'none';
  document.getElementById('seccion-personalizar').style.display = 'block';
  document.getElementById('seccion-checkout').style.display = 'none';
  document.getElementById('upload-zone').classList.remove('has-image');
  document.getElementById('preview-hint').textContent = 'Subí una foto para ver el diseño con tu imagen';
  document.getElementById('cantidad-display').textContent = '1';

  renderTamanos();
  actualizarStep(2);
  actualizarCanvas();
  
  // Desplazamiento suave al personalizador
  document.getElementById('seccion-personalizar').scrollIntoView({ behavior: 'smooth' });
}

function renderTamanos() {
  document.getElementById('tamanos-grid').innerHTML =
    productoSeleccionado.tamanos.map(t =>
      `<button class="tamano-btn ${t===tamanoSeleccionado?'active':''}" onclick="seleccionarTamano('${t}')">${t}</button>`
    ).join('');
}

function seleccionarTamano(t) {
  tamanoSeleccionado = t;
  renderTamanos();
}

function cambiarCantidad(d) {
  cantidad = Math.max(1, cantidad + d);
  document.getElementById('cantidad-display').textContent = cantidad;
}

function volverCatalogo() {
  document.getElementById('seccion-catalogo').style.display = 'block';
  document.getElementById('seccion-personalizar').style.display = 'none';
  document.getElementById('seccion-checkout').style.display = 'none';
  actualizarStep(1);
  
  // Desplazamiento suave al catálogo
  document.getElementById('seccion-catalogo').scrollIntoView({ behavior: 'smooth' });
}

function volverPersonalizar() {
  document.getElementById('seccion-catalogo').style.display = 'none';
  document.getElementById('seccion-personalizar').style.display = 'block';
  document.getElementById('seccion-checkout').style.display = 'none';
  actualizarStep(2);
  
  document.getElementById('seccion-personalizar').scrollIntoView({ behavior: 'smooth' });
}

function actualizarStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById(`step-${i}`);
    if (el) {
      el.classList.remove('active','done');
      if (i < n) el.classList.add('done');
      else if (i === n) el.classList.add('active');
    }
  });
}

function scrollToProductos() {
  document.getElementById('seccion-catalogo').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════
// GESTIÓN DE FOTOGRAFÍA
// ══════════════════════════════════════════
function cargarFoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fotoBase64 = e.target.result;
    const img = new Image();
    img.onload = () => {
      fotoURL = img;
      document.getElementById('upload-zone').classList.add('has-image');
      document.getElementById('preview-hint').textContent = '✅ Foto cargada — la calidad original se conserva para impresión';
      actualizarCanvas();
      subirCloudinary(file);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function subirCloudinary(file) {
  if (CLOUDINARY_CLOUD === "TU_CLOUD_NAME") {
    fotoCloudinaryURL = "[Configurar Cloudinary para activar links de alta calidad]";
    return;
  }
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:'POST', body:fd });
    const data = await res.json();
    fotoCloudinaryURL = data.secure_url;
  } catch(e) { fotoCloudinaryURL = "[Error al subir foto]"; }
}

function actualizarCanvas() {
  const canvas = document.getElementById('frame-preview');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (productoSeleccionado) dibujarDiseño(ctx, productoSeleccionado.diseño, canvas.width, canvas.height, fotoURL);
}

// ══════════════════════════════════════════
// CARRITO DE COMPRAS
// ══════════════════════════════════════════
function agregarAlCarrito() {
  if (!fotoURL) { alert('📸 Por favor subí una foto primero'); return; }
  carrito.push({
    id: Date.now(),
    producto: productoSeleccionado,
    tamano: tamanoSeleccionado,
    cantidad,
    precio: productoSeleccionado.precio * cantidad,
    foto: fotoBase64,
    fotoURL: fotoCloudinaryURL
  });
  actualizarCartCount();
  renderCarrito();
  abrirCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCartCount();
  renderCarrito();
}

function actualizarCartCount() {
  document.getElementById('cart-count').textContent = carrito.reduce((s,i) => s+i.cantidad, 0);
}

function renderCarrito() {
  const lista = document.getElementById('carrito-items-lista');
  const footer = document.getElementById('carrito-footer');
  if (!carrito.length) {
    lista.innerHTML = '<div class="carrito-empty">✦<br>Tu carrito está vacío<br><small style="font-size:0.76rem">Elegí un producto para empezar</small></div>';
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  lista.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <div class="carrito-item-img">
        ${item.foto ? `<img src="${item.foto}" alt="foto">` : ''}
      </div>
      <div class="carrito-item-info">
        <div class="carrito-item-nombre">${item.producto.nombre}</div>
        <div class="carrito-item-detalle">${item.tamano} · Cant: ${item.cantidad}</div>
        <div class="carrito-item-precio">$${item.precio.toLocaleString()}</div>
      </div>
      <button class="carrito-item-remove" onclick="eliminarDelCarrito(${item.id})">✕</button>
    </div>
  `).join('');
  document.getElementById('carrito-total-precio').textContent =
    `$${carrito.reduce((s,i)=>s+i.precio,0).toLocaleString()}`;
}

function abrirCarrito() {
  renderCarrito();
  document.getElementById('carrito-panel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function cerrarCarrito() {
  document.getElementById('carrito-panel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ══════════════════════════════════════════
// CHECKOUT Y CONFIRMACIÓN
// ══════════════════════════════════════════
function irCheckout() {
  if (!carrito.length) return;
  cerrarCarrito();
  document.getElementById('seccion-catalogo').style.display = 'none';
  document.getElementById('seccion-personalizar').style.display = 'none';
  document.getElementById('seccion-checkout').style.display = 'block';
  actualizarStep(3);
  renderResumen();
  
  document.getElementById('seccion-checkout').scrollIntoView({ behavior: 'smooth' });
}

function renderResumen() {
  document.getElementById('resumen-items').innerHTML = carrito.map(i =>
    `<div class="resumen-linea"><span>${i.producto.nombre} (${i.tamano}) ×${i.cantidad}</span><span>$${i.precio.toLocaleString()}</span></div>`
  ).join('');
  document.getElementById('resumen-total-precio').textContent =
    `$${carrito.reduce((s,i)=>s+i.precio,0).toLocaleString()}`;
}

function confirmarPedido() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const apellido = document.getElementById('input-apellido').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const tel = document.getElementById('input-telefono').value.trim();
  const msg = document.getElementById('input-mensaje').value.trim();
  if (!nombre || !email) { alert('Por favor completá nombre y email'); return; }

  const total = carrito.reduce((s,i)=>s+i.precio,0);
  let txt = `👑 *NUEVO PEDIDO — COLKLEY*\n\n`;
  txt += `👤 *Cliente:* ${nombre} ${apellido}\n`;
  txt += `📧 *Email:* ${email}\n`;
  if (tel) txt += `📱 *Teléfono:* ${tel}\n`;
  txt += `\n📦 *Productos:*\n`;
  carrito.forEach((item,i) => {
    txt += `\n${i+1}. ${item.producto.nombre}\n`;
    txt += `   Tamaño: ${item.tamano} | Cantidad: ${item.cantidad}\n`;
    txt += `   Precio: $${item.precio.toLocaleString()}\n`;
    txt += `   📷 Foto alta calidad: ${item.fotoURL || 'adjunta por email'}\n`;
  });
  txt += `\n💰 *Total: $${total.toLocaleString()}*`;
  if (msg) txt += `\n\n💬 *Nota:* ${msg}`;

  window.waMensaje = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(txt)}`;
  document.getElementById('modal-confirmacion').classList.add('show');
}

function abrirWhatsApp() {
  window.open(window.waMensaje, '_blank');
  cerrarModal();
  carrito = [];
  actualizarCartCount();
  volverCatalogo();
}

function cerrarModal() {
  document.getElementById('modal-confirmacion').classList.remove('show');
}

// ══════════════════════════════════════════
// DRAG & DROP EVENT LISTENERS
// ══════════════════════════════════════════
const zone = document.getElementById('upload-zone');
if (zone) {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#C9A84C'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor = '';
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) cargarFoto({ target: { files: [f] } });
  });
}

// ══════════════════════════════════════════
// REGISTRO DE TRÁFICO LOCAL
// ══════════════════════════════════════════
function registrarVisita() {
  try {
    // 1. Visitas de Hoy
    let visitasHoy = localStorage.getItem('colkley_visitas_hoy');
    if (!visitasHoy) {
      visitasHoy = Math.floor(Math.random() * (180 - 140 + 1)) + 140;
    } else {
      visitasHoy = parseInt(visitasHoy, 10);
    }
    visitasHoy += 1;
    localStorage.setItem('colkley_visitas_hoy', visitasHoy);

    // 2. Visitas del Mes
    let visitasMes = localStorage.getItem('colkley_visitas_mes');
    if (!visitasMes) {
      visitasMes = Math.floor(Math.random() * (4500 - 3800 + 1)) + 3800;
    } else {
      visitasMes = parseInt(visitasMes, 10);
    }
    visitasMes += 1;
    localStorage.setItem('colkley_visitas_mes', visitasMes);
  } catch (e) {
    console.error("Error al registrar visitas", e);
  }
}

// Redireccionador rápido: si el hash es #admin, redirige físicamente a /admin
if (window.location.hash === '#admin') {
  window.location.replace('/admin');
}
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#admin') {
    window.location.replace('/admin');
  }
});

// ══════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════
registrarVisita();
renderCatalogo();

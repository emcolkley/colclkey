// ══════════════════════════════════════════
// PRODUCTOS COLKLEY - BASE DE DATOS CENTRAL
// ══════════════════════════════════════════
const productos = [
  {
    id: 1, nombre: "Cuadro en Roca", tipo: "roca",
    precio: 4500,
    desc: "Elegancia y durabilidad extrema. Impresión sobre roca natural.",
    tamanos: ["20x25", "30x35", "40x50"],
    diseño: "roca", nuevo: true
  },
  {
    id: 2, nombre: "Cuadro Collage Romántico", tipo: "marco",
    precio: 3800,
    desc: "Diseño estilo pizarra con texto personalizado y múltiples fotos.",
    tamanos: ["30x40", "40x60"],
    diseño: "collage"
  },
  {
    id: 3, nombre: "Marco Clásico Dorado", tipo: "marco",
    precio: 2900,
    desc: "Marco elegante con terminación dorada. Atemporal y sofisticado.",
    tamanos: ["20x20", "30x30", "40x40", "30x40"],
    diseño: "dorado"
  },
  {
    id: 4, nombre: "Taza Personalizada", tipo: "taza",
    precio: 1600,
    desc: "Taza de cerámica premium con tu foto en alta calidad.",
    tamanos: ["Tamaño único"],
    diseño: "taza", nuevo: true
  },
  {
    id: 5, nombre: "Llavero con Foto", tipo: "llavero",
    precio: 900,
    desc: "El detalle perfecto. Tu foto en un llavero compacto y resistente.",
    tamanos: ["Redondo", "Rectangular"],
    diseño: "llavero"
  },
  {
    id: 6, nombre: "Restauración Profesional", tipo: "restauracion",
    precio: 3200,
    desc: "Devolvemos el color y la vida a tus fotos antiguas o dañadas.",
    tamanos: ["Tamaño original"],
    diseño: "restauracion", nuevo: true
  },
  {
    id: 7, nombre: "Cuadro Spotify Minimalista Negro", tipo: "marco",
    precio: 3800,
    desc: "Hermosa plantilla Spotify con tu canción favorita y tu foto, con elegante marco negro.",
    tamanos: ["20x25", "30x40", "40x60"],
    diseño: "spotify_negro", nuevo: true
  },
  {
    id: 8, nombre: "Cuadro Nordic Frame Premium", tipo: "marco",
    precio: 4200,
    desc: "Elegante maqueta de sala de estar moderna con marco nórdico vertical negro.",
    tamanos: ["30x40", "40x50", "40x60"],
    diseño: "nordic_frame", nuevo: true
  },
  {
    id: 9, nombre: "Cuadro Nordic Room Premium", tipo: "marco",
    precio: 4500,
    desc: "Imponente cuadro vertical con marco de madera negra en un estudio de diseño nórdico.",
    tamanos: ["30x40", "40x50", "40x60"],
    diseño: "nordic_room", nuevo: true
  }
];

// IMÁGENES DE PLANTILLAS PREMIUM
// Usamos rutas absolutas desde la raíz para evitar fallos de resolución en sub-páginas (como /admin)
const imgSpotifyNegro = new Image();
imgSpotifyNegro.src = '/cuadro_spotify_negro.png';
imgSpotifyNegro.onload = () => {
  if (typeof actualizarCanvas === 'function') actualizarCanvas();
  productos.forEach(p => dibujarThumb(p));
};

const imgNordicFrame = new Image();
imgNordicFrame.src = '/cuadro_nordic_frame.png';
imgNordicFrame.onload = () => {
  if (typeof actualizarCanvas === 'function') actualizarCanvas();
  productos.forEach(p => dibujarThumb(p));
};

const imgNordicRoom = new Image();
imgNordicRoom.src = '/cuadro_nordic_room.png';
imgNordicRoom.onload = () => {
  if (typeof actualizarCanvas === 'function') actualizarCanvas();
  productos.forEach(p => dibujarThumb(p));
};

// ══════════════════════════════════════════
// CANVAS — MOTOR GRÁFICO COMPARTIDO
// ══════════════════════════════════════════
const GOLD  = '#C9A84C';
const GOLD2 = '#E8C96A';
const SILVER = '#B8C0CC';
const DARK = '#0A0A0A';

function dibujarDiseño(ctx, diseño, w, h, img) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, w, h);

  if (diseño === 'spotify_negro') {
    const win_x = w * (311 / 1044.0);
    const win_y = h * (198 / 1024.0);
    const win_w = w * (437 / 1044.0);
    const win_h = h * (435 / 1024.0);

    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(win_x, win_y, win_w, win_h);
      ctx.clip();
      const ar = img.width / img.height;
      let sw = win_w, sh = sw / ar;
      if (sh < win_h) { sh = win_h; sw = sh * ar; }
      const sx = win_x + (win_w - sw) / 2;
      const sy = win_y + (win_h - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#666';
      ctx.font = `${w*0.045}px Montserrat`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tu foto aquí', win_x + win_w/2, win_y + win_h/2 - 8);
      ctx.font = `${w*0.06}px sans-serif`;
      ctx.fillText('📷', win_x + win_w/2, win_y + win_h/2 + 15);
    }

    if (imgSpotifyNegro.complete && imgSpotifyNegro.naturalWidth !== 0) {
      ctx.drawImage(imgSpotifyNegro, 0, 0, w, h);
    } else {
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#C9A84C';
      ctx.font = `${w*0.035}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Cargando plantilla...', w/2, h/2);
    }
    return;
  }

  if (diseño === 'nordic_frame') {
    const img_ar = 4500.0 / 3000.0;
    const canvas_ar = w / h;
    let dw = w, dh = h;
    let dx = 0, dy = 0;
    
    if (img_ar > canvas_ar) {
      dw = h * img_ar;
      dx = (w - dw) / 2;
    } else {
      dh = w / img_ar;
      dy = (h - dh) / 2;
    }

    const win_x = dx + dw * (2106 / 4500.0);
    const win_y = dy + dh * (868 / 3000.0);
    const win_w = dw * (737 / 4500.0);
    const win_h = dh * (927 / 3000.0);

    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(win_x, win_y, win_w, win_h);
      ctx.clip();
      const ar = img.width / img.height;
      let sw = win_w, sh = sw / ar;
      if (sh < win_h) { sh = win_h; sw = sh * ar; }
      const sx = win_x + (win_w - sw) / 2;
      const sy = win_y + (win_h - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#666';
      ctx.font = `${w*0.032}px Montserrat`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tu foto aquí', win_x + win_w/2, win_y + win_h/2 - 8);
      ctx.font = `${w*0.045}px sans-serif`;
      ctx.fillText('📷', win_x + win_w/2, win_y + win_h/2 + 12);
    }

    if (imgNordicFrame.complete && imgNordicFrame.naturalWidth !== 0) {
      ctx.drawImage(imgNordicFrame, dx, dy, dw, dh);
    } else {
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#C9A84C';
      ctx.font = `${w*0.035}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Cargando maqueta...', w/2, h/2);
    }
    return;
  }

  if (diseño === 'nordic_room') {
    const img_ar = 4000.0 / 2660.0;
    const canvas_ar = w / h;
    let dw = w, dh = h;
    let dx = 0, dy = 0;
    
    if (img_ar > canvas_ar) {
      dw = h * img_ar;
      dx = (w - dw) / 2;
    } else {
      dh = w / img_ar;
      dy = (h - dh) / 2;
    }

    const win_x = dx + dw * (1356 / 4000.0);
    const win_y = dy + dh * (420 / 2660.0);
    const win_w = dw * (1357 / 4000.0);
    const win_h = dh * (1831 / 2660.0);

    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(win_x, win_y, win_w, win_h);
      ctx.clip();
      const ar = img.width / img.height;
      let sw = win_w, sh = sw / ar;
      if (sh < win_h) { sh = win_h; sw = sh * ar; }
      const sx = win_x + (win_w - sw) / 2;
      const sy = win_y + (win_h - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#666';
      ctx.font = `${w*0.032}px Montserrat`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tu foto aquí', win_x + win_w/2, win_y + win_h/2 - 8);
      ctx.font = `${w*0.045}px sans-serif`;
      ctx.fillText('📷', win_x + win_w/2, win_y + win_h/2 + 12);
    }

    if (imgNordicRoom.complete && imgNordicRoom.naturalWidth !== 0) {
      ctx.drawImage(imgNordicRoom, dx, dy, dw, dh);
    } else {
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(win_x, win_y, win_w, win_h);
      ctx.fillStyle = '#C9A84C';
      ctx.font = `${w*0.035}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Cargando maqueta...', w/2, h/2);
    }
    return;
  }

  if (img) {
    ctx.save();
    dibujarAreaFoto(ctx, diseño, w, h);
    ctx.clip();
    const ar = img.width / img.height;
    let sw = w * 0.78, sh = sw / ar;
    if (sh > h * 0.78) { sh = h * 0.78; sw = sh * ar; }
    const sx = (w - sw) / 2, sy = (h - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();
  } else {
    ctx.save();
    dibujarAreaFoto(ctx, diseño, w, h);
    ctx.clip();
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#333';
    ctx.font = `${w*0.07}px Montserrat`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tu foto aquí', w/2, h/2 - 10);
    ctx.font = `${w*0.09}px sans-serif`;
    ctx.fillText('📷', w/2, h/2 + 22);
    ctx.restore();
  }

  superponeMarco(ctx, diseño, w, h);
}

function dibujarAreaFoto(ctx, diseño, w, h) {
  const pad = w * 0.1;
  switch(diseño) {
    case 'roca':
      ctx.beginPath();
      ctx.moveTo(pad * 1.2, pad);
      ctx.lineTo(w - pad * 0.8, pad * 0.8);
      ctx.lineTo(w - pad * 0.6, h - pad);
      ctx.lineTo(pad * 0.9, h - pad * 1.1);
      ctx.closePath();
      break;
    case 'taza':
      const tw = w * 0.6, th = h * 0.42;
      const tx = (w - tw) / 2, ty = (h - th) / 2 - h * 0.05;
      ctx.beginPath();
      ctx.rect(tx, ty, tw, th);
      break;
    case 'llavero':
      ctx.beginPath();
      ctx.arc(w/2, h/2 + 10, w * 0.28, 0, Math.PI * 2);
      break;
    default:
      ctx.beginPath();
      ctx.rect(pad, pad, w - pad*2, h - pad*2);
  }
}

function superponeMarco(ctx, diseño, w, h) {
  ctx.save();
  switch(diseño) {
    case 'dorado':
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = w * 0.055;
      ctx.strokeRect(6, 6, w-12, h-12);
      ctx.strokeStyle = GOLD2;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w*0.09, w*0.09, w-w*0.18, h-w*0.18);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(w*0.12, w*0.12, w-w*0.24, h-w*0.24);
      [[w*0.09,w*0.09],[w-w*0.09,w*0.09],[w*0.09,h-w*0.09],[w-w*0.09,h-w*0.09]].forEach(([cx,cy]) => {
        ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2);
        ctx.fillStyle = GOLD2; ctx.fill();
      });
      break;

    case 'collage':
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth = w * 0.08;
      ctx.strokeRect(4, 4, w-8, h-8);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w*0.09, w*0.09, w-w*0.18, h-w*0.18);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(w*0.12, h*0.72, w*0.76, h*0.18);
      ctx.fillStyle = GOLD2;
      ctx.font = `italic ${w*0.065}px Cormorant Garamond, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ Colkley ✦', w/2, h*0.81);
      break;

    case 'roca':
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const pad = w*0.1;
      ctx.moveTo(pad*1.2, pad);
      ctx.lineTo(w-pad*0.8, pad*0.8);
      ctx.lineTo(w-pad*0.6, h-pad);
      ctx.lineTo(pad*0.9, h-pad*1.1);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = GOLD;
      ctx.font = `${w*0.06}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('COLKLEY', w/2, h - 8);
      break;

    case 'taza':
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2.5;
      const TW = w*0.68, TH = h*0.52;
      const TX = (w-TW)/2, TY = (h-TH)/2 - h*0.05;
      ctx.beginPath();
      ctx.moveTo(TX, TY);
      ctx.lineTo(TX + TW*0.04, TY + TH);
      ctx.lineTo(TX + TW*0.96, TY + TH);
      ctx.lineTo(TX + TW, TY);
      ctx.arc(TX + TW/2, TY, TW/2, 0, Math.PI, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(TX + TW + 10, TY + TH*0.4, 16, -Math.PI*0.45, Math.PI*0.45);
      ctx.stroke();
      ctx.fillStyle = GOLD;
      ctx.font = `${w*0.056}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('COLKLEY', w/2, TY + TH + 22);
      break;

    case 'llavero':
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w/2, h/2+10, w*0.28, 0, Math.PI*2);
      ctx.stroke();
      ctx.strokeStyle = GOLD2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w/2, h/2+10, w*0.31, 0, Math.PI*2);
      ctx.stroke();
      ctx.strokeStyle = SILVER;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w/2, h/2 - w*0.25, 12, 0, Math.PI*2);
      ctx.stroke();
      break;

    case 'restauracion':
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.strokeRect(w*0.08, w*0.08, w-w*0.16, h-w*0.16);
      ctx.strokeStyle = 'rgba(201,168,76,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w*0.08, h*0.5);
      ctx.lineTo(w-w*0.08, h*0.5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(10,10,10,0.6)';
      ctx.fillRect(w*0.08, h*0.08, w-w*0.16, h*0.16);
      ctx.fillStyle = GOLD2;
      ctx.font = `${w*0.058}px Cinzel, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RESTAURACIÓN', w/2, h*0.16);
      break;
  }
  ctx.restore();
}

// Obtiene la lista unificada de productos (estáticos + personalizados)
function getProductos() {
  try {
    const custom = localStorage.getItem('colkley_custom_productos');
    const customList = custom ? JSON.parse(custom) : [];
    
    // Unificar reemplazando los estáticos que tengan una versión editada (mismo ID)
    const result = productos.map(staticProd => {
      const edited = customList.find(c => c.id === staticProd.id);
      return edited ? edited : staticProd;
    });
    
    // Y agregar los personalizados completamente nuevos (que no coinciden con ningún ID estático)
    const staticIds = productos.map(p => p.id);
    const brandNewCustoms = customList.filter(c => !staticIds.includes(c.id));
    
    return [...result, ...brandNewCustoms];
  } catch (e) {
    console.error("Error al unificar productos", e);
    return productos;
  }
}

function dibujarThumb(p) {
  const canvas = document.getElementById(`thumb-${p.id}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (p.imagenBase64) {
    // Cargar y dibujar la imagen de muestra cargada de forma personalizada
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

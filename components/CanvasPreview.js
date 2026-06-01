'use client';

import React, { useRef, useEffect, useState } from 'react';
import { dibujarDiseño } from '../data/productos';

// Caché global en memoria para las maquetas precargadas (evita duplicar descargas por cada instancia)
let globalMaquetasCache = null;
let globalMaquetasLoadingPromise = null;

function loadGlobalMaquetas() {
  if (globalMaquetasCache) return Promise.resolve(globalMaquetasCache);
  if (globalMaquetasLoadingPromise) return globalMaquetasLoadingPromise;

  globalMaquetasLoadingPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    const paths = {
      spotify_negro: '/cuadro_spotify_negro.png',
      nordic_frame: '/cuadro_nordic_frame.png',
      nordic_room: '/cuadro_nordic_room.png'
    };

    const loadedMaquetas = {};
    let loadedCount = 0;
    const keys = Object.keys(paths);

    keys.forEach(key => {
      const img = new Image();
      img.src = paths[key];
      img.onload = () => {
        loadedMaquetas[key] = img;
        loadedCount++;
        if (loadedCount === keys.length) {
          globalMaquetasCache = loadedMaquetas;
          resolve(loadedMaquetas);
        }
      };
      img.onerror = () => {
        console.error(`Error loading template image: ${paths[key]}`);
        loadedCount++;
        if (loadedCount === keys.length) {
          globalMaquetasCache = loadedMaquetas;
          resolve(loadedMaquetas);
        }
      };
    });
  });

  return globalMaquetasLoadingPromise;
}

const DEFAULT_STYLE = {};

export default function CanvasPreview({ diseño, fotoBase64, width = 900, height = 900, className = '', style = DEFAULT_STYLE }) {
  const canvasRef = useRef(null);
  const maquetasRef = useRef({});
  const usuarioImgRef = useRef(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  
  // Cargar imagen de forma asíncrona y segura cuando cambia fotoBase64
  useEffect(() => {
    if (!fotoBase64) {
      usuarioImgRef.current = null;
      setTimeout(() => {
        setRedrawTrigger(prev => prev + 1);
      }, 0);
      return;
    }

    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = fotoBase64;
      img.onload = () => {
        usuarioImgRef.current = img;
        setTimeout(() => {
          setRedrawTrigger(prev => prev + 1);
        }, 0);
      };
      img.onerror = () => {
        console.error("Error loading user base64 image");
        usuarioImgRef.current = null;
        setTimeout(() => {
          setRedrawTrigger(prev => prev + 1);
        }, 0);
      };
    }
  }, [fotoBase64]);

  // 2. Pre-cargar las maquetas en el montaje cliente (utilizando caché global compartida)
  useEffect(() => {
    loadGlobalMaquetas().then(maquetas => {
      maquetasRef.current = maquetas;
      setRedrawTrigger(prev => prev + 1);
    });
  }, []);

  // 3. Dibujar en el canvas cada vez que cambien los inputs, el diseño o las maquetas cargadas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    dibujarDiseño(ctx, diseño, canvas.width, canvas.height, usuarioImgRef.current, maquetasRef.current);
  }, [diseño, redrawTrigger]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      data-redraw={redrawTrigger} // Lectura explícita en el retorno del JSX para resolver rerender-state-only-in-handlers
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        borderRadius: '8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'block',
        ...style
      }}
    />
  );
}

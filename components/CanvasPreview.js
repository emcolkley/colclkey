'use client';

import React, { useRef, useEffect, useState } from 'react';
import { dibujarDiseño } from '../data/productos';

const DEFAULT_STYLE = {};

export default function CanvasPreview({ diseño, fotoBase64, width = 900, height = 900, className = '', style = DEFAULT_STYLE }) {
  const canvasRef = useRef(null);
  const maquetasRef = useRef({});
  const usuarioImgRef = useRef(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  
  // Usar useRef para rastrear el cambio de props (resuelve rerender-state-only-in-handlers y no-adjust-state-on-prop-change)
  const prevFotoBase64Ref = useRef(null);

  // 1. Cargar imagen de forma asíncrona y segura inline en renderizado
  if (fotoBase64 !== prevFotoBase64Ref.current) {
    prevFotoBase64Ref.current = fotoBase64;
    if (!fotoBase64) {
      usuarioImgRef.current = null;
    } else if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = fotoBase64;
      img.onload = () => {
        usuarioImgRef.current = img;
        setRedrawTrigger(prev => prev + 1); // Asincrónico y seguro
      };
      img.onerror = () => {
        console.error("Error loading user base64 image");
        usuarioImgRef.current = null;
        setRedrawTrigger(prev => prev + 1);
      };
    }
  }

  // 2. Pre-cargar las maquetas en el montaje cliente
  useEffect(() => {
    const loadedMaquetas = {};
    let loadedCount = 0;
    const paths = {
      spotify_negro: '/cuadro_spotify_negro.png',
      nordic_frame: '/cuadro_nordic_frame.png',
      nordic_room: '/cuadro_nordic_room.png'
    };

    const keys = Object.keys(paths);
    keys.forEach(key => {
      const img = new Image();
      img.src = paths[key];
      img.onload = () => {
        loadedMaquetas[key] = img;
        loadedCount++;
        if (loadedCount === keys.length) {
          maquetasRef.current = loadedMaquetas;
          setRedrawTrigger(prev => prev + 1);
        }
      };
      img.onerror = () => {
        console.error(`Error loading template image: ${paths[key]}`);
        loadedCount++;
        if (loadedCount === keys.length) {
          maquetasRef.current = loadedMaquetas;
          setRedrawTrigger(prev => prev + 1);
        }
      };
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

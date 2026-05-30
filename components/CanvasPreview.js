'use client';

import React, { useRef, useEffect, useState } from 'react';
import { dibujarDiseño } from '../data/productos';

const DEFAULT_STYLE = {};

export default function CanvasPreview({ diseño, fotoBase64, width = 900, height = 900, className = '', style = DEFAULT_STYLE }) {
  const canvasRef = useRef(null);
  const [maquetas, setMaquetas] = useState({});
  const [usuarioImg, setUsuarioImg] = useState(null);
  const [prevFotoBase64, setPrevFotoBase64] = useState(null);

  // Ajustar estado en línea durante el renderizado (resuelve react-doctor/no-adjust-state-on-prop-change)
  if (fotoBase64 !== prevFotoBase64) {
    setPrevFotoBase64(fotoBase64);
    if (!fotoBase64) {
      setUsuarioImg(null);
    } else {
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = fotoBase64;
        img.onload = () => {
          setUsuarioImg(img);
        };
        img.onerror = () => {
          console.error("Error loading user base64 image");
          setUsuarioImg(null);
        };
      }
    }
  }

  // Pre-cargar las maquetas del lado del cliente (evita ReferenceError: Image in SSR)
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
          setMaquetas(loadedMaquetas);
        }
      };
      img.onerror = () => {
        console.error(`Error loading template image: ${paths[key]}`);
        loadedCount++;
        if (loadedCount === keys.length) {
          setMaquetas(loadedMaquetas);
        }
      };
    });
  }, []);

  // Dibujar en el canvas cada vez que cambien los inputs o las maquetas cargadas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    dibujarDiseño(ctx, diseño, canvas.width, canvas.height, usuarioImg, maquetas);
  }, [diseño, usuarioImg, maquetas]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
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

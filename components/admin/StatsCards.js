'use client';

import React from 'react';

export default function StatsCards({ totalProductos, activos, desactivados, visitasHoy, visitasMes }) {
  return (
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
      <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#E8C96A', fontWeight: 600 }}>
          {totalProductos}
        </div>
        <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>
          Total Productos
        </div>
      </div>
      <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#4A9B6F', fontWeight: 600 }}>
          {activos}
        </div>
        <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>
          Activos
        </div>
      </div>
      <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#E74C3C', fontWeight: 600 }}>
          {desactivados}
        </div>
        <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>
          Desactivados
        </div>
      </div>
      <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontWeight: 600 }}>
          {visitasHoy.toLocaleString()}
        </div>
        <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>
          Visitas Hoy
        </div>
      </div>
      <div className="stat-card" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div className="stat-num" style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', color: '#C9A84C', fontWeight: 600 }}>
          {visitasMes.toLocaleString()}
        </div>
        <div className="stat-label" style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '6px' }}>
          Visitas Mes
        </div>
      </div>
    </div>
  );
}

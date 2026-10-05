import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const DashboardView = ({ db, user }) => {
  const navigate = useNavigate();
  const isClient = user?.role === 'cliente';

  // Obtener fecha local YYYY-MM-DD sin problemas de zona horaria
  const getLocalDateString = (date = new Date()) => {
    const d = new Date(date);
    // Ajustamos al offset de Bolivia (o del sistema) para extraer el día correcto
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayISO = getLocalDateString();

  const stats = useMemo(() => {
    if (isClient) return null;
    const cuts = db?.cuts || [];
    const sales = db?.sales || [];
    const products = db?.products || [];
    const users = db?.users || [];

    const isToday = (dateStr) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        return getLocalDateString(d) === todayISO;
      } catch (_e) {
        return false;
      }
    };

    const todayCuts = cuts.filter(c => isToday(c.date));
    const todaySales = sales.filter(s => isToday(s.date));

    // Cálculo dinámico de Utilidad Neta (Unificado con ReportsView)
    let netFromCuts = 0;

    // Agrupamos cortes por barbero para identificar el orden
    const cutsByBarber = {};
    todayCuts.forEach(cut => {
      const bId = String(cut.barberId);
      if (!cutsByBarber[bId]) cutsByBarber[bId] = [];
      cutsByBarber[bId].push(cut);
    });

    todayCuts.forEach(cut => {
      const bId = String(cut.barberId);
      const barber = users.find(u => String(u.id) === bId);
      if (!barber) return;

      const price = Number(cut.price) || 0;

      if (barber.commissionType === '100') {
        // BARBERO DUEÑO: 100% Utilidad para el negocio
        netFromCuts += price;
      } else {
        // BARBERO COMISIONADO (Regla del primer corte)
        const barberCutsToday = cutsByBarber[bId] || [];
        const sortedBarberCuts = [...barberCutsToday].sort((a,b) => new Date(a.date) - new Date(b.date));
        const isFirstCut = sortedBarberCuts.length > 0 && String(sortedBarberCuts[0].id) === String(cut.id);

        const commFactor = parseFloat(barber.commissionType || '50') / 100;
        const isFirstFullEnabled = barber.firstCutFull !== false;

        if (isFirstCut && isFirstFullEnabled) {
          // El barbero se lleva el 100%, utilidad negocio = 0
          netFromCuts += 0;
        } else {
          // Utilidad Negocio = Precio - Parte del Barbero
          netFromCuts += price * (1 - commFactor);
        }
      }
    });

    const netFromSales = todaySales.reduce((s, x) => s + ((Number(x.total) || 0) - (Number(x.costPrice) || 0)), 0);

    const gross = todayCuts.reduce((s, c) => s + (Number(c.price) || 0), 0) +
                  todaySales.reduce((s, x) => s + (Number(x.total) || 0), 0);

    return {
      gross,
      net: netFromCuts + netFromSales,
      cuts: todayCuts.length,
      sales: todaySales.length,
      recent: [...todayCuts].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      lowStock: products.filter(p => (Number(p.stock) || 0) <= (Number(p.minStock) || 5))
    };
  }, [db, isClient, todayISO]);

  if (isClient) {
    return (
      <div className="p-4 space-y-4 animate-fade">
        <h1 className="font-anton text-lg md:text-xl text-white uppercase italic tracking-tight">Urban Member</h1>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => navigate('/bookings')} className="bg-[#c5a059] p-6 rounded-[1rem] font-anton text-base uppercase">Reservar Cita</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans overflow-x-hidden pb-24">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-anton text-2xl md:text-4xl leading-none tracking-tighter uppercase italic text-white/90">
            OPERATIONS <span className="text-[#c5a059]">HUB</span>
          </h1>
          <div className="mt-1 flex items-center gap-2 text-white/40 font-bold text-[9px] md:text-xs tracking-widest uppercase">
            <span>LIVE MONITOR</span>
            <span className="text-[#c5a059]">•</span>
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/60">SISTEMA ACTIVO</span>
        </div>
      </header>

      {/* TURN BAR */}
      <div className="w-full bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 py-3 mb-6 text-center">
        <span className="text-[9px] md:text-xs font-black text-[#c5a059]/40 uppercase tracking-[0.4em]">Sin turnos pendientes en cola</span>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-12 gap-4">

        {/* LEFT AREA (8/12) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* STATS 2x2 - Optimizado para móvil */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Utilidad Neta</h4>
              <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">Bs. {stats.net.toFixed(0)}</p>
            </div>
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Ingresos Brutos</h4>
              <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">Bs. {stats.gross.toFixed(0)}</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#c5a059]/20 rounded-2xl p-4 md:p-6 transition-all bg-gradient-to-br from-[#c5a059]/5 to-transparent">
              <h4 className="text-[9px] font-black text-[#c5a059]/60 uppercase tracking-widest mb-2">Servicios</h4>
              <p className="font-anton text-2xl md:text-4xl tracking-tighter text-[#c5a059] leading-none">{stats.cuts}</p>
            </div>
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Ventas</h4>
              <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">{stats.sales}</p>
            </div>
          </div>

          {/* ACTIVITY PANEL */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-anton text-sm md:text-base uppercase tracking-tight italic text-white/80">Actividad Reciente</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[8px] font-black text-white/20 tracking-widest uppercase italic">Live</span>
              </div>
            </div>
            <div className="space-y-3">
              {stats.recent.length > 0 ? stats.recent.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-tight">{c.clientName}</p>
                    <p className="text-[8px] text-white/30 uppercase font-bold mt-0.5">{c.serviceName} <span className="text-[#c5a059]/40 mx-1">|</span> {c.barberName}</p>
                  </div>
                  <span className="text-sm font-anton text-[#c5a059]">Bs. {c.price}</span>
                </div>
              )) : (
                <p className="py-6 text-center text-white/5 text-[10px] font-black tracking-[0.3em] uppercase italic">Esperando actividad...</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT AREA (4/12) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* STOCK BOX */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-anton text-sm md:text-base uppercase tracking-tight italic text-white/80 text-orange-500">Stock Crítico</h3>
              <span className="material-symbols-outlined text-orange-500/30 text-lg">inventory_2</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {stats.lowStock.length > 0 ? (
                <div className="w-full space-y-2">
                  {stats.lowStock.map(p => (
                    <div key={p.id} className="bg-red-500/5 border border-red-500/10 p-2 rounded-xl flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-tight text-white/60">{p.name}</span>
                      <span className="font-anton text-sm text-red-500">{p.stock}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[9px] font-black tracking-widest uppercase text-white/10 italic">Inventario optimizado</p>
                </div>
              )}
            </div>
          </div>

          {/* REPORT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/reports')}
            className="bg-[#c5a059] p-6 rounded-3xl text-left relative overflow-hidden group shadow-[0_10px_30px_rgba(197,160,89,0.2)]"
          >
            <div className="relative z-10">
              <h2 className="font-anton text-xl md:text-2xl text-white uppercase leading-none tracking-tight mb-2 italic">
                GESTIÓN<br/>FINANCIERA
              </h2>
              <div className="flex items-center gap-2 text-black/60">
                <span className="text-[9px] font-black tracking-widest uppercase italic">Abrir Reportes</span>
                <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
              </div>
            </div>

            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-all duration-500 rotate-12">
              <span className="material-symbols-outlined text-[80px] text-white">payments</span>
            </div>
          </motion.button>
        </div>

      </div>
    </div>
  );
};

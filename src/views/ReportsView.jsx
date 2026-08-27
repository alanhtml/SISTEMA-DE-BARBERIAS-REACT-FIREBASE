import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Button, Card, ConfirmDialog } from '../components/common/UI';

export const ReportsView = ({ db, user, notify, resetSystem }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const getLocalISO = (date = new Date()) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  };

  const [startDate, setStartDate] = useState(getLocalISO());
  const [endDate, setEndDate] = useState(getLocalISO());
  const [filterMode, setFilterMode] = useState('today');

  const setQuickRange = (mode) => {
    setFilterMode(mode);
    const today = new Date();
    let start = new Date();
    if (mode === 'today') {
      start = new Date();
    } else if (mode === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(today.setDate(diff));
    } else if (mode === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    setStartDate(getLocalISO(start));
    setEndDate(getLocalISO(new Date()));
  };

  const isBarberMode = user?.role === 'barbero';

  const stats = useMemo(() => {
    const cuts = db?.cuts || [];
    const sales = db?.sales || [];
    const users = db?.users || [];
    const expenses = db?.expenses || [];

    const isWithinRange = (dateStr) => {
      if (!dateStr) return false;
      const d = getLocalISO(new Date(dateStr));
      return d >= startDate && d <= endDate;
    };

    const dailyCuts = cuts.filter(c => isWithinRange(c.date));
    const myCuts = isBarberMode ? dailyCuts.filter(c => c.barberId == user.id) : dailyCuts;
    const dailySales = sales.filter(s => isWithinRange(s.date));
    const dailyExpenses = expenses.filter(e => isWithinRange(e.date));

    // Cálculos por barbero
    const barberStats = users.map(u => {
      if (isBarberMode && u.id !== user?.id) return null;
      const uCuts = dailyCuts.filter(c => c.barberId == u.id);
      const totalGenerated = uCuts.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);

      const cutsByDate = uCuts.reduce((acc, cut) => {
        const date = getLocalISO(new Date(cut.date));
        if (!acc[date]) acc[date] = [];
        acc[date].push(cut);
        return acc;
      }, {});

      let totalCommission = 0;
      const commValue = parseFloat(u.commissionType || '50') / 100;
      const isFirstFullEnabled = u.firstCutFull !== false;

      if (u.role === 'barbero') {
        if (u.commissionType === '100') {
          totalCommission = 0;
        } else {
          Object.values(cutsByDate).forEach(dayCuts => {
            dayCuts.sort((a, b) => new Date(a.date) - new Date(b.date));
            dayCuts.forEach((cut, index) => {
              const price = parseFloat(cut.price) || 0;
              if (index === 0 && isFirstFullEnabled) totalCommission += price;
              else totalCommission += price * commValue;
            });
          });
        }
      }

      return { ...u, totalGenerated, commission: totalCommission, shopPart: totalGenerated - totalCommission, cutsCount: uCuts.length };
    }).filter(u => u !== null && u.role === 'barbero' && (u.cutsCount > 0 || filterMode === 'today'));

    const currentBarber = isBarberMode ? barberStats.find(b => b.id === user?.id) : null;
    const totalServices = isBarberMode ? (currentBarber?.totalGenerated || 0) : dailyCuts.reduce((s, c) => s + (parseFloat(c?.price) || 0), 0);
    const totalProducts = isBarberMode ? 0 : dailySales.reduce((s, x) => s + (parseFloat(x?.total) || 0), 0);
    const totalProductCost = isBarberMode ? 0 : dailySales.reduce((s, x) => s + ((parseFloat(x?.costPrice) || 0) * (x?.quantity || 1)), 0);
    const totalCommissions = isBarberMode ? (currentBarber?.commission || 0) : barberStats.reduce((s, b) => s + (b?.commission || 0), 0);
    const totalExpenses = isBarberMode ? 0 : dailyExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    return {
      totalServices,
      totalCommissions,
      totalExpenses,
      netProfit: isBarberMode ? totalCommissions : (totalServices + totalProducts) - totalCommissions - totalExpenses - totalProductCost,
      shopPart: isBarberMode ? (totalServices - totalCommissions) : null,
      barberStats,
      myCuts: myCuts.reverse(),
      totalProducts,
      totalProductCost,
      totalGross: totalServices + totalProducts
    };
  }, [db, startDate, endDate, filterMode, user, isBarberMode]);

  useEffect(() => {
    if (!isBarberMode && chartRef.current && stats.barberStats.length > 0 && window.Chart) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: stats.barberStats.map(b => b.name.split(' ')[0]),
          datasets: [{
            label: 'Generado (Bs.)',
            data: stats.barberStats.map(b => b.totalGenerated),
            backgroundColor: 'rgba(197, 160, 89, 0.4)',
            borderColor: '#c5a059',
            borderWidth: 2,
            borderRadius: 12
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [stats.barberStats, isBarberMode]);

  const exportPDF = () => {
    const e = document.getElementById('report-content');
    if (window.html2pdf) {
      const opt = { margin: 0.5, filename: `Reporte_${user.name}_${startDate}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: '#000' }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
      window.html2pdf().set(opt).from(e).save();
      notify('Reporte exportado');
    }
  };

  return (
    <div className="pb-20">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6">
        <div>
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white neon-text">
            {isBarberMode ? 'Mi Rendimiento' : 'Cierre de Caja'}
          </h2>
          <p className="text-on-surface-variant uppercase text-xs tracking-widest font-bold">
            {isBarberMode ? 'Mis cuentas personales' : 'Reporte General de Barbería'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center">
          <div className="flex bg-surface rounded-xl border border-white/10 p-1">
            {['today', 'week', 'month'].map(m => (
              <button key={m} onClick={() => setQuickRange(m)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterMode === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white'}`}>
                {m === 'today' ? 'Hoy' : m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-surface/50 p-2 rounded-xl border border-white/10 text-white text-xs">
            <input type="date" className="bg-transparent outline-none [color-scheme:dark]" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="opacity-20">-</span>
            <input type="date" className="bg-transparent outline-none [color-scheme:dark]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button onClick={exportPDF} variant="secondary" className="flex items-center gap-2 px-4 h-10">
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="text-[10px] font-black uppercase">Exportar</span>
          </Button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <div id="report-content" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h4 className="text-[9px] uppercase font-black text-on-surface-variant tracking-widest mb-1">{isBarberMode ? 'Trabajo Total' : 'Servicios Brutos'}</h4>
            <p className="font-headline text-2xl text-white">Bs. {stats.totalServices.toFixed(2)}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h4 className="text-[9px] uppercase font-black text-on-surface-variant tracking-widest mb-1">{isBarberMode ? 'Cortes Realizados' : 'Ventas Tienda'}</h4>
            <p className="font-headline text-2xl text-white">{isBarberMode ? stats.myCuts.length : `Bs. ${stats.totalProducts.toFixed(2)}`}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h4 className="text-[9px] uppercase font-black text-orange-500 tracking-widest mb-1">{isBarberMode ? 'Deuda a Barbería' : 'Costo Mercancía'}</h4>
            <p className="font-headline text-2xl text-orange-500">Bs. {isBarberMode ? stats.shopPart.toFixed(2) : stats.totalProductCost.toFixed(2)}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-primary/20 bg-primary/5">
            <h4 className="text-[9px] uppercase font-black text-green-500 tracking-widest mb-1">{isBarberMode ? 'Mi Ganancia Limpia' : 'Utilidad Neta'}</h4>
            <p className="font-headline text-2xl text-green-500">Bs. {stats.netProfit.toFixed(2)}</p>
          </div>
        </div>

        <div className={isBarberMode ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
          <Card title={isBarberMode ? "Mi Historial de Servicios" : "Rendimiento del Staff"}>
            {!isBarberMode && (
              <div className="h-48 mb-6 mt-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                <canvas ref={chartRef}></canvas>
              </div>
            )}

            <div className="space-y-3 mt-4">
              {isBarberMode ? (
                stats.myCuts.map(cut => (
                  <div key={cut.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 border-l-2 border-l-primary">
                    <div>
                      <p className="text-xs font-black text-white uppercase">{cut.serviceName}</p>
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase">{new Date(cut.date).toLocaleTimeString()} - {cut.clientName}</p>
                    </div>
                    <p className="font-headline text-sm text-white">Bs. {parseFloat(cut.price).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                stats.barberStats.map(barber => (
                  <div key={barber.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs text-primary">{barber.name.substring(0,2).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{barber.name}</p>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase">{barber.cutsCount} servicios</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-tighter">Total Generado</p>
                        <p className="text-[11px] font-bold text-white">Bs. {barber.totalGenerated.toFixed(2)}</p>
                      </div>
                      <div className="text-right border-l border-white/5 pl-6">
                        <p className="text-[8px] font-black text-green-500/60 uppercase tracking-tighter">Parte Barbero</p>
                        <p className="text-[11px] font-bold text-green-500">Bs. {barber.commission.toFixed(2)}</p>
                      </div>
                      <div className="text-right border-l border-white/5 pl-6">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">Parte Tienda</p>
                        <p className="text-[11px] font-bold text-primary">Bs. {barber.shopPart.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {!isBarberMode && (
            <Card title="Desglose de Caja">
               <div className="space-y-4 mt-4">
                  <div className="flex justify-between p-3 border-b border-white/5">
                    <span className="text-xs text-on-surface-variant uppercase font-bold">Ingresos Brutos</span>
                    <span className="text-sm font-black text-white">Bs. {stats.totalGross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 border-b border-white/5 text-primary">
                    <span className="text-xs uppercase font-bold">Comisiones Staff</span>
                    <span className="text-sm font-black">- Bs. {stats.totalCommissions.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 border-b border-white/5 text-orange-400">
                    <span className="text-xs uppercase font-bold">Costos Mercancía</span>
                    <span className="text-sm font-black">- Bs. {stats.totalProductCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 border-b border-white/5 text-orange-500">
                    <span className="text-xs uppercase font-bold">Gastos</span>
                    <span className="text-sm font-black">- Bs. {stats.totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-green-500/10 rounded-xl text-green-500 mt-6">
                    <span className="text-xs uppercase font-black">Utilidad Neta</span>
                    <span className="text-lg font-black">Bs. {stats.netProfit.toFixed(2)}</span>
                  </div>
               </div>
            </Card>
          )}
        </div>
      </div>

      {!isBarberMode && (
        <div className="mt-20 pt-10 border-t border-white/5 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border border-primary/10 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-primary font-headline text-lg uppercase mb-1">Mantenimiento de Datos</h3>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Normaliza tipos de datos e IDs antiguos.</p>
            </div>
            <button
              onClick={db.repairDatabase}
              className="px-8 py-4 bg-primary/10 hover:bg-primary border border-primary/50 text-primary hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Reparar Base de Datos
            </button>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-red-500/10 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-red-500 font-headline text-lg uppercase mb-1">Zona de Peligro</h3>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Borrado permanente de historial.</p>
            </div>
            <button
              onClick={() => {
                triggerConfirm(
                  '⚠️ REINICIO TOTAL DEL SISTEMA',
                  'ESTA ACCIÓN BORRARÁ TODOS LOS CORTES, VENTAS, GASTOS Y TURNOS PERMANENTEMENTE. ¿ESTÁS COMPLETAMENTE SEGURO?',
                  resetSystem
                );
              }}
              className="px-8 py-4 bg-red-600/10 hover:bg-red-600 border border-red-600/50 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Reiniciar Datos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

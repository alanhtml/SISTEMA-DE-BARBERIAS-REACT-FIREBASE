import React, { useState, useMemo } from 'react';
import { Button } from '../components/common/UI';

export const QuickCutView = ({ db, user, recordCut, notify }) => {
  const [formData, setFormData] = useState({
    barberId: user?.role === 'barbero' ? user.id : '',
    clientId: 'visitor',
    serviceId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // FILTRO: Solo mostramos usuarios con rol "barbero"
  const barbers = useMemo(() => {
    const rawBarbers = (db?.users || []).filter(u => u.role === 'barbero');
    const uniqueBarbers = [];
    const seenIds = new Set();

    rawBarbers.forEach(b => {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        uniqueBarbers.push(b);
      }
    });
    return uniqueBarbers;
  }, [db?.users]);

  const services = useMemo(() => {
    return [...(db?.services || [])].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
  }, [db?.services]);
  const filteredClients = searchTerm.length > 1
    ? db.clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ci.includes(searchTerm)
      )
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barberId || !formData.serviceId) {
      notify('Selecciona barbero y servicio', 'error');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
      return;
    }

    // Usar fecha local para evitar desfases de horario
    const success = await recordCut({
      ...formData,
      date: new Date().toISOString()
    });

    if (success) {
      setFormData({ barberId: '', clientId: 'visitor', serviceId: '' });
      setSearchTerm('');
      setIsConfirming(false);
      notify('Servicio registrado correctamente');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <header className="mb-8">
        <h2 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tighter text-white neon-text">Corte Express</h2>
        <p className="text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Asignación Directa</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado Izquierdo: Barbero y Servicio */}
        <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-black text-primary mb-4 block tracking-widest">
                {user?.role === 'barbero' ? 'Barbero' : '1. Selecciona al Barbero'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {user?.role === 'barbero' ? (
                  <div className="col-span-2 p-4 rounded-2xl border bg-primary border-primary text-white shadow-lg shadow-primary/20">
                    <p className="text-xs font-black uppercase truncate relative z-10">{user.name}</p>
                    <p className="text-[8px] uppercase font-bold relative z-10 text-white/70">
                      MI PERFIL (REGISTRO DIRECTO)
                    </p>
                  </div>
                ) : (
                  barbers.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => { setFormData({...formData, barberId: b.id}); setIsConfirming(false); }}
                      className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                        formData.barberId === b.id
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-surface border-white/5 text-gray-400'
                      }`}
                    >
                      <p className="text-xs font-black uppercase truncate relative z-10">{b.name}</p>
                      <p className={`text-[8px] uppercase font-bold relative z-10 ${formData.barberId === b.id ? 'text-white/70' : 'text-primary'}`}>
                        {b.role}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-primary mb-4 block tracking-widest">2. Servicio realizado</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary appearance-none cursor-pointer"
                  value={formData.serviceId}
                  onChange={e => { setFormData({...formData, serviceId: e.target.value}); setIsConfirming(false); }}
                >
                  <option value="">Seleccionar Servicio...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name.toUpperCase()} - {s.price} Bs.</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
              </div>
            </div>

            <Button
              type="submit"
              variant={isConfirming ? 'danger' : 'primary'}
              className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase transition-all ${isConfirming ? 'animate-pulse scale-[1.02]' : ''}`}
            >
              {isConfirming ? '¿Confirmar Registro?' : 'Registrar y Cobrar'}
            </Button>
          </form>
        </div>

        {/* Lado Derecho: Cliente */}
        <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10">
          <label className="text-[10px] uppercase font-black text-primary mb-4 block tracking-widest">3. Cliente (Puntos)</label>

          <div className="space-y-4">
            <button
              onClick={() => { setFormData({...formData, clientId: 'visitor'}); setSearchTerm(''); }}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                formData.clientId === 'visitor'
                  ? 'bg-white/10 border-white text-white'
                  : 'bg-surface border-white/5 text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.clientId === 'visitor' ? 'bg-primary text-white' : 'bg-white/5 text-gray-600'}`}>
                <span className="material-symbols-outlined text-lg">person_pin</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase">Cliente Visitante</p>
                <p className="text-[9px] opacity-60 uppercase">Sin registro de puntos</p>
              </div>
            </button>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">search</span>
              <input
                type="text"
                placeholder="BUSCAR CLIENTE..."
                className="w-full bg-surface border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold outline-none focus:border-primary transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
              {filteredClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setFormData({...formData, clientId: c.id});
                    setSearchTerm(c.name);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                    formData.clientId === c.id
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-surface/50 border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div>
                    <p className="text-xs font-black uppercase">{c.name}</p>
                    <p className="text-[9px] opacity-60">CI: {c.ci}</p>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded-lg">{c.totalCuts || 0} cortes</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

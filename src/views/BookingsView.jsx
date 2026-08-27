import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common/UI';

export const BookingsView = ({ db, user, addTurn, notify }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    service: null,
    barber: null,
    time: '',
    date: new Date().toISOString().split('T')[0]
  });

  // FILTRO ESTRICTO: Solo usuarios con rol 'barbero'
  const services = db?.services || [];
  const barbers = (db?.users || []).filter(u => u.role === 'barbero');

  const handleBooking = async () => {
    if (!selection.service || !selection.time) {
      notify('Por favor completa todos los campos', 'error');
      return;
    }

    const success = await addTurn(null, selection.service.id, {
      name: user.name,
      username: user.username,
      barberId: selection.barber?.id,
      scheduledTime: `${selection.date} ${selection.time}`,
      phone: user.phone || '',
      isPremium: !!selection.service.isPremium
    });

    if (success) {
      setStep(4); // Paso de éxito
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">

      {/* Botón de Retroceso (Flecha) */}
      <AnimatePresence>
        {step > 1 && step < 4 && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => setStep(step - 1)}
            className="absolute -top-4 left-0 md:-left-12 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all z-10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </motion.button>
        )}
      </AnimatePresence>

      <header className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
           <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
        </motion.div>
        <h1 className="font-anton text-4xl md:text-5xl text-white uppercase tracking-tighter">Reserva tu Experiencia</h1>
        <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-primary' : 'w-4 bg-white/10'}`}></div>
            ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="font-anton text-xl text-white uppercase text-center flex items-center justify-center gap-3">
               <span className="text-primary/40 text-sm">01</span> Selecciona el Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelection({...selection, service: s}); setStep(2); }}
                  className={`p-6 rounded-[2rem] border-2 text-left transition-all group relative overflow-hidden ${selection.service?.id === s.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-[#0a0a0a] hover:border-white/20'}`}
                >
                  {s.isPremium && (
                    <div className="absolute top-0 right-0 bg-primary text-black text-[8px] font-black px-4 py-1 rotate-45 translate-x-3 -translate-y-1 uppercase">
                      Premium
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-anton text-xl text-white uppercase group-hover:text-primary transition-colors">{s.name}</span>
                    <span className="text-primary font-bold">Bs. {s.price}</span>
                  </div>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    {s.isPremium ? '60 MINUTOS (BLOQUE DOBLE)' : `${s.duration || '30'} MINUTOS`}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="font-anton text-xl text-white uppercase text-center flex items-center justify-center gap-3">
               <span className="text-primary/40 text-sm">02</span> Elige a tu Barbero
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => { setSelection({...selection, barber: null}); setStep(3); }}
                className={`p-6 rounded-[2rem] border-2 transition-all group ${!selection.barber ? 'border-primary bg-primary/5' : 'border-white/5 bg-[#0a0a0a]'}`}
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-white/20 text-3xl">group</span>
                </div>
                <p className="font-anton text-sm text-white uppercase">Cualquiera</p>
                <p className="text-[8px] text-primary/60 uppercase mt-1">Más rápido</p>
              </button>
              {barbers.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelection({...selection, barber: b}); setStep(3); }}
                  className={`p-6 rounded-[2rem] border-2 transition-all group ${selection.barber?.id === b.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-[#0a0a0a]'}`}
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto mb-4 flex items-center justify-center font-anton text-2xl text-primary group-hover:rotate-6 transition-transform">
                     {b.name.charAt(0)}
                  </div>
                  <p className="font-anton text-sm text-white uppercase truncate">{b.name.split(' ')[0]}</p>
                  <p className="text-[8px] text-white/30 uppercase mt-1">Especialista</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
            <h3 className="font-anton text-xl text-white uppercase flex items-center justify-center gap-3">
               <span className="text-primary/40 text-sm">03</span> Fecha y Hora
            </h3>

            <div className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 inline-block">
                <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selection.date}
                onChange={(e) => setSelection({...selection, date: e.target.value})}
                className="bg-transparent text-white font-anton text-2xl uppercase tracking-[0.2em] outline-none text-center cursor-pointer"
                />
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setSelection({...selection, time: t})}
                  className={`py-4 rounded-xl font-anton text-sm transition-all ${selection.time === t ? 'bg-primary text-black scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-8">
              <Button
                onClick={handleBooking}
                disabled={!selection.time}
                className="w-full max-w-md py-6 text-lg shadow-[0_0_30px_rgba(197,160,89,0.2)]"
              >
                CONFIRMAR RESERVA GOLD
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 py-12">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
            </div>
            <h2 className="font-anton text-4xl text-white uppercase tracking-tighter">¡Cita Confirmada!</h2>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 max-w-xs mx-auto">
                <p className="text-white font-anton uppercase text-xl">{selection.service?.name}</p>
                <p className="text-primary font-mono text-[10px] uppercase tracking-widest mt-2">
                    {selection.date} • {selection.time}
                </p>
                <p className="text-white/40 text-[9px] uppercase mt-4">Con {selection.barber?.name || 'Staff Urban'}</p>
            </div>
            <div className="pt-8">
                <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>Ir a mi panel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

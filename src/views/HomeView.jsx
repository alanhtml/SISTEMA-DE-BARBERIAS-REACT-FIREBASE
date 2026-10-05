import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export const HomeView = ({ db, addTurn, notify, user }) => {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estado para el formulario de reserva
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    serviceId: '',
    barberId: '',
    scheduledTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const barbers = useMemo(() => {
    return (db?.users || []).filter(u => u.role === 'barbero');
  }, [db?.users]);

  const availableSlots = useMemo(() => {
    if (!bookingData.barberId) return [];

    const slots = [];
    for (let h = 9; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const isTaken = (db?.turns || []).some(t =>
          t.barberId === bookingData.barberId &&
          t.scheduledTime === time &&
          t.status !== 'cancelado'
        );
        if (!isTaken) slots.push(time);
      }
    }
    return slots;
  }, [bookingData.barberId, db?.turns]);

  const selectedBarber = useMemo(() => barbers.find(b => b.id === bookingData.barberId), [barbers, bookingData.barberId]);
  const selectedService = useMemo(() => (db?.services || []).find(s => s.id === bookingData.serviceId), [db?.services, bookingData.serviceId]);

  const nextStep = () => setBookingStep(prev => prev + 1);
  const prevStep = () => setBookingStep(prev => prev - 1);
  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep(1);
    setBookingData({ name: '', phone: '', serviceId: '', barberId: '', scheduledTime: '' });
  };

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yBg = useTransform(smoothProgress, [0, 1], ['0%', '20%']);

  const handleBookingClick = (serviceId = null) => {
    if (!user) {
      notify('Inicia sesión para reservar tu cita', 'info');
      navigate('/login');
      return;
    }
    if (serviceId) {
      setBookingData(prev => ({ ...prev, serviceId }));
    }
    setShowBooking(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans overflow-x-hidden selection:bg-[#c5a059] selection:text-black">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@300;400;700&family=JetBrains+Mono:wght@500&display=swap');
        .font-anton { font-family: 'Anton', sans-serif; }
        .font-hanken { font-family: 'Hanken Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .nav-link {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #ffffff !important;
          opacity: 0.8;
          transition: all 0.3s;
          font-weight: 700;
          cursor: pointer;
        }
        .nav-link:hover {
          color: #c5a059 !important;
          opacity: 1;
        }

        .bg-grid {
            background-size: 60px 60px;
            background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
        }

        .gold-button {
          background-color: #c5a059;
          color: #000;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 12px 24px;
          transition: all 0.3s;
        }
        .gold-button:hover {
          background-color: #d4b47a;
          transform: translateY(-2px);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c5a059; }
      `}</style>

      {/* Modern Header */}
      <header className="fixed w-full top-0 z-[100] px-4 py-4 md:px-12 flex justify-between items-center backdrop-blur-md bg-black/80 border-b border-white/5">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c5a059] text-2xl md:text-3xl">content_cut</span>
            <div className="flex flex-col">
              <h1 className="font-anton text-sm md:text-2xl tracking-tighter uppercase text-white leading-none">Urban</h1>
              <h1 className="font-anton text-sm md:text-2xl tracking-tighter uppercase text-[#c5a059] leading-none">Barber</h1>
            </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-10">
          <a href="#" className="nav-link">Inicio</a>
          <a href="#nosotros" className="nav-link">Nosotros</a>
          <a href="#servicios" className="nav-link">Servicios</a>
          <a href="#citas" className="nav-link">Citas</a>
          {!user ? (
            <button onClick={() => navigate('/login')} className="nav-link">Entrar</button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="nav-link">Panel</button>
          )}
        </nav>

        {/* Desktop Action Button */}
        <button
          onClick={() => handleBookingClick()}
          className="hidden lg:block gold-button text-[11px] px-6 py-3"
        >
          Reservar
        </button>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleBookingClick()}
              className="gold-button text-[9px] px-3 py-2 rounded-sm"
            >
              Reservar
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-[#c5a059] bg-white/5 border border-white/10 rounded-sm"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-8 lg:hidden"
          >
             <div className="absolute top-8 left-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c5a059] text-3xl">content_cut</span>
                  <h1 className="font-anton text-2xl tracking-tighter uppercase text-white">Urban Barber</h1>
                </div>
             </div>

             <nav className="flex flex-col items-center gap-8 mb-12">
                <a href="#" onClick={() => setIsMenuOpen(false)} className="font-anton text-4xl text-white uppercase italic hover:text-[#c5a059] transition-colors">Inicio</a>
                <a href="#nosotros" onClick={() => setIsMenuOpen(false)} className="font-anton text-4xl text-white uppercase italic hover:text-[#c5a059] transition-colors">Nosotros</a>
                <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="font-anton text-4xl text-white uppercase italic hover:text-[#c5a059] transition-colors">Servicios</a>
                <a href="#citas" onClick={() => setIsMenuOpen(false)} className="font-anton text-4xl text-white uppercase italic hover:text-[#c5a059] transition-colors">Citas</a>
             </nav>

             <div className="flex flex-col w-full gap-4 max-w-xs">
                {!user ? (
                  <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="w-full py-4 border border-white/20 text-white font-anton uppercase italic text-xl tracking-widest">Entrar</button>
                ) : (
                  <button onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }} className="w-full py-4 border border-white/20 text-white font-anton uppercase italic text-xl tracking-widest">Panel de Control</button>
                )}
                <button
                  onClick={() => { setIsMenuOpen(false); handleBookingClick(); }}
                  className="gold-button w-full py-5 text-lg"
                >
                  Reservar Ahora
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Refined dark moody aesthetic */}
      <section className="relative h-screen flex items-center justify-start px-6 md:px-24 overflow-hidden bg-black">
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60 contrast-[1.1] brightness-[0.7]"
              style={{
                backgroundImage: 'url("/barberia_1.jpeg")',
              }}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        </motion.div>

        <div className="relative z-10 max-w-4xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
                <p className="font-mono text-[#c5a059] text-xs md:text-sm tracking-[0.4em] mb-6 uppercase">By Urban Barber</p>
                <h2 className="font-anton text-[12vw] md:text-[8vw] leading-[0.9] mb-8 uppercase tracking-tighter text-white">
                  Love is in <br/> the Hair
                </h2>

                <div className="flex flex-col md:flex-row gap-6 mt-12">
                   <button
                        onClick={() => handleBookingClick()}
                        className="gold-button px-12 py-5 text-sm"
                    >
                        Reservar Ahora
                    </button>
                    <div className="flex items-center gap-4 px-6 border-l border-white/10">
                       <div className="w-10 h-[1px] bg-[#c5a059]" />
                       <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.3em]">Precision • Style • Elite Service</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Animated Accent */}
        <div className="absolute bottom-20 right-24 hidden xl:block">
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="relative w-40 h-40 flex items-center justify-center"
           >
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white/5 uppercase font-anton text-[8px] tracking-[2px]">
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                <text>
                  <textPath href="#circlePath">Urban Barber • The Elite Experience • Luxury Cutting •</textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[#c5a059] text-4xl">verified</span>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros & Info Corporativa - Mobile Optimized */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-white/5" id="nosotros">
        {/* Parte Superior: Estética de la Captura */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative"
            >
                <div className="aspect-[4/5] overflow-hidden border border-white/10 p-3 md:p-4 bg-white/5 max-w-sm mx-auto lg:ml-0">
                    <img
                      src="https://images.unsplash.com/photo-1593702295094-17256731ee37?auto=format&fit=crop&q=80&w=2070"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                      alt="The Barber"
                    />
                </div>
                {/* Cuadro EST. 2024 - Ajustado para móvil */}
                <div className="absolute -bottom-4 -right-2 md:-bottom-10 md:-right-10 bg-[#c5a059] p-6 md:p-10 z-10 shadow-xl">
                    <p className="font-anton text-2xl md:text-4xl text-black italic leading-none uppercase text-center">EST. <br/> 2024</p>
                </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-6 md:space-y-8 text-center lg:text-left mt-10 lg:mt-0"
            >
                <span className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.5em]">The Legacy</span>
                <h3 className="font-anton text-4xl md:text-7xl uppercase italic tracking-tighter text-white leading-[0.9]">
                  Más que un Corte, <br/> Una Experiencia
                </h3>
                <p className="font-hanken text-white/60 text-sm md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  En Urban Barber, fusionamos la técnica clásica de la barbería con las tendencias más vanguardistas del street style. Nuestra misión es esculpir no solo tu cabello, sino tu confianza.
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-10 pt-8 border-t border-white/5">
                    <div>
                        <h4 className="font-anton text-2xl md:text-4xl text-[#c5a059] mb-1">100%</h4>
                        <p className="font-mono text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest">Precisión Técnica</p>
                    </div>
                    <div>
                        <h4 className="font-anton text-2xl md:text-4xl text-[#c5a059] mb-1">+500</h4>
                        <p className="font-mono text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest">Clientes Satisfechos</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Parte Inferior: Información de Contacto y Reglas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
             {/* Caja de Ubicación */}
             <div className="p-8 md:p-12 bg-white/[0.02] border border-white/5 space-y-8 hover:border-white/10 transition-colors">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <span className="material-symbols-outlined text-[#c5a059] text-4xl">location_on</span>
                    <div>
                        <h5 className="font-mono text-[10px] text-[#c5a059] uppercase tracking-widest mb-2">Ubicación en El Alto</h5>
                        <p className="font-anton text-xl md:text-2xl text-white uppercase tracking-tight">Av. Unión Calle 5<br/>La Paz - Bolivia</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <span className="material-symbols-outlined text-[#c5a059] text-4xl">call</span>
                    <div>
                        <h5 className="font-mono text-[10px] text-[#c5a059] uppercase tracking-widest mb-2">Contacto WhatsApp</h5>
                        <p className="font-anton text-3xl text-white tracking-tighter italic">71250985</p>
                    </div>
                </div>
             </div>

             {/* Caja de Protocolo de Reserva */}
             <div className="p-8 md:p-12 border border-[#c5a059]/30 bg-[#c5a059]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/10 -mr-12 -mt-12 rotate-45 transition-transform group-hover:scale-150 duration-700" />
                <h4 className="font-anton text-2xl text-white mb-6 uppercase italic text-center md:text-left">Reglas de Reserva</h4>
                <ul className="space-y-4 font-hanken text-[10px] md:text-[11px] text-white/70 uppercase tracking-widest leading-relaxed">
                    <li className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-[#c5a059] rounded-full" />
                        <span>Debes <b>Iniciar Sesión</b> con tu cuenta.</span>
                    </li>
                    <li className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-[#c5a059] rounded-full" />
                        <span>Usaremos tus datos de <b>Google</b> para el perfil.</span>
                    </li>
                    <li className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-[#c5a059] rounded-full" />
                        <span>Pide tu turno y danos tu <b>Celular</b> para confirmar.</span>
                    </li>
                </ul>
             </div>
        </div>
      </section>

      {/* Portafolio Section */}
      <section className="py-20 bg-[#050505]" id="portafolio">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{opacity:0}} whileInView={{opacity:1}} className="mb-12 text-center">
                <span className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.5em] mb-4 block">Visual Excellence</span>
                <h3 className="font-anton text-4xl md:text-5xl mb-4 italic opacity-10 tracking-tighter uppercase">Portafolio</h3>
                <div className="h-[1px] w-24 bg-[#c5a059] mx-auto" />
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                    "https://images.unsplash.com/photo-1621605815841-aa897bd07b44?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1599351431247-f509403c7344?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1512690196236-d44ce33b4718?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1592647425447-18253f938a77?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070",
                    "https://images.unsplash.com/photo-1621605815841-aa897bd07b44?auto=format&fit=crop&q=80&w=2070"
                ].map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative group overflow-hidden aspect-square border border-white/5"
                    >
                        <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="Work" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="font-anton text-[#c5a059] text-xs italic uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">Style {i+1}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Mis Citas Section */}
      <section className="py-40 px-6 max-w-5xl mx-auto" id="citas">
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} className="text-center mb-16">
            <span className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.5em] mb-4 block">Personal Dashboard</span>
            <h3 className="font-anton text-5xl md:text-7xl mb-4 italic opacity-10 tracking-tighter uppercase">Mis Citas</h3>
            <div className="h-[1px] w-24 bg-[#c5a059] mx-auto" />
        </motion.div>

        {!user ? (
            <div className="bg-white/[0.02] border border-dashed border-white/10 p-20 text-center">
                <p className="font-hanken text-white/40 uppercase tracking-widest mb-10 italic">
                    Inicia sesión para gestionar tus citas y ver tu historial.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="gold-button px-16 py-6"
                >
                    Identificarse Ahora
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center font-anton text-black text-xl">
                            {user.name?.[0]}
                        </div>
                        <div className="text-left">
                            <p className="font-mono text-[9px] text-[#c5a059] uppercase">Bienvenido</p>
                            <h4 className="font-anton text-2xl text-white uppercase italic tracking-tight">{user.name}</h4>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {db.turns.filter(t =>
                        String(t.clientId) === String(user.id) ||
                        (t.username && t.username === user.username) ||
                        (t.clientUsername && t.clientUsername === user.username)
                    ).length > 0 ? (
                        db.turns.filter(t =>
                            String(t.clientId) === String(user.id) ||
                            (t.username && t.username === user.username) ||
                            (t.clientUsername && t.clientUsername === user.username)
                        ).map(t => (
                            <div key={t.id} className="bg-white/[0.02] border border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#c5a059]/30 transition-all">
                                <div className="text-left space-y-1">
                                    <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">Cita de Servicio</p>
                                    <h5 className="font-anton text-2xl text-white uppercase italic">{t.serviceName}</h5>
                                    <p className="font-hanken text-white/40 text-xs">Con {db.users.find(u => String(u.id) === String(t.barberId))?.name || 'Especialista'}</p>
                                </div>
                                <div className="text-right flex items-center gap-10">
                                    <div className="text-center md:text-right">
                                        <p className="font-anton text-3xl text-[#c5a059] leading-none">{t.scheduledTime}</p>
                                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">Hoy</p>
                                    </div>
                                    <div className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-widest ${t.status === 'esperando' ? 'border-[#c5a059] text-[#c5a059]' : 'border-white/10 text-white/20'}`}>
                                        {t.status}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-white/5 bg-white/[0.01]">
                            <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.4em]">No tienes citas activas para hoy.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </section>

      {/* Modal de Reserva - Updated to Gold/Black */}
      <section className="py-40 px-6 max-w-7xl mx-auto" id="servicios">
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} className="mb-24 flex flex-col items-center">
          <span className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.5em] mb-4">Elite Catalogue</span>
          <h3 className="font-anton text-6xl md:text-8xl mb-4 italic opacity-10 tracking-tighter uppercase">Premium Services</h3>
          <div className="h-[1px] w-24 bg-[#c5a059]" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {([...(db?.services || [])].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))).map((s, i) => (
                <Tilt key={s.id} perspective={2000} tiltMaxAngleX={5} tiltMaxAngleY={5} className="h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.02] p-10 border border-white/5 h-full relative overflow-hidden group hover:border-[#c5a059]/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(197,160,89,0.05)]"
                    >
                        <div className="absolute top-0 right-0 bg-[#c5a059] text-black font-anton text-xl px-5 py-3 italic z-20">
                            {s.price} BS
                        </div>

                        <div className="relative z-10">
                            <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.4em] mb-6 block">Ref. 00{i+1}</span>
                            <h3 className="font-anton text-3xl text-white mb-6 uppercase tracking-tight group-hover:text-[#c5a059] transition-colors">
                                {s.name}
                            </h3>
                            <p className="font-hanken text-white/40 text-xs mb-10 leading-relaxed uppercase italic">
                                {s.description || 'Professional execution with high-end finishing and advanced techniques.'}
                            </p>

                            <button
                              onClick={() => handleBookingClick(s.id)}
                              className="w-full py-4 border border-white/10 hover:border-[#c5a059] hover:text-[#c5a059] text-white font-mono text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4"
                            >
                              Reserva Directa
                              <span className="material-symbols-outlined text-sm">arrow_outward</span>
                            </button>
                        </div>
                    </motion.div>
                </Tilt>
            ))}
        </div>
      </section>

      {/* Modal de Reserva - Updated to Gold/Black */}
      <AnimatePresence>
        {showBooking && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={resetBooking}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-[#080808] border border-white/5 p-10 md:p-14 max-w-xl w-full text-center"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-[#c5a059]" />

                    <h4 className="font-anton text-4xl text-white mb-4 uppercase italic">Registrar Cita</h4>
                    <p className="font-hanken text-[10px] text-white/30 uppercase tracking-[0.2em] mb-10">
                       Complete su reserva para asegurar su espacio elite.
                    </p>

                    <div className="mb-12 flex justify-center gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-[2px] w-8 transition-colors ${bookingStep >= s ? 'bg-[#c5a059]' : 'bg-white/10'}`} />
                        ))}
                    </div>

                    <form className="space-y-8" onSubmit={async (e) => {
                        e.preventDefault();
                        if (bookingStep < 4) { nextStep(); return; }

                        if (!bookingData.name || !bookingData.serviceId || !bookingData.phone || !bookingData.barberId || !bookingData.scheduledTime) {
                            notify('Complete todos los campos', 'error');
                            return;
                        }
                        setIsSubmitting(true);
                        try {
                            const barber = barbers.find(b => b.id === bookingData.barberId);
                            const service = (db?.services || []).find(s => s.id === bookingData.serviceId);

                            await addTurn(user?.id || null, bookingData.serviceId, {
                                name: bookingData.name.toUpperCase(),
                                phone: bookingData.phone,
                                barberId: bookingData.barberId,
                                scheduledTime: bookingData.scheduledTime,
                                username: user?.username || ''
                            });

                            const msg = `RESERVA URBAN BARBER\nCLIENTE: ${bookingData.name.toUpperCase()}\nSERVICIO: ${service?.name.toUpperCase()}\nBARBERO: ${barber?.name.toUpperCase()}\nHORA: ${bookingData.scheduledTime} HS`;
                            const whatsappUrl = `https://wa.me/591${db.settings?.phone || '71250985'}?text=${encodeURIComponent(msg)}`;

                            resetBooking();
                            window.open(whatsappUrl, '_blank');
                            notify('CITA REGISTRADA CORRECTAMENTE', 'success');
                        } catch (_err) {
                            notify('Error al procesar reserva', 'error');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}>
                        <AnimatePresence mode="wait">
                            {bookingStep === 1 && (
                                <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="grid grid-cols-1 gap-3">
                                    <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-[0.3em] text-left">Seleccione su Barbero</label>
                                    {barbers.map(b => (
                                        <button key={b.id} type="button" onClick={() => { setBookingData({...bookingData, barberId: b.id}); nextStep(); }} className={`w-full p-5 border font-mono text-[10px] uppercase tracking-widest transition-all ${bookingData.barberId === b.id ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'}`}>
                                            {b.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {bookingStep === 2 && (
                                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                                    <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-[0.3em] text-left block">Elegir Servicio</label>
                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {[...(db?.services || [])].sort((a,b) => a.price - b.price).map(s => (
                                            <button key={s.id} type="button" onClick={() => { setBookingData({...bookingData, serviceId: s.id}); nextStep(); }} className={`w-full p-5 border font-mono text-[10px] uppercase tracking-widest transition-all text-left flex justify-between items-center ${bookingData.serviceId === s.id ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'}`}>
                                                <span>{s.name}</span>
                                                <span className="font-anton">Bs. {s.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 3 && (
                                <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                                    <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-[0.3em] text-left block">Horarios Hoy</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {availableSlots.map(time => (
                                            <button key={time} type="button" onClick={() => { setBookingData({...bookingData, scheduledTime: time}); nextStep(); }} className={`p-4 border font-mono text-[10px] transition-all ${bookingData.scheduledTime === time ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'}`}>
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 4 && (
                                <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                                    <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-[0.3em] text-left block">Información de Contacto</label>
                                    <input type="text" placeholder="SU NOMBRE" required autoFocus value={bookingData.name} onChange={(e) => setBookingData({...bookingData, name: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 p-5 font-mono text-xs text-white focus:border-[#c5a059] outline-none transition-colors" />
                                    <input type="tel" placeholder="NRO CELULAR" required value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 font-mono text-xs text-white focus:border-[#c5a059] outline-none transition-colors" />

                                    <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 text-left">
                                        <p className="text-[8px] font-mono text-[#c5a059] uppercase tracking-widest mb-2">Resumen de Cita:</p>
                                        <p className="text-xs font-anton text-white uppercase italic">{selectedBarber?.name} • {selectedService?.name}</p>
                                        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">Hoy a las {bookingData.scheduledTime} HS</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-6 flex flex-col gap-4">
                            {bookingStep === 4 && (
                                <button type="submit" disabled={isSubmitting} className="gold-button w-full py-6 text-base">
                                    {isSubmitting ? 'REGISTRANDO...' : 'FINALIZAR RESERVA'}
                                </button>
                            )}

                            <div className="flex gap-4">
                                {bookingStep > 1 && (
                                    <button type="button" onClick={prevStep} className="flex-1 border border-white/10 text-white/40 font-mono text-[9px] py-4 uppercase hover:text-white">Atrás</button>
                                )}
                                <button type="button" onClick={resetBooking} className="flex-1 border border-white/10 text-white/20 font-mono text-[9px] py-4 uppercase hover:text-white">{bookingStep === 4 ? 'Cancelar' : 'Salir'}</button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <footer className="py-24 px-6 text-center border-t border-white/5 bg-[#050505]">
        <div className="flex items-center justify-center gap-2 mb-8">
           <span className="material-symbols-outlined text-[#c5a059] text-2xl">content_cut</span>
           <div className="font-anton text-3xl italic tracking-tighter uppercase text-white/40">Urban Barber</div>
        </div>
        <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/10">Precision Engine • Luxury Experience • © 2024</p>
      </footer>
    </div>
  );
};

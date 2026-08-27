import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LoginView = ({ onLogin, loginWithGoogle, finalizeGoogleLogin }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [phone, setPhone] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [mode, setMode] = useState('client'); // 'client' por defecto
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const success = await onLogin(u, p);
      if (success) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result === true) {
        navigate('/dashboard');
      } else if (result && result.needsPhone) {
        setPendingUser(result);
        setMode('complete-profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 7) return;
    setLoading(true);
    try {
      const success = await finalizeGoogleLogin(pendingUser, phone);
      if (success) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active  {
            -webkit-box-shadow: 0 0 0px 1000px #080808 inset !important;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Fondo Animado con tono dorado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c5a059]/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#c5a059]/5 blur-[150px] rounded-full"></div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 5 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-3 text-white/40 hover:text-[#c5a059] transition-colors z-50 group"
      >
        <span className="material-symbols-outlined text-xl">west</span>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase font-bold">Volver</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full p-8 md:p-12 bg-[#080808] border border-white/5 relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
      >
        <div className="w-16 h-16 bg-[#c5a059] mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(197,160,89,0.2)]">
          <span className="material-symbols-outlined text-black text-3xl">content_cut</span>
        </div>

        <h1 className="font-anton text-3xl text-white tracking-tighter mb-2 text-center uppercase">Urban Barber</h1>

        <div className="flex gap-4 mb-8 border-b border-white/5">
            <button
                onClick={() => setMode('staff')}
                className={`flex-1 pb-4 font-mono text-[10px] uppercase tracking-widest transition-all ${mode === 'staff' ? 'text-[#c5a059] border-b-2 border-[#c5a059]' : 'text-white/20'}`}
            >
                Staff
            </button>
            <button
                onClick={() => setMode('client')}
                className={`flex-1 pb-4 font-mono text-[10px] uppercase tracking-widest transition-all ${mode === 'client' ? 'text-[#c5a059] border-b-2 border-[#c5a059]' : 'text-white/20'}`}
            >
                Clientes
            </button>
        </div>

        {mode === 'complete-profile' ? (
            <form onSubmit={handleCompleteProfile} className="space-y-6">
                <div className="text-center mb-6">
                    <p className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold">Último paso</p>
                    <h2 className="font-anton text-xl text-white uppercase mt-1">Tu número de contacto</h2>
                </div>

                <div className="space-y-1">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest ml-1">WhatsApp / Celular</label>
                    <input
                        type="tel"
                        required
                        placeholder="70000000"
                        className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-xs tracking-widest focus:border-[#c5a059] transition-all outline-none"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className={`w-full bg-[#c5a059] text-black py-5 font-anton text-lg uppercase tracking-wider transition-all hover:bg-[#d4b47a] ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {loading ? 'Finalizando...' : 'Completar Registro'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('client'); setPendingUser(null); }}
                  className="w-full text-white/20 font-mono text-[8px] uppercase tracking-widest hover:text-white/40"
                >
                  Cancelar
                </button>
            </form>
        ) : mode === 'staff' ? (
            <form
                onSubmit={handleManualLogin}
                className="space-y-6"
                autoComplete="off"
            >
                {/* Honeypot para capturar el autorrelleno del navegador */}
                <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden' }}>
                    <input type="text" name="fake_user" tabIndex="-1" />
                    <input type="password" name="fake_pass" tabIndex="-1" />
                </div>

                <div className="space-y-1">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest ml-1">Usuario / Email</label>
                    <input
                        type="search"
                        name="user_login_field"
                        autoComplete="off"
                        placeholder="ADMIN_USER"
                        className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-xs tracking-widest focus:border-[#c5a059] transition-all outline-none"
                        value={u}
                        onChange={e => setU(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest ml-1">Contraseña</label>
                    <input
                        type="password"
                        name="pass_login_field"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-xs tracking-widest focus:border-[#c5a059] transition-all outline-none"
                        value={p}
                        onChange={e => setP(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className={`w-full bg-[#c5a059] text-black py-5 font-anton text-lg uppercase tracking-wider transition-all hover:bg-[#d4b47a] ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {loading ? 'Procesando...' : 'Entrar al Sistema'}
                </button>
            </form>
        ) : (
            <div className="space-y-6 py-4">
                <p className="font-mono text-[10px] text-white/40 text-center uppercase leading-loose italic">
                    Gestiona tus citas, mira tu historial y accede a promociones exclusivas.
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className={`w-full bg-white text-black py-5 font-anton text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-4 hover:bg-gray-200 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    {loading ? 'Conectando...' : 'Entrar con Google'}
                </button>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                    <span className="font-mono text-[8px] text-white/20 uppercase">O también</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                <button
                    onClick={() => setMode('staff')}
                    className="w-full border border-white/10 text-white/60 py-4 font-mono text-[10px] uppercase tracking-widest hover:text-[#c5a059] transition-colors"
                >
                    Acceso con Usuario
                </button>
            </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center opacity-30">
            <span className="font-mono text-[8px] uppercase tracking-tighter text-white">Urban Barber Secure Gate</span>
            <div className="flex gap-2">
                <div className="w-1 h-1 bg-[#c5a059] rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-[#c5a059] rounded-full"></div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

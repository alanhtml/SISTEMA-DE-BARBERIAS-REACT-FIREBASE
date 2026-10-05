  # 🎨 GUÍA DE DISEÑO: DARK LUXURY & GOLDEN MINIMALIST

  Este documento contiene todo lo necesario para replicar exactamente la interfaz y el diseño visual de este sistema (Dashboard, Layout, Sidebar, Tarjetas y Estética) en cualquier otro proyecto web (React + Vite).

  ---

  ## 📦 1. ¿Qué librerías debo instalar?

  En la raíz de tu nuevo proyecto ejecuta:

  ```bash
  # Animaciones e interactividad fluida
  npm install framer-motion react-router-dom

  # Tailwind CSS y PostCSS
  npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
  ```

  ---

  ## 🔤 2. Fuentes e Iconos (`index.html`)

  El impacto visual depende en un 80% de la tipografía condensada y los iconos. Abre tu `index.html` y agrega esto dentro de la etiqueta `<head>`:

  ```html
  <!-- Fuentes de Google: Anton (Números/Títulos), Montserrat (Subtítulos), Inter (Textos) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Iconos Google Material Symbols Outlined -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">
  ```

  ---

  ## ⚙️ 3. Configuración de Tailwind y PostCSS

  ### `postcss.config.js`
  Crea o actualiza este archivo en la raíz del proyecto:

  ```javascript
  export default {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  }
  ```

  ### `tailwind.config.js`
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#c5a059',              // Dorado principal
          surface: '#000000',              // Negro de fondo
          'surface-variant': '#0a0a0a',    // Negro paneles
        },
        fontFamily: {
          headline: ['Montserrat', 'sans-serif'],
          anton: ['Anton', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
  ```

  ---

  ## 🎨 4. Estilos Globales (`src/index.css`)

  Reemplaza tu `src/index.css` con lo siguiente:

  ```css
  @import "tailwindcss";

  @theme {
    --color-primary: #c5a059;
    --color-surface: #000000;
    --color-surface-variant: #0a0a0a;

    --font-headline: "Montserrat", sans-serif;
    --font-anton: "Anton", sans-serif;
  }

  :root {
    --primary: #c5a059;
    --bg: #000000;
    --surface: #0c0c0c;
  }

  body {
    background-color: #000000 !important;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
    margin: 0;
    -webkit-tap-highlight-color: transparent;
  }

  /* Clases Tipográficas */
  .font-headline { font-family: 'Montserrat', sans-serif; }
  .font-anton { font-family: 'Anton', sans-serif; }

  /* Efecto Glassmorphism */
  .glass-card {
    background: rgba(12, 12, 12, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .glass-card:hover {
    border-color: rgba(197, 160, 89, 0.3);
  }

  /* Efectos Glow / Neón */
  .neon-glow {
    box-shadow: 0px 0px 20px rgba(197, 160, 89, 0.4), 0px 0px 40px rgba(197, 160, 89, 0.1);
  }

  .neon-text {
    text-shadow: 0px 0px 10px rgba(197, 160, 89, 0.5), 0px 0px 20px rgba(197, 160, 89, 0.2);
  }

  /* Barra de desplazamiento estética */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(197, 160, 89, 0.2);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover { background: #c5a059; }
  ```

  ---

  ## 📐 5. Paleta de Colores y Reglas de Diseño

  | Elemento | Código Hex / Clase Tailwind | Propósito |
  | :--- | :--- | :--- |
  | **Fondo Principal** | `#000000` (`bg-black`) | Máximo contraste y sensación premium |
  | **Fondo de Tarjetas** | `#0c0c0c` (`bg-[#0c0c0c]`) | Tarjetas de métricas, feeds y módulos |
  | **Fondo Sidebar** | `#050505` (`bg-[#050505]`) | Barra lateral fija |
  | **Acento Dorado** | `#c5a059` (`text-[#c5a059]`, `bg-[#c5a059]`) | Color de acción, números clave y bordes activos |
  | **Bordes Estándar** | `border border-white/5` | Líneas ultrafinas de separación al 5% opacidad |
  | **Bordes Hover** | `hover:border-[#c5a059]/30` | Brillo dorado sutil al pasar el cursor |
  | **Etiquetas / Labels** | `text-[9px] font-black uppercase tracking-widest text-white/30` | Microtipografía estilo terminal de lujo |

  ---

  ## 🧱 6. Componentes Listos para Copiar y Pegar

  ### A. Layout con Sidebar (`src/components/layout/Sidebar.jsx`)

  ```jsx
  import React from 'react';
  import { NavLink } from 'react-router-dom';
  import { motion, AnimatePresence } from 'framer-motion';

  export const Sidebar = ({ isOpen, setIsOpen }) => {
    const menuItems = [
      { path: '/', icon: 'dashboard', label: 'Mi Panel' },
      { path: '/ventas', icon: 'bolt', label: 'Operaciones' },
      { path: '/clientes', icon: 'groups', label: 'Clientes' },
      { path: '/inventario', icon: 'inventory_2', label: 'Inventario' },
      { path: '/reportes', icon: 'analytics', label: 'Analítica' },
    ];

    return (
      <>
        {/* Backdrop Móvil */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Barra Lateral */}
        <motion.aside
          initial={false}
          animate={{ x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -300 : 0) }}
          className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50 shadow-2xl"
        >
          {/* Marca / Logo */}
          <div className="p-8 flex justify-between items-center">
            <div>
              <h1 className="font-anton text-2xl font-black text-white tracking-tighter leading-none uppercase">MI SISTEMA</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">Live Monitor</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Enlaces de Navegación */}
          <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                className={({ isActive }) => `
                  relative group flex items-center gap-4 px-5 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-[#c5a059]' : 'group-hover:text-[#c5a059]'}`}>
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-[#c5a059]/10 border-l-2 border-[#c5a059] rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.aside>
      </>
    );
  };
  ```

  ---

  ### B. Vista del Dashboard (`src/views/DashboardView.jsx`)

  ```jsx
  import React from 'react';
  import { motion } from 'framer-motion';

  export const DashboardView = () => {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans overflow-x-hidden pb-24">
        
        {/* CABECERA */}
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-anton text-2xl md:text-4xl leading-none tracking-tighter uppercase italic text-white/90">
              OPERATIONS <span className="text-[#c5a059]">HUB</span>
            </h1>
            <div className="mt-1 flex items-center gap-2 text-white/40 font-bold text-[9px] md:text-xs tracking-widest uppercase">
              <span>MONITOR EN VIVO</span>
              <span className="text-[#c5a059]">•</span>
              <span>{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/60">SISTEMA ACTIVO</span>
          </div>
        </header>

        {/* CINTA DE NOTIFICACIÓN SUPERIOR */}
        <div className="w-full bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 py-3 mb-6 text-center">
          <span className="text-[9px] md:text-xs font-black text-[#c5a059]/50 uppercase tracking-[0.4em]">
            Turnos y cola operativa al día
          </span>
        </div>

        {/* GRID PRINCIPAL: 8 COLS (Métricas) + 4 COLS (Acción / Alerta) */}
        <div className="grid grid-cols-12 gap-4">

          {/* COLUMNA IZQUIERDA */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            
            {/* TARJETAS KPI 2x2 */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
                <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Utilidad Neta</h4>
                <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">$ 3,450</p>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
                <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Ingresos Brutos</h4>
                <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">$ 5,120</p>
              </div>

              {/* Tarjeta Destacada Dorada */}
              <div className="bg-[#0c0c0c] border border-[#c5a059]/20 rounded-2xl p-4 md:p-6 transition-all bg-gradient-to-br from-[#c5a059]/10 to-transparent">
                <h4 className="text-[9px] font-black text-[#c5a059]/70 uppercase tracking-widest mb-2">Servicios Hoy</h4>
                <p className="font-anton text-2xl md:text-4xl tracking-tighter text-[#c5a059] leading-none">24</p>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 md:p-6 transition-all hover:border-[#c5a059]/30">
                <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Ventas Producto</h4>
                <p className="font-anton text-xl md:text-3xl tracking-tighter text-white leading-none">12</p>
              </div>
            </div>

            {/* PANEL DE ACTIVIDAD RECIENTE */}
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
                {[
                  { id: 1, name: 'Carlos Mendoza', service: 'Corte Degradado', staff: 'Alan Q.', price: 50 },
                  { id: 2, name: 'Marcos Silva', service: 'Barba & Perfilado', staff: 'Leo M.', price: 35 },
                  { id: 3, name: 'Rodrigo Pérez', service: 'Corte Clásico', staff: 'Alan Q.', price: 40 },
                ].map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                    <div>
                      <p className="text-[10px] font-black uppercase text-white tracking-tight">{item.name}</p>
                      <p className="text-[8px] text-white/30 uppercase font-bold mt-0.5">{item.service} <span className="text-[#c5a059]/40 mx-1">|</span> {item.staff}</p>
                    </div>
                    <span className="text-sm font-anton text-[#c5a059]">$ {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            
            {/* CAJA DE STOCK CRÍTICO */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-anton text-sm md:text-base uppercase tracking-tight italic text-amber-500">Stock Crítico</h3>
                <span className="material-symbols-outlined text-amber-500/30 text-lg">inventory_2</span>
              </div>
              
              <div className="space-y-2">
                <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-tight text-white/70">Pomada Mate</span>
                  <span className="font-anton text-sm text-red-400">2 Uds</span>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-tight text-white/70">Aceite de Barba</span>
                  <span className="font-anton text-sm text-red-400">1 Ud</span>
                </div>
              </div>
            </div>

            {/* BOTÓN TARJETA GOLDEN (ACCESO RÁPIDO) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#c5a059] p-6 rounded-3xl text-left relative overflow-hidden group shadow-[0_10px_30px_rgba(197,160,89,0.2)] cursor-pointer"
            >
              <div className="relative z-10">
                <h2 className="font-anton text-xl md:text-2xl text-white uppercase leading-none tracking-tight mb-2 italic">
                  GESTIÓN<br/>FINANCIERA
                </h2>
                <div className="flex items-center gap-2 text-black/70">
                  <span className="text-[9px] font-black tracking-widest uppercase italic">Abrir Reportes</span>
                  <span className="material-symbols-outlined text-xs font-bold">arrow_forward_ios</span>
                </div>
              </div>

              {/* Icono gigante de fondo girado */}
              <div className="absolute right-[-10px] bottom-[-10px] opacity-15 group-hover:opacity-25 transition-all duration-500 rotate-12">
                <span className="material-symbols-outlined text-[85px] text-white">payments</span>
              </div>
            </motion.button>
          </div>

        </div>
      </div>
    );
  };
  ```

  ---

  ### C. Layout General (`src/App.jsx`)

  ```jsx
  import React, { useState } from 'react';
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import { Sidebar } from './components/layout/Sidebar';
  import { DashboardView } from './views/DashboardView';

  export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <BrowserRouter>
        <div className="flex min-h-screen bg-black text-white overflow-x-hidden">
          {/* Barra Lateral */}
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          {/* Contenido Principal */}
          <main className="flex-1 lg:ml-72 p-4 md:p-12 min-h-screen relative">
            
            {/* Header Superior Móvil */}
            <div className="lg:hidden flex items-center justify-between mb-8 bg-[#0a0a0a]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 sticky top-4 z-30 shadow-2xl">
              <span className="font-anton text-lg uppercase tracking-tight text-white">MI SISTEMA</span>
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-[#c5a059]"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>

            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<DashboardView />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    );
  }
  ```

  ---

  ## 🚀 Resumen Rápido para empezar en 3 minutos

  1. Ejecuta: `npm i framer-motion react-router-dom tailwindcss @tailwindcss/postcss postcss autoprefixer`
  2. Pega las etiquetas `<link>` de fuentes e iconos en tu `index.html`.
  3. Pega el archivo `src/index.css`.
  4. Copia `Sidebar.jsx` y `DashboardView.jsx`.
  5. ¡Listo! Tendrás exactamente el mismo estilo visual oscuro, dorado y fluido.

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/UI';

export const Sidebar = ({ user, logout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: 'dashboard', label: 'Mi Panel', roles: ['admin', 'barbero', 'recepcionista', 'cliente'] },
    { id: 'bookings', path: '/bookings', icon: 'event', label: 'Reservar Cita', roles: ['cliente'] },
    { id: 'quick-cut', path: '/quick-cut', icon: 'bolt', label: 'Corte Express', roles: ['admin', 'recepcionista', 'barbero'] },
    { id: 'clients', path: '/clients', icon: 'groups', label: 'Clientes', roles: ['admin', 'recepcionista'] },
    { id: 'services', path: '/services', icon: 'content_cut', label: 'Servicios', roles: ['admin'] },
    { id: 'shop', path: '/shop', icon: 'shopping_cart', label: 'Tienda', roles: ['admin', 'recepcionista'] },
    { id: 'products', path: '/products', icon: 'inventory_2', label: 'Inventario', roles: ['admin'] },
    { id: 'expenses', path: '/expenses', icon: 'payments', label: 'Gastos', roles: ['admin'] },
    { id: 'employees', path: '/employees', icon: 'badge', label: 'Staff Elite', roles: ['admin'] },
    { id: 'camera', path: '/camera', icon: 'face', label: 'IA Face', roles: ['admin', 'cliente'] },
    { id: 'reports', path: '/reports', icon: 'analytics', label: 'Analytics', roles: ['admin', 'barbero'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
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

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : (window.innerWidth < 1024 ? -300 : 0) }}
        className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50 shadow-2xl"
      >
        <div className="p-8 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <h1 className="font-anton text-2xl font-black text-white tracking-tighter leading-none uppercase">URBAN BARBER</h1>
            <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">Live System</p>
            </div>
          </motion.div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
              className={({ isActive }) => `
                relative group flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300
                ${isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black">
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-anton text-white text-xl shadow-[0_0_15px_rgba(197,160,89,0.3)] group-hover:rotate-12 transition-transform">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate uppercase text-white tracking-widest">{user.name}</p>
              <p className="text-[8px] text-primary font-bold uppercase tracking-tighter opacity-70">{user.role}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full py-4 text-[9px] uppercase font-black tracking-[0.2em] bg-transparent border border-white/10 hover:border-primary hover:text-primary transition-all"
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </motion.aside>
    </>
  );
};

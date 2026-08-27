import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useBarberController } from './controllers/useBarberController';
import { AccessDenied } from './components/common/UI';

// Componentes de la Interfaz
import { Sidebar } from './components/layout/Sidebar';
import { Notification } from './components/common/Notification';

// Vistas
import { HomeView } from './views/HomeView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { ServicesView } from './views/ServicesView';
import { ProductsView } from './views/ProductsView';
import { CameraView } from './views/CameraView';
import { ReportsView } from './views/ReportsView';
import { EmployeesView } from './views/EmployeesView';
import { QuickCutView } from './views/QuickCutView';
import { ExpensesView } from './views/ExpensesView';
import { ShopView } from './views/ShopView';
import { BookingsView } from './views/BookingsView';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Componente de Layout Protegido fuera del principal para evitar errores de Hooks
const ProtectedLayout = ({ children, user, logout, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-black overflow-x-hidden text-white">
      <Sidebar
        user={user}
        logout={() => { logout(); navigate('/'); }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 lg:ml-72 p-4 md:p-12 min-h-screen relative">
         <div className="lg:hidden flex items-center justify-between mb-8 bg-surface-variant/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 sticky top-4 z-30 shadow-2xl">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-white text-xs">UB</div>
               <span className="font-headline text-lg text-white uppercase tracking-tighter">Urban Barber</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
         </div>

         <div className="max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
};

const App = () => {
  const c = useBarberController();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (c.isLoading) return <LoadingScreen notification={c.notification} />;

  return (
    <>
      <ScrollToTop />
      <Notification notification={c.notification} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomeView {...c} /></PageTransition>} />
          <Route path="/login" element={c.user ? <Navigate to="/dashboard" replace /> : <PageTransition><LoginView onLogin={c.login} loginWithGoogle={c.loginWithGoogle} finalizeGoogleLogin={c.finalizeGoogleLogin} /></PageTransition>} />

          <Route path="/dashboard" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition><DashboardView {...c} /></PageTransition></ProtectedLayout>} />
          <Route path="/bookings" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {(c.user?.role === 'admin' || c.user?.role === 'cliente') ? <BookingsView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />
          <Route path="/quick-cut" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition><QuickCutView {...c} /></PageTransition></ProtectedLayout>} />

          <Route path="/clients" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {(c.user?.role === 'admin' || c.user?.role === 'recepcionista') ? <ClientsView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/shop" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {(c.user?.role === 'admin' || c.user?.role === 'recepcionista') ? <ShopView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/services" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {c.user?.role === 'admin' ? <ServicesView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/products" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {c.user?.role === 'admin' ? <ProductsView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/expenses" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {c.user?.role === 'admin' ? <ExpensesView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/employees" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {c.user?.role === 'admin' ? <EmployeesView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/reports" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {(c.user?.role === 'admin' || c.user?.role === 'barbero') ? <ReportsView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="/camera" element={<ProtectedLayout user={c.user} logout={c.logout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}><PageTransition>
            {(c.user?.role === 'admin' || c.user?.role === 'cliente') ? <CameraView {...c} /> : <AccessDenied />}
          </PageTransition></ProtectedLayout>} />

          <Route path="*" element={<Navigate to={c.user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const LoadingScreen = ({ notification }) => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
      ></motion.div>
      <h1 className="font-headline uppercase tracking-[0.4em] text-white text-lg mb-2 font-black italic">Urban Barber <span className="text-primary">LP</span></h1>
      <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold">Cargando Experiencia Luxury Gold</p>
      {notification && <p className="text-primary text-[10px] uppercase tracking-widest mt-4 animate-pulse">{notification.msg}</p>}
    </div>
  </div>
);

export default App;

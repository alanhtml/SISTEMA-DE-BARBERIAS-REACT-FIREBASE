import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Crash Log:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-10">
          <div className="text-center bg-surface border border-primary/20 p-10 rounded-[3rem]">
            <span className="material-symbols-outlined text-primary text-6xl mb-4">warning</span>
            <h2 className="text-white font-headline text-2xl uppercase mb-2">Motor de Renderizado Detenido</h2>
            <p className="text-on-surface-variant text-xs mb-8">Se detectó una inconsistencia en los datos de Firebase.</p>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Reiniciar Interfaz</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const base = "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-primary text-black shadow-[0_0_20px_rgba(197,160,89,0.2)] hover:bg-primary/90 border border-primary/50",
    secondary: "bg-transparent text-white border border-white/10 hover:border-primary/50 hover:text-primary",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Card = ({ title, children, className = '' }) => (
  <div className={`glass-card p-6 rounded-3xl border border-white/5 shadow-xl ${className}`}>
    {title && <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-primary neon-text mb-4">{title}</h3>}
    {children}
  </div>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade">
    <div className="glass-card w-full max-w-lg p-10 rounded-[2.5rem] border border-white/10 relative">
      <button onClick={onClose} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>
      <h3 className="font-headline text-2xl text-white uppercase mb-8 text-center">{title}</h3>
      {children}
    </div>
  </div>
);

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", variant = 'primary' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade">
      <div className="glass-card w-full max-w-sm p-10 rounded-[2.5rem] border border-primary/20 relative text-center shadow-[0_0_50px_rgba(197,160,89,0.1)]">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">priority_high</span>
        </div>
        <h3 className="font-headline text-xl text-white uppercase mb-2 tracking-tighter">{title}</h3>
        <p className="text-on-surface-variant text-xs mb-8 leading-relaxed uppercase tracking-widest font-bold opacity-60">{message}</p>
        <div className="flex flex-col gap-3">
          <Button variant={variant} onClick={onConfirm} className="w-full py-4">{confirmText}</Button>
          <button onClick={onCancel} className="text-on-surface-variant hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] py-2 mt-2">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AccessDenied = () => (
  <div className="h-[70vh] flex flex-col items-center justify-center text-center">
    <span className="material-symbols-outlined text-primary text-8xl mb-4 opacity-20">lock</span>
    <h2 className="font-headline text-3xl uppercase tracking-widest text-white">Acceso Restringido</h2>
    <p className="text-on-surface-variant text-sm mt-2">Este módulo requiere privilegios de Administrador Maestro.</p>
  </div>
);

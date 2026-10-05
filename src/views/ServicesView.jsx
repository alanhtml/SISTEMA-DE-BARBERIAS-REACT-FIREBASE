import React, { useState, useMemo } from 'react';
import { Button, Modal, Card, ConfirmDialog } from '../components/common/UI';

export const ServicesView = ({ db, addTurn, addService, updateService, deleteService, notify }) => {
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', isPremium: false });
  const [errors, setErrors] = useState({});

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

  // Seguridad: Asegurar que las listas existan y ordenar servicios por precio
  const servicesList = useMemo(() => {
    return [...(db?.services || [])].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
  }, [db?.services]);
  const turnsList = db?.turns || [];
  const clientsList = db?.clients || [];

  const openEditModal = (service) => {
    setSelectedService(service);
    setNewService({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      isPremium: !!service.isPremium
    });
    setErrors({});
    setShowServiceModal(true);
  };

  const validateService = () => {
    const newErrors = {};
    const price = parseFloat(newService.price);
    const duration = parseInt(newService.duration);

    if (!newService.name.trim()) newErrors.name = 'Nombre requerido';
    if (isNaN(price) || price <= 0) newErrors.price = 'Precio inválido';
    if (isNaN(duration) || duration <= 0) newErrors.duration = 'Duración inválida';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      notify('Por favor, revisa los campos marcados', 'error');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveService = async (e) => {
    if (e) e.preventDefault();

    if (validateService()) {
      const serviceData = {
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration),
        isPremium: newService.isPremium
      };

      let success;
      if (selectedService) {
        success = await updateService(selectedService.id, serviceData);
      } else {
        success = await addService(serviceData);
      }

      if (success) {
        setShowServiceModal(false);
        setSelectedService(null);
        setNewService({ name: '', price: '', duration: '', isPremium: false });
        setErrors({});
      }
    }
  };

  return (
    <div className="animate-fade pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
        <div>
          <h2 className="font-headline text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white neon-text">Servicios & Cola</h2>
          <p className="text-on-surface-variant uppercase text-[10px] sm:text-xs tracking-widest font-bold">Gestión de turnos y catálogo maestro</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
           <Button variant="secondary" className="flex-1 sm:flex-initial px-3 sm:px-6" onClick={() => { setShowServiceModal(true); setErrors({}); }}>
             <span className="hidden sm:inline">Nuevo Servicio</span>
             <span className="sm:hidden text-[10px]">Nuevo</span>
           </Button>
           <Button onClick={() => setShowTurnModal(true)} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-6">
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="text-[10px] sm:text-xs font-black uppercase">Turno</span>
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
         <Card title="Catálogo de Servicios">
            <div className="space-y-3 mt-4">
               {servicesList.length === 0 ? (
                 <p className="text-center py-10 text-on-surface-variant italic border border-dashed border-gray-800 rounded-xl text-xs">No hay servicios definidos</p>
               ) : servicesList.map(s => (
                 <div key={s.id} className="flex justify-between items-center p-4 bg-surface rounded-2xl border border-gray-800 hover:border-primary transition-all group active:scale-[0.98]">
                    <div className="flex-1 min-w-0 pr-4">
                       <div className="flex items-center gap-2">
                          <p className="font-bold text-white group-hover:text-primary transition-colors truncate text-sm sm:text-base">{s.name}</p>
                          {s.isPremium && (
                            <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full border border-primary/30 uppercase tracking-tighter">Premium</span>
                          )}
                       </div>
                       <p className="text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-widest truncate">{s.duration || 0} min de precisión</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                       <p className="font-headline text-lg sm:text-xl text-primary whitespace-nowrap">Bs. {Number(s.price || 0).toFixed(0)}</p>
                       <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                             onClick={() => openEditModal(s)}
                             className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                             title="Editar Servicio"
                          >
                             <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                             onClick={() => {
                               triggerConfirm(
                                 'ELIMINAR SERVICIO',
                                 `¿ESTÁS SEGURO DE ELIMINAR EL SERVICIO ${s.name.toUpperCase()} DEFINITIVAMENTE?`,
                                 () => deleteService(s.id)
                               );
                             }}
                             className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary/60 hover:text-primary transition-colors"
                             title="Eliminar Servicio"
                          >
                             <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         <Card title="Estado de la Cola">
            <div className="zebra-stripe rounded-2xl overflow-hidden border border-gray-800 mt-4">
               {turnsList.map(t => (
                 <div key={t.id} className="flex items-center justify-between p-4 border-b border-gray-800 last:border-0 bg-surface/50">
                    <div className="flex items-center gap-3 min-w-0">
                       <span className="text-xs font-black text-primary flex-shrink-0">#{t.number}</span>
                       <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{t.clientName}</p>
                          <p className="text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-widest truncate">{t.serviceName}</p>
                       </div>
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${(t.status || 'esperando') === 'en_atencion' ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,84,80,0.3)]' : 'bg-gray-800 text-on-surface-variant'}`}>
                       {(t.status || 'esperando').replace('_', ' ')}
                    </span>
                 </div>
               ))}
               {turnsList.length === 0 && <p className="text-center py-10 text-on-surface-variant italic text-xs">No hay clientes en espera</p>}
            </div>
         </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {showTurnModal && (
        <Modal title="Asignar Nuevo Turno" onClose={() => setShowTurnModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            addTurn(e.target.client.value, e.target.service.value);
            setShowTurnModal(false);
          }} className="space-y-6">
             <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black block mb-2">Seleccionar Cliente</label>
                <select name="client" className="w-full bg-surface border border-gray-800 rounded-xl text-xs font-bold text-white p-4 outline-none focus:border-primary transition-all" required>
                   {clientsList.length === 0 ? <option disabled>No hay clientes</option> : clientsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black block mb-2">Servicio Requerido</label>
                <select name="service" className="w-full bg-surface border border-gray-800 rounded-xl text-xs font-bold text-white p-4 outline-none focus:border-primary transition-all" required>
                   {servicesList.length === 0 ? <option disabled>No hay servicios</option> : servicesList.map(s => <option key={s.id} value={s.id}>{s.name} - Bs. {s.price}</option>)}
                </select>
             </div>
             <Button className="w-full py-4 mt-4 font-black text-xs tracking-[0.2em]" disabled={clientsList.length === 0 || servicesList.length === 0}>CONFIRMAR TURNO</Button>
          </form>
        </Modal>
      )}

      {showServiceModal && (
        <Modal
          title={selectedService ? "Editar Servicio" : "Añadir Nuevo Servicio"}
          onClose={() => { setShowServiceModal(false); setSelectedService(null); setNewService({ name: '', price: '', duration: '', isPremium: false }); }}
        >
          <form onSubmit={handleSaveService} className="space-y-5" autoComplete="off">
             <div>
                <input
                  type="text"
                  placeholder="Nombre del Servicio"
                  autoComplete="none"
                  className={`w-full bg-surface border border-gray-800 rounded-xl p-4 text-white text-sm outline-none focus:border-primary transition-all ${errors.name ? 'border-primary/50' : ''}`}
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
                {errors.name && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.name}</p>}
             </div>
             <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Precio (Bs.)"
                    autoComplete="none"
                    className={`w-full bg-surface border border-gray-800 rounded-xl p-4 text-white text-sm outline-none focus:border-primary transition-all ${errors.price ? 'border-primary/50' : ''}`}
                    value={newService.price}
                    onChange={e => setNewService({...newService, price: e.target.value})}
                  />
                  {errors.price && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.price}</p>}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Minutos"
                    autoComplete="none"
                    className={`w-full bg-surface border border-gray-800 rounded-xl p-4 text-white text-sm outline-none focus:border-primary transition-all ${errors.duration ? 'border-primary/50' : ''}`}
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: e.target.value})}
                  />
                  {errors.duration && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.duration}</p>}
                </div>
             </div>

             <div
               onClick={() => setNewService({...newService, isPremium: !newService.isPremium, duration: !newService.isPremium ? '60' : newService.duration})}
               className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${newService.isPremium ? 'border-primary bg-primary/10' : 'border-gray-800 bg-surface/50'}`}
             >
                <div className="flex items-center gap-3">
                   <span className={`material-symbols-outlined ${newService.isPremium ? 'text-primary' : 'text-gray-500'}`}>
                      {newService.isPremium ? 'workspace_premium' : 'hotel_class'}
                   </span>
                   <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${newService.isPremium ? 'text-white' : 'text-gray-500'}`}>Servicio Premium</p>
                      <p className="text-[8px] text-on-surface-variant uppercase">Ocupa 1 hora (2 turnos) en la agenda</p>
                   </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${newService.isPremium ? 'bg-primary border-primary' : 'border-gray-700'}`}>
                   {newService.isPremium && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
                </div>
             </div>

             <Button
                onClick={handleSaveService}
                className="w-full py-4 mt-2 font-black text-xs tracking-[0.2em]"
             >
                {selectedService ? 'ACTUALIZAR CAMBIOS' : 'GUARDAR SERVICIO'}
             </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

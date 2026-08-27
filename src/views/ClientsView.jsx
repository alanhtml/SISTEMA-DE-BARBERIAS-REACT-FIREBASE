import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../components/common/UI';

export const ClientsView = ({ db, addClient, updateClient, updateDB }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', ci: '', username: '', password: '', faceType: 'ovalado', cutsForFree: 0 });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  // Cargar configuración global de fidelidad
  const fidelitySettings = db?.settings?.fidelity || { requiredCuts: 5, enabled: true };

  const handleUpdateFidelity = async (newVal) => {
    await updateDB('settings', {
      ...db.settings,
      fidelity: { ...fidelitySettings, requiredCuts: newVal }
    });
  };

  // Seguridad: Asegurar que db.clients sea un arreglo
  const clientsList = db?.clients || [];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    else if (formData.name.length < 3) newErrors.name = 'Mínimo 3 caracteres';

    if (!formData.ci.trim()) newErrors.ci = 'El CI es obligatorio';

    // Solo requerir usuario/pass si no es login de Google o si se está creando/editando acceso
    if (!formData.username?.trim()) newErrors.username = 'El usuario es obligatorio';
    if (!formData.password?.trim()) newErrors.password = 'La contraseña es obligatoria';

    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    else if (!/^\d{7,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato inválido (7-10 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      ci: client.ci || '',
      username: client.username || '',
      password: client.password || '',
      faceType: client.faceType || 'ovalado',
      cutsForFree: client.cutsForFree || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      let success;
      if (editingClient) {
        success = await updateClient(editingClient.id, formData);
      } else {
        success = await addClient(formData, photo);
      }

      if (success) {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: '', phone: '', ci: '', username: '', password: '', faceType: 'ovalado', cutsForFree: 0 });
        setPhoto(null);
        setErrors({});
      }
    }
  };

  return (
    <div className="pb-20">
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tighter text-white neon-text leading-none">
            DIRECTORIO <span className="text-primary">VIP</span>
          </h2>
          <p className="text-on-surface-variant uppercase text-[9px] md:text-xs tracking-widest font-bold mt-1">Gestión de Clientes y Fidelización</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            onClick={() => setShowSettingsModal(true)}
            variant="secondary"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-primary/30 text-primary bg-primary/5"
          >
            <span className="material-symbols-outlined text-sm md:text-base">settings_suggest</span>
            <span className="text-[9px] md:text-xs font-black tracking-widest uppercase">Reglas Regalo</span>
          </Button>
          <Button
            onClick={() => { setEditingClient(null); setShowModal(true); setFormData({ name: '', phone: '', ci: '', username: '', password: '', faceType: 'ovalado', cutsForFree: 0 }); setErrors({}); }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm md:text-base">person_add</span>
            <span className="text-[9px] md:text-xs font-black tracking-widest uppercase text-black">Nuevo Cliente</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {clientsList.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
             <span className="material-symbols-outlined text-6xl mb-4">group_off</span>
             <p className="font-headline text-xl uppercase italic">No hay clientes registrados</p>
          </div>
        ) : clientsList.map(c => (
          <div key={c.id} onClick={() => handleEdit(c)} className="glass-card p-4 md:p-6 rounded-[2.5rem] flex items-center gap-4 md:gap-5 border border-white/5 hover:border-primary/30 transition-all group cursor-pointer relative overflow-hidden bg-[#0c0c0c]">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary text-sm">edit</span>
            </div>

            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-variant overflow-hidden border border-white/5 group-hover:border-primary/50 transition-colors shrink-0">
               {c.photoURL ? (
                 <img src={c.photoURL} alt={c.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-primary font-black text-xl md:text-2xl uppercase">
                   {c.name.charAt(0)}
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="font-headline text-base md:text-lg text-white leading-tight mb-1 truncate">{c.name}</h3>
               <div className="flex flex-col gap-0.5 mb-2">
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest truncate">CI: {c.ci || 'GOOGLE_USER'}</p>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{c.phone}</p>
               </div>
               <div className="flex flex-wrap gap-2">
                  <div className="px-2 py-0.5 bg-white/5 rounded border border-white/5">
                     <p className="text-[8px] font-black text-white/60 uppercase">{c.totalCuts} Cortes</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded border ${c.cutsForFree >= fidelitySettings.requiredCuts ? 'bg-primary/20 border-primary animate-pulse' : 'bg-green-500/10 border-green-500/20'}`}>
                     <p className={`text-[8px] font-black uppercase ${c.cutsForFree >= fidelitySettings.requiredCuts ? 'text-primary' : 'text-green-500'}`}>
                        {c.cutsForFree}/{fidelitySettings.requiredCuts} para Gratis
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Configuración de Fidelidad Global */}
      {showSettingsModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade">
          <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">redeem</span>
               </div>
               <h3 className="font-headline text-2xl text-white uppercase">Regla de Fidelidad</h3>
               <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Configuración para todos los clientes</p>
            </div>

            <div className="space-y-6">
               <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                  <p className="text-xs text-white uppercase font-bold mb-4">Cortes necesarios para 1 GRATIS:</p>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => handleUpdateFidelity(Math.max(1, fidelitySettings.requiredCuts - 1))}
                      className="w-12 h-12 rounded-2xl bg-surface border border-gray-800 text-white flex items-center justify-center hover:border-primary text-2xl transition-all active:scale-95"
                    >-</button>
                    <span className="text-5xl font-headline text-primary font-black">{fidelitySettings.requiredCuts}</span>
                    <button
                      onClick={() => handleUpdateFidelity(Math.min(12, fidelitySettings.requiredCuts + 1))}
                      className="w-12 h-12 rounded-2xl bg-surface border border-gray-800 text-white flex items-center justify-center hover:border-primary text-2xl transition-all active:scale-95"
                    >+</button>
                  </div>
               </div>

               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] text-primary font-black uppercase leading-tight text-center">
                    Actualmente: El cliente paga {fidelitySettings.requiredCuts} cortes y el número {fidelitySettings.requiredCuts + 1} es totalmente GRATIS.
                  </p>
               </div>

               <Button className="w-full py-4" onClick={() => setShowSettingsModal(false)}>Cerrar y Guardar</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade overflow-y-auto">
          <div className="glass-card w-full max-w-md p-8 my-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
            <h3 className="font-headline text-2xl text-white uppercase mb-6 text-center">{editingClient ? 'Editar Perfil VIP' : 'Registro de Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

               <div>
                  <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">Nombre del Cliente</label>
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    autoComplete="none"
                    className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-colors ${errors.name ? 'border-primary/50 bg-primary/5' : ''}`}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    value={formData.name}
                  />
                  {errors.name && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.name}</p>}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">CI / ID</label>
                    <input
                      type="text"
                      placeholder="CI"
                      autoComplete="none"
                      className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-colors ${errors.ci ? 'border-primary/50 bg-primary/5' : ''}`}
                      onChange={e => setFormData({...formData, ci: e.target.value})}
                      value={formData.ci}
                    />
                    {errors.ci && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.ci}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      autoComplete="none"
                      className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-colors ${errors.phone ? 'border-primary/50 bg-primary/5' : ''}`}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      value={formData.phone}
                    />
                    {errors.phone && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.phone}</p>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">Usuario</label>
                     <input
                       type="text"
                       placeholder="Usuario"
                       autoComplete="none"
                       className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-colors ${errors.username ? 'border-primary/50 bg-primary/5' : ''}`}
                       onChange={e => setFormData({...formData, username: e.target.value})}
                       value={formData.username}
                     />
                     {errors.username && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.username}</p>}
                  </div>
                  <div>
                     <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">Contraseña</label>
                     <input
                       type="password"
                       placeholder="Contraseña"
                       autoComplete="new-password"
                       className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-colors ${errors.password ? 'border-primary/50 bg-primary/5' : ''}`}
                       onChange={e => setFormData({...formData, password: e.target.value})}
                       value={formData.password}
                     />
                     {errors.password && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.password}</p>}
                  </div>
               </div>

               <div>
                 <label className="text-[10px] text-on-surface-variant font-black uppercase ml-2">Morfología Facial</label>
                 <div className="flex gap-2 mt-1">
                   <select
                     className="flex-1 bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary transition-all"
                     onChange={e => setFormData({...formData, faceType: e.target.value})}
                     value={formData.faceType}
                   >
                     <option value="ovalado">Ovalado</option>
                     <option value="cuadrado">Cuadrado</option>
                     <option value="redondo">Redondo</option>
                     <option value="diamante">Diamante</option>
                     <option value="triangular">Triangular</option>
                     <option value="corazon">Corazón</option>
                   </select>
                   {editingClient?.lastAiAnalysis && (
                     <div className="bg-primary/10 border border-primary/20 px-4 flex items-center justify-center rounded-2xl text-primary group relative">
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        <div className="absolute bottom-full mb-2 right-0 w-48 p-3 bg-black border border-primary/30 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                           <p className="text-[8px] font-black uppercase text-primary mb-1">Último Análisis IA</p>
                           <p className="text-[10px] text-white font-bold leading-tight">
                             {editingClient.lastAiAnalysis.suggestions?.[0]?.name || 'Sin sugerencias'}
                           </p>
                           <p className="text-[7px] text-white/40 mt-1 uppercase">
                             {new Date(editingClient.lastAiAnalysis.date).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                   )}
                 </div>
               </div>

               {editingClient?.faceFeatures?.length > 0 && (
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="text-[9px] text-on-surface-variant font-black uppercase block mb-2">Rasgos Detectados</label>
                    <div className="flex flex-wrap gap-2">
                       {editingClient.faceFeatures.map((f, i) => (
                         <span key={i} className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold uppercase">{f}</span>
                       ))}
                    </div>
                 </div>
               )}

               {!editingClient && (
                 <div className="p-4 border-2 border-dashed border-gray-800 rounded-2xl text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setPhoto(e.target.files[0])} />
                    <span className="material-symbols-outlined text-gray-500 mb-1">add_a_photo</span>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{photo ? photo.name : 'Subir Foto de Perfil'}</p>
                 </div>
               )}

               <div className="flex gap-3 mt-8">
                  <Button type="button" variant="secondary" className="flex-1 py-4" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 py-4">{editingClient ? 'Actualizar' : 'Guardar'}</Button>
               </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};


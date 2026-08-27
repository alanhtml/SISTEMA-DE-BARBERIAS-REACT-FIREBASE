import React, { useState, useMemo } from 'react';
import { Button, Card, Modal, ConfirmDialog } from '../components/common/UI';

export const EmployeesView = ({ db, addUser, updateUser, deleteUser, notify }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'barbero',
    ci: '',
    commissionType: '50', // '50' para 50/50, '100' para total
    firstCutFull: true    // Primer corte al 100%
  });
  const [filterMode, setFilterMode] = useState('today');

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

  // Utilidad para fecha local YYYY-MM-DD
  const getLocalISO = (date = new Date()) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  };

  const [dateRange, setDateRange] = useState({ start: getLocalISO(), end: getLocalISO() });

  // FILTRO ANTI-DUPLICADOS para la lista principal
  const usersList = useMemo(() => {
    const raw = (db?.users || []).filter(u => u.role !== 'cliente');
    const unique = [];
    const seen = new Set();
    raw.forEach(u => {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        unique.push(u);
      }
    });
    return unique;
  }, [db?.users]);

  const allCuts = db?.cuts || [];

  const setQuickRange = (mode) => {
    setFilterMode(mode);
    const today = new Date();
    let start = new Date();

    if (mode === 'today') {
      start = new Date();
    } else if (mode === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(today.setDate(diff));
    } else if (mode === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (mode === 'year') {
      start = new Date(today.getFullYear(), 0, 1);
    }

    setDateRange({
      start: getLocalISO(start),
      end: getLocalISO(new Date())
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return notify('Completa los campos', 'error');
    let success = editingUser ? await updateUser(editingUser, formData) : await addUser(formData);
    if (success) {
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'barbero',
        ci: '',
        commissionType: '50',
        firstCutFull: true
      });
    }
  };

  // Detalle de producción con lógica de fecha local y comisiones
  const staffDetails = useMemo(() => {
    if (!selectedStaff) return null;

    const cuts = allCuts.filter(c => {
      const cutDate = getLocalISO(new Date(c.date));
      return cutDate >= dateRange.start && cutDate <= dateRange.end && c.barberId == selectedStaff.id;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalGenerated = cuts.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);

    // Regla del 1ero al 100% aplicada por día
    const cutsByDay = cuts.reduce((acc, cut) => {
      const day = getLocalISO(new Date(cut.date));
      if (!acc[day]) acc[day] = [];
      acc[day].push(cut);
      return acc;
    }, {});

    let totalCommission = 0;
    const commType = selectedStaff.commissionType || '50';
    const isFirstFullEnabled = selectedStaff.firstCutFull !== false;

    Object.values(cutsByDay).forEach(dayCuts => {
      const sorted = dayCuts.sort((a, b) => new Date(a.date) - new Date(b.date));
      sorted.forEach((cut, idx) => {
        const price = parseFloat(cut.price) || 0;

        if (commType === '100') {
          totalCommission += price;
        } else {
          // Si es el primer corte y tiene la opción activada, va al 100%
          if (idx === 0 && isFirstFullEnabled) {
            totalCommission += price;
          } else {
            totalCommission += (price * 0.5);
          }
        }
      });
    });

    return { cuts, totalGenerated, totalCommission };
  }, [selectedStaff, allCuts, dateRange]);

  if (selectedStaff) {
    return (
      <div className="animate-fade pb-10">
        <header className="mb-8 space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedStaff(null)} className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-white hover:bg-primary transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="font-headline text-3xl font-black text-white uppercase tracking-tighter">{selectedStaff.name}</h2>
              <p className="text-primary text-[10px] font-black uppercase tracking-widest">Panel de Producción Individual</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filtros Rápidos */}
            <div className="flex bg-surface-variant p-1 rounded-xl border border-white/5">
              {['today', 'week', 'month', 'year'].map(m => (
                <button
                  key={m}
                  onClick={() => setQuickRange(m)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filterMode === m ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'}`}
                >
                  {m === 'today' ? 'Hoy' : m === 'week' ? 'Semana' : m === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>

            {/* Selector de Fecha Específica */}
            <div className="flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-xl border border-white/5">
               <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
               <input
                 type="date"
                 className="bg-transparent text-white text-[10px] font-bold outline-none cursor-pointer"
                 value={dateRange.start}
                 onChange={(e) => { setDateRange({...dateRange, start: e.target.value}); setFilterMode('custom'); }}
               />
               <span className="text-white/20 text-[10px] font-black">AL</span>
               <input
                 type="date"
                 className="bg-transparent text-white text-[10px] font-bold outline-none cursor-pointer"
                 value={dateRange.end}
                 onChange={(e) => { setDateRange({...dateRange, end: e.target.value}); setFilterMode('custom'); }}
               />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-on-surface-variant uppercase mb-1">Servicios</p>
            <p className="text-3xl font-headline text-white">{staffDetails.cuts.length}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-on-surface-variant uppercase mb-1">Generado Bruto</p>
            <p className="text-3xl font-headline text-white">Bs. {staffDetails.totalGenerated.toFixed(0)}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-primary/20 bg-primary/5">
            <p className="text-[9px] font-black text-primary uppercase mb-1">Comisión a Pagar</p>
            <p className="text-3xl font-headline text-primary">Bs. {staffDetails.totalCommission.toFixed(2)}</p>
          </div>
        </div>

        <Card title="Historial Detallado">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 text-[10px] font-black text-on-surface-variant uppercase">Fecha</th>
                  <th className="py-4 text-[10px] font-black text-on-surface-variant uppercase text-right px-4">Servicio/Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staffDetails.cuts.map(cut => (
                  <tr key={cut.id} className="group hover:bg-white/[0.02]">
                    <td className="py-4">
                      <p className="text-xs text-white font-bold">{new Date(cut.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-[9px] text-on-surface-variant uppercase">{new Date(cut.date).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 text-right px-4">
                      <p className="text-xs text-white font-black uppercase">{cut.serviceName}</p>
                      <p className="text-[10px] font-black text-primary">Bs. {parseFloat(cut.price).toFixed(0)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade">
        <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white neon-text">Staff Elite</h2>
          <p className="text-on-surface-variant uppercase text-xs tracking-widest font-bold">Gestión de Personal Único</p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({
            name: '',
            username: '',
            password: '',
            role: 'barbero',
            ci: '',
            commissionType: '50',
            firstCutFull: true
          });
          setShowModal(true);
        }} className="px-6 py-3">
          <span className="text-xs font-black uppercase">Nuevo Staff</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList.map(u => (
          <div key={u.id} className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedStaff(u)}>
            <div className="flex items-start justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center border border-gray-800">
                  <span className="material-symbols-outlined text-primary">
                    {u.role === 'admin' ? 'admin_panel_settings' : u.role === 'recepcionista' ? 'person_pin' : 'content_cut'}
                  </span>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border text-primary border-primary/30 bg-primary/10">
                 {u.role}
               </span>
            </div>
            <h3 className="font-headline text-lg text-white mb-1 uppercase">{u.name}</h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-6">{u.username}</p>
            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
               <button onClick={(e) => {
                 e.stopPropagation();
                 setEditingUser(u.id);
                 setFormData({
                   ...u,
                   commissionType: u.commissionType || '50',
                   firstCutFull: u.firstCutFull !== undefined ? u.firstCutFull : true
                 });
                 setShowModal(true);
               }} className="text-on-surface-variant hover:text-blue-400 transition-colors">
                  <span className="material-symbols-outlined text-lg">edit</span>
               </button>
               <button onClick={(e) => {
                 e.stopPropagation();
                 triggerConfirm(
                   'ELIMINAR EMPLEADO',
                   `¿ESTÁS SEGURO DE ELIMINAR A ${u.name.toUpperCase()} DEL STAFF?`,
                   () => deleteUser(u.id)
                 );
               }} disabled={u.username === 'alanquispe586@gmail.com'} className="text-on-surface-variant hover:text-primary transition-colors disabled:opacity-0">
                  <span className="material-symbols-outlined text-lg">delete</span>
               </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {showModal && (
        <Modal title={editingUser ? "Editar Staff" : "Nuevo Miembro"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleFormSubmit} className="space-y-4" autoComplete="off">
             <input
               type="text"
               placeholder="NOMBRE COMPLETO"
               readOnly
               onFocus={(e) => e.target.removeAttribute('readonly')}
               className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase outline-none focus:border-primary"
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
             />

             <input
               type="text"
               placeholder="CI / DOCUMENTO"
               readOnly
               onFocus={(e) => e.target.removeAttribute('readonly')}
               className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase outline-none focus:border-primary"
               value={formData.ci}
               onChange={e => setFormData({...formData, ci: e.target.value})}
             />

             <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="USUARIO"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase outline-none focus:border-primary"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="CONTRASEÑA"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase outline-none focus:border-primary"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
             </div>
             <select className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="barbero">Barbero</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="admin">Administrador</option>
             </select>

             {formData.role === 'barbero' && (
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                 <p className="text-[9px] font-black text-primary uppercase tracking-widest">Configuración de Comisiones</p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] text-gray-500 font-bold uppercase block mb-2">Esquema de Pago</label>
                      <select
                        className="w-full bg-surface border border-gray-800 rounded-xl p-3 text-white text-[10px] font-bold uppercase focus:border-primary outline-none"
                        value={formData.commissionType}
                        onChange={e => setFormData({...formData, commissionType: e.target.value})}
                      >
                        <option value="50">50% Comisión (Staff)</option>
                        <option value="100">100% (Dueño/Master)</option>
                      </select>
                    </div>

                    {formData.commissionType === '50' && (
                      <div className="flex flex-col justify-center animate-fade-in">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={formData.firstCutFull}
                              onChange={e => setFormData({...formData, firstCutFull: e.target.checked})}
                            />
                            <div className="w-10 h-5 bg-gray-800 rounded-full peer peer-checked:bg-primary transition-all"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white uppercase group-hover:text-primary transition-colors">Incentivo Diario</span>
                            <span className="text-[7px] text-gray-500 uppercase font-bold">1er Corte al 100%</span>
                          </div>
                        </label>
                      </div>
                    )}
                 </div>
               </div>
             )}

             <Button type="submit" className="w-full py-5 mt-4">Guardar Registro</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

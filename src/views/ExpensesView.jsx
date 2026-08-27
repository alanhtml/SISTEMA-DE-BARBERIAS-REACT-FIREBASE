import React, { useState, useMemo } from 'react';
import { Button, Card, Modal } from '../components/common/UI';

export const ExpensesView = ({ db, addExpense, deleteExpense }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'otros' });

  // Función para obtener fecha local YYYY-MM-DD
  const getLocalISO = (date = new Date()) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  };

  const [filterDate, setFilterDate] = useState(getLocalISO());

  const categories = [
    { id: 'insumos', label: 'Insumos / Barber', icon: 'shaving_kit' },
    { id: 'servicios', label: 'Servicios (Luz/Agua)', icon: 'lightbulb' },
    { id: 'alquiler', label: 'Alquiler', icon: 'home' },
    { id: 'sueldos', label: 'Sueldos / Extras', icon: 'payments' },
    { id: 'otros', label: 'Otros Gastos', icon: 'more_horiz' },
  ];

  const filteredExpenses = useMemo(() => {
    return (db.expenses || []).filter(e => {
       const expenseDate = getLocalISO(new Date(e.date));
       return expenseDate === filterDate;
    });
  }, [db.expenses, filterDate]);

  const totalDaily = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const success = await addExpense({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString() // Se guarda con fecha completa
    });

    if (success) {
      setShowModal(false);
      setFormData({ description: '', amount: '', category: 'otros' });
    }
  };

  return (
    <div className="animate-fade">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white neon-text">Gastos Diarios</h2>
          <p className="text-on-surface-variant uppercase text-xs tracking-widest font-bold">Control de egresos - Fecha Local</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-4 py-2">
            <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
            <input
              type="date"
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span className="text-xs font-black uppercase">Registrar</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Listado de Egresos">
            <div className="space-y-4">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary border border-gray-800">
                      <span className="material-symbols-outlined text-lg">
                        {categories.find(c => c.id === expense.category)?.icon || 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{expense.description}</p>
                      <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest">
                        {expense.category} • {new Date(expense.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-lg font-headline text-white">Bs. {expense.amount.toFixed(2)}</p>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredExpenses.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <span className="material-symbols-outlined text-6xl">receipt_long</span>
                  <p className="text-xs font-black uppercase tracking-widest mt-2">No hay gastos en esta fecha</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Resumen de Caja">
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl text-center">
              <p className="text-[10px] font-black text-primary uppercase mb-2">Total Egresos</p>
              <p className="text-4xl font-headline text-white neon-text-sm">Bs. {totalDaily.toFixed(2)}</p>
            </div>
          </Card>
        </div>
      </div>

      {showModal && (
        <Modal title="Registrar Egreso" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-on-surface-variant mb-2 block uppercase">Descripción</label>
              <input
                type="text"
                className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase"
                placeholder="Ej. Compra de toallas..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant mb-2 block uppercase">Monto (Bs)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-on-surface-variant mb-2 block uppercase">Categoría</label>
                <select
                  className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white text-xs font-bold uppercase"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full py-5 mt-4">Confirmar Gasto</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

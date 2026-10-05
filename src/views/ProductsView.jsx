import React, { useState } from 'react';
import { Button, ConfirmDialog } from '../components/common/UI';

export const ProductsView = ({ db, updateProduct, addProduct, deleteProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', stock: '', costPrice: '', salePrice: '', minStock: '2' });
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

  const productsList = db?.products || [];

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      stock: product.stock.toString(),
      costPrice: (product.costPrice || 0).toString(),
      salePrice: product.salePrice.toString(),
      minStock: product.minStock.toString()
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) newErrors.stock = 'Stock inválido';
    if (isNaN(parseFloat(formData.costPrice)) || parseFloat(formData.costPrice) < 0) newErrors.costPrice = 'Costo inválido';
    if (isNaN(parseFloat(formData.salePrice)) || parseFloat(formData.salePrice) <= 0) newErrors.salePrice = 'Precio inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      const productData = {
        name: formData.name,
        stock: parseInt(formData.stock),
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        minStock: parseInt(formData.minStock)
      };

      let success;
      if (selectedProduct) {
        success = await updateProduct(selectedProduct.id, productData);
      } else {
        success = await addProduct(productData);
      }

      if (success) {
        setShowModal(false);
        setSelectedProduct(null);
        setFormData({ name: '', stock: '', costPrice: '', salePrice: '', minStock: '2' });
      }
    }
  };

  return (
    <div className="animate-fade">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white neon-text">Almacén Central</h2>
          <p className="text-on-surface-variant uppercase text-xs tracking-widest font-bold">Control de Inventario y Ventas</p>
        </div>
        <Button onClick={() => { setSelectedProduct(null); setFormData({ name: '', stock: '', costPrice: '', salePrice: '', minStock: '2' }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
          <span className="text-xs font-black tracking-widest uppercase">Añadir Producto</span>
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productsList.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-900 rounded-[3rem] opacity-30">
             <span className="material-symbols-outlined text-6xl mb-4">inventory</span>
             <p className="font-headline text-xl uppercase text-white">No hay productos en inventario</p>
          </div>
        ) : productsList.map(p => (
          <div key={p.id} className="glass-card p-4 rounded-[1.5rem] border border-white/5 relative overflow-hidden group flex flex-col justify-between">
            {p.stock <= p.minStock && (
              <div className="absolute top-2 left-2 bg-primary/20 border border-primary/40 text-primary text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md animate-pulse z-20">
                Stock Bajo
              </div>
            )}

            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={() => openEditModal(p)}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[10px]">edit</span>
                </button>
                <button
                  onClick={() => {
                    triggerConfirm(
                      'ELIMINAR PRODUCTO',
                      `¿ESTÁS SEGURO DE ELIMINAR ${p.name.toUpperCase()} DEL INVENTARIO DEFINITIVAMENTE?`,
                      () => deleteProduct(p.id)
                    );
                  }}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[10px]">delete</span>
                </button>
            </div>

            <div className="relative">
                <h3 className="font-headline text-[10px] text-white mb-3 uppercase tracking-tight pr-10 line-clamp-2 h-8 leading-tight">{p.name}</h3>

                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[6px] uppercase text-on-surface-variant font-black tracking-widest mb-0.5">Costo</p>
                        <p className="text-[10px] font-bold text-white/60 text-right">Bs. {(p.costPrice || 0).toFixed(0)}</p>
                    </div>
                    <div className="p-2 bg-green-500/5 rounded-xl border border-green-500/10">
                        <p className="text-[6px] uppercase text-green-500 font-black tracking-widest mb-0.5">Venta</p>
                        <p className="text-[10px] font-black text-green-500 text-right">Bs. {(p.salePrice || 0).toFixed(0)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-gray-900 mb-2">
                   <span className="text-[7px] uppercase text-on-surface-variant font-bold">Stock:</span>
                   <span className={`text-[9px] font-black ${p.stock <= p.minStock ? 'text-primary' : 'text-white'}`}>{p.stock} U.</span>
                </div>
            </div>

            <div className="flex justify-between items-center px-1 border-t border-white/5 pt-2 mt-auto">
                <span className="text-[7px] uppercase text-on-surface-variant font-bold">Margen:</span>
                <span className="text-[9px] font-black text-primary">Bs. {(p.salePrice - (p.costPrice || 0)).toFixed(0)}</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade">
          <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="font-headline text-2xl text-white uppercase mb-6 text-center">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-4" autoComplete="off">
               <div>
                  <input
                    type="text"
                    placeholder="Nombre del Producto"
                    autoComplete="none"
                    className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary ${errors.name ? 'border-primary/50' : ''}`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  {errors.name && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.name}</p>}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase text-on-surface-variant font-bold ml-2 mb-1 block">Costo Compra</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Costo (Bs.)"
                      autoComplete="none"
                      className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary ${errors.costPrice ? 'border-primary/50' : ''}`}
                      value={formData.costPrice}
                      onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    />
                    {errors.costPrice && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.costPrice}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-on-surface-variant font-bold ml-2 mb-1 block">Precio Venta</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Venta (Bs.)"
                      autoComplete="none"
                      className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary ${errors.salePrice ? 'border-primary/50' : ''}`}
                      value={formData.salePrice}
                      onChange={e => setFormData({...formData, salePrice: e.target.value})}
                    />
                    {errors.salePrice && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.salePrice}</p>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase text-on-surface-variant font-bold ml-2 mb-1 block">Stock Actual</label>
                    <input
                      type="number"
                      placeholder="Unidades"
                      autoComplete="none"
                      className={`w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary ${errors.stock ? 'border-primary/50' : ''}`}
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                    />
                    {errors.stock && <p className="text-[10px] text-primary mt-1 ml-2 font-bold uppercase">{errors.stock}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-on-surface-variant font-bold ml-2 mb-1 block">Alerta Mínimo</label>
                    <input
                        type="number"
                        placeholder="Mínimo"
                        required
                        autoComplete="none"
                        className="w-full bg-surface border-gray-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-primary"
                        value={formData.minStock}
                        onChange={e => setFormData({...formData, minStock: e.target.value})}
                    />
                  </div>
               </div>

               <div className="flex gap-3 mt-8">
                  <Button type="button" variant="secondary" className="flex-1 py-4" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 py-4">{selectedProduct ? 'Actualizar' : 'Registrar'}</Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

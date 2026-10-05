import React, { useState } from 'react';

export const ShopView = ({ db, sellProduct, notify }) => {
  const [sellingId, setSellingId] = useState(null);
  const [saleDetails, setSaleDetails] = useState({ qty: 1, discount: 0 });
  const productsList = db?.products || [];

  const handleSellRequest = (p) => {
    setSellingId(p.id);
    setSaleDetails({ qty: 1, discount: 0 });
  };

  const confirmSale = (p) => {
    const qty = parseInt(saleDetails.qty);
    const discount = parseFloat(saleDetails.discount || 0);

    if (qty > 0 && qty <= p.stock) {
      sellProduct(p.id, qty, discount);
      setSellingId(null);
    } else if (qty > p.stock) {
      notify("No hay suficiente stock", "error");
    } else {
      notify("Cantidad inválida", "error");
    }
  };

  return (
    <div className="animate-fade">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
            </div>
            <div>
                <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-white neon-text leading-none">Tienda Urbana</h2>
                <p className="text-on-surface-variant uppercase text-[8px] tracking-[0.3em] font-bold mt-1">Retail & Products</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productsList.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
             <p className="font-headline text-lg uppercase text-white/50 tracking-widest">Almacén Vacío</p>
          </div>
        ) : productsList.filter(p => p.stock > 0).map(p => (
          <div key={p.id} className="group relative glass-card p-4 rounded-[1.5rem] border border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-white/40 text-xl group-hover:text-primary transition-colors">sanitizer</span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-green-500 font-headline">Bs. {parseFloat(p.salePrice).toFixed(0)}</p>
                    <p className="text-[8px] uppercase text-on-surface-variant font-bold leading-none">Stock: {p.stock}</p>
                </div>
              </div>

              <h3 className="font-headline text-xs text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-2 h-8">{p.name}</h3>

              {sellingId === p.id ? (
                <div className="space-y-2 mb-4 animate-fade">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-[7px] uppercase font-black text-on-surface-variant ml-1">Cant.</label>
                            <input
                                type="number"
                                min="1"
                                max={p.stock}
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-[10px] text-white outline-none focus:border-primary"
                                value={saleDetails.qty}
                                onChange={e => setSaleDetails({...saleDetails, qty: e.target.value})}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[7px] uppercase font-black text-on-surface-variant ml-1">Desc.</label>
                            <input
                                type="number"
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-[10px] text-white outline-none focus:border-primary"
                                placeholder="Bs."
                                value={saleDetails.discount}
                                onChange={e => setSaleDetails({...saleDetails, discount: e.target.value})}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="pt-1 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[7px] uppercase font-black text-white/40">Total:</span>
                        <span className="text-xs font-black text-green-500">Bs. {(p.salePrice * saleDetails.qty - (saleDetails.discount || 0)).toFixed(0)}</span>
                    </div>
                </div>
              ) : null}
            </div>

            <div className="mt-2 flex gap-2">
              {sellingId === p.id ? (
                <>
                  <button
                    onClick={() => setSellingId(null)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[8px] font-black uppercase transition-all"
                  >
                    X
                  </button>
                  <button
                    onClick={() => confirmSale(p)}
                    className="flex-[3] py-2 bg-green-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20"
                  >
                    Cobrar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSellRequest(p)}
                  className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs">shopping_bag</span>
                  Vender
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

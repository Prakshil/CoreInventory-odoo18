import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', unitOfMeasure: 'pcs', reorderLevel: 0, categoryId: '', initialStock: 0, locationId: '', costPrice: 0, salePrice: 0 });

  const fetchProducts = () => {
    const params = {};
    if (search) params.search = search;
    if (filterCat) params.categoryId = filterCat;
    api.get('/products', { params }).then(r => setProducts(r.data)).catch(() => {});
  };

  useEffect(() => { fetchProducts(); }, [search, filterCat]);
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/locations').then(r => setLocations(r.data)).catch(() => {});
  }, []);

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN';

  const openNew = () => {
    if (!canManage) return;
    setEditing(null);
    setForm({
      name: '',
      sku: '',
      unitOfMeasure: 'pcs',
      reorderLevel: 0,
      categoryId: categories[0]?.id || '',
      initialStock: 0,
      locationId: locations[0]?.id || '',
      costPrice: 0,
      salePrice: 0,
    });
    setShowModal(true);
  };
  const openEdit = (p) => {
    if (!canManage) return;
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      unitOfMeasure: p.unitOfMeasure,
      reorderLevel: p.reorderLevel,
      categoryId: p.categoryId,
      initialStock: 0,
      locationId: '',
      costPrice: p.costPrice ?? 0,
      salePrice: p.salePrice ?? 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/products/${editing.id}`, form);
    } else {
      await api.post('/products', form);
    }
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const totalStock = (p) => p.stocks?.reduce((s, st) => s + st.quantity, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-textNavy">Products</h1><p className="text-sm text-slate-500 mt-1">Manage your product catalog and stock levels.</p></div>
        {canManage && (
          <button onClick={openNew} className="bg-primary hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-primary/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">UoM</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Sale Price</th>
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Cost Price</th>
              )}
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reorder Lvl</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Total Stock</th>
              {canManage && <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>}
            </tr></thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={canManage ? 9 : 8} className="text-center py-12 text-slate-400">No products found.</td></tr>
              ) : products.map(p => {
                const ts = totalStock(p);
                const isLow = ts <= p.reorderLevel;
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-textNavy">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium">{p.category?.name}</span></td>
                    <td className="px-4 py-3 text-slate-600">{p.unitOfMeasure}</td>
                    <td className="px-4 py-3 text-slate-600">{Number(p.salePrice || 0).toFixed(2)}</td>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                      <td className="px-4 py-3 text-slate-600">{Number(p.costPrice || 0).toFixed(2)}</td>
                    )}
                    <td className="px-4 py-3 text-slate-600">{p.reorderLevel}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${isLow ? 'text-accent' : 'text-emerald-600'}`}>{ts}</span>{isLow && <span className="ml-2 text-xs text-accent bg-orange-50 px-1.5 py-0.5 rounded font-medium">Low</span>}</td>
                    {canManage && (
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                        {canDelete && (
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-textNavy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-textNavy">{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">SKU</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure</label><input required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.unitOfMeasure} onChange={e => setForm({...form, unitOfMeasure: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Sale Price</label><input type="number" step="0.01" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.salePrice} onChange={e => setForm({...form, salePrice: parseFloat(e.target.value) || 0})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label><input type="number" step="0.01" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.costPrice} onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label><input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: parseInt(e.target.value) || 0})} /></div>
              {!editing && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label><input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.initialStock} onChange={e => setForm({...form, initialStock: parseInt(e.target.value) || 0})} /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})}><option value="">Select</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>)}</select></div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm shadow-primary/30 transition-all">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

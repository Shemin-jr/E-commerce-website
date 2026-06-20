import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({
    team: '', sizes: ['S', 'M', 'L', 'XL'], price: '', category: 'Home',
    image: '', backImage: '', description: '', salePrice: '', offerExpiry: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchProducts(currentPage);
  }, [navigate, currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await API.get('/products', { params: { page, limit: itemsPerPage, search: searchQuery } });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) { fetchProducts(1); } else { setCurrentPage(1); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id || editingProduct.id}`, { ...newProduct });
      } else {
        await API.post('/products', { ...newProduct });
      }
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct({ team: '', sizes: ['S', 'M', 'L', 'XL'], price: '', category: 'Home', image: '', backImage: '', description: '' });
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      fetchProducts();
    } catch (err) {
      console.error('Error:', err);
      toast.error("Something went wrong");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      team: product.team, sizes: product.sizes, price: product.price,
      category: product.category, image: product.image, backImage: product.backImage,
      description: product.description, salePrice: product.salePrice || '', offerExpiry: product.offerExpiry || ''
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        toast.success('Product deleted!');
        fetchProducts();
      } catch (err) {
        toast.error("Something went wrong");
      }
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400 font-bold uppercase text-[10px] tracking-widest";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-3 tracking-[0.2em] uppercase";

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 font-black animate-pulse">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="uppercase tracking-[0.3em] text-xs">Inventory Sync in Progress...</span>
      </div>
    );

  return (
    <div className="p-0">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Global Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col">
             <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Vault Inventory</h1>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Stock Management System</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold uppercase text-[10px] tracking-widest shadow-inner placeholder:text-slate-400"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">🔍</span>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({ team: '', sizes: ['S', 'M', 'L', 'XL'], price: '', category: 'Home', image: '', backImage: '', description: '', salePrice: '', offerExpiry: '' });
                setShowForm(!showForm);
              }}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 shadow-xl ${showForm ? 'bg-slate-50 text-slate-900 border border-slate-200' : 'bg-slate-900 text-white shadow-slate-100 hover:bg-blue-600 hover:shadow-blue-100'}`}
            >
              {showForm ? 'Close Editor' : '+ Create Entry'}
            </button>
          </div>
        </div>

        {/* Dynamic Editor Panel */}
        {showForm && (
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                 {editingProduct ? 'Update Record' : 'New Catalog Entry'}
               </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className={labelClass}>Team Designation</label>
                  <input type="text" value={newProduct.team} onChange={(e) => setNewProduct({ ...newProduct, team: e.target.value })}
                    className={inputClass} placeholder="Real Madrid CF" required />
                </div>
                <div>
                  <label className={labelClass}>Base Price (INR)</label>
                  <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Kit Specification</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass}>
                    <option value="Home">Home Kit</option>
                    <option value="Away">Away Kit</option>
                    <option value="Special Edition">Special Edition</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Primary Visual Asset (URL)</label>
                  <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Secondary Visual Asset (URL)</label>
                  <input type="url" value={newProduct.backImage} onChange={(e) => setNewProduct({ ...newProduct, backImage: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Flash Sale Price (INR)</label>
                  <input type="number" value={newProduct.salePrice} onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    className={inputClass} placeholder="0.00" />
                </div>
                <div className="lg:col-span-1">
                  <label className={labelClass}>Offer Termination</label>
                  <input type="date" value={newProduct.offerExpiry ? newProduct.offerExpiry.substring(0, 10) : ''} onChange={(e) => setNewProduct({ ...newProduct, offerExpiry: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Narrative</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className={`${inputClass} normal-case text-sm font-medium tracking-normal`} rows="4" required />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-10">
                <button type="submit" className="flex-1 bg-slate-900 hover:bg-blue-600 text-white px-8 py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl shadow-slate-100 hover:shadow-blue-100">
                  {editingProduct ? 'Commit Changes' : 'Publish to Catalog'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setShowForm(false); }}
                    className="px-10 py-5 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                    Dismiss
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Registry Table */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Metadata</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue Unit</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dimensions</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr key={product._id || product.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-6">
                      <div className="relative group-hover:scale-110 transition-transform">
                         <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                         <img src={product.image} alt={product.team} className="relative h-14 w-14 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100" />
                      </div>
                      <div>
                        <div className="text-sm font-black italic uppercase tracking-tighter text-slate-900">{product.team}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.description.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-black italic text-slate-900">₹{product.price.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full border-2
                      ${product.category === 'Home'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex gap-2">
                      {product.sizes.map((size) => (
                        <span key={size} className="px-3 py-1 text-[10px] font-black bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-6">
                      <button onClick={() => handleEditProduct(product)} className="text-slate-900 hover:text-blue-600 font-black italic uppercase text-[10px] tracking-widest transition-all">Edit</button>
                      <button onClick={() => handleDeleteProduct(product._id || product.id)} className="text-red-500 hover:text-red-700 font-black italic uppercase text-[10px] tracking-widest transition-all">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-10">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Prev
            </button>
            <div className="flex gap-3">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-100 scale-110'
                      : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

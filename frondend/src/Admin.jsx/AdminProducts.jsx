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

  const inputClass = "w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-100 placeholder-gray-500";
  const labelClass = "block text-xs font-bold text-gray-400 mb-2 tracking-wide uppercase";

  if (loading)
    return <div className="text-center p-8 text-indigo-400 font-bold animate-pulse">Loading Products...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Product Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500 pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({ team: '', sizes: ['S', 'M', 'L', 'XL'], price: '', category: 'Home', image: '', backImage: '', description: '', salePrice: '', offerExpiry: '' });
                setShowForm(!showForm);
              }}
              className={`${showForm ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} px-6 py-2 rounded-xl font-bold shadow transition`}
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-xl mb-6">
            <h2 className="text-xl font-bold mb-6 text-white">
              {editingProduct ? 'Update Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Team Name</label>
                  <input type="text" value={newProduct.team} onChange={(e) => setNewProduct({ ...newProduct, team: e.target.value })}
                    className={inputClass} placeholder="e.g. Manchester United" required />
                </div>
                <div>
                  <label className={labelClass}>Price (INR)</label>
                  <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass}>
                    <option value="Home" className="bg-gray-800">Home Kit</option>
                    <option value="Away" className="bg-gray-800">Away Kit</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Primary Image URL</label>
                  <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Secondary Image URL</label>
                  <input type="url" value={newProduct.backImage} onChange={(e) => setNewProduct({ ...newProduct, backImage: e.target.value })}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Sale Price (INR) - Optional</label>
                  <input type="number" value={newProduct.salePrice} onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    className={inputClass} placeholder="Discounted price" />
                </div>
                <div>
                  <label className={labelClass}>Offer Expiry Date</label>
                  <input type="date" value={newProduct.offerExpiry ? newProduct.offerExpiry.substring(0, 10) : ''} onChange={(e) => setNewProduct({ ...newProduct, offerExpiry: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className={inputClass} rows="4" required />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition shadow">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setShowForm(false); }}
                    className="px-6 py-3 rounded-xl bg-gray-700 text-gray-200 font-bold hover:bg-gray-600 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Sizes</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((product) => (
                <tr key={product._id || product.id} className="hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.team} className="h-12 w-12 object-contain rounded-lg bg-gray-800 p-1 border border-gray-700" />
                      <div>
                        <div className="text-sm font-medium text-gray-100">{product.team}</div>
                        <div className="text-sm text-gray-500">{product.description.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-200">₹{product.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                      ${product.category === 'Home'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes.map((size) => (
                        <span key={size} className="px-2 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-lg border border-gray-700">
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button onClick={() => handleEditProduct(product)} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                      <button onClick={() => handleDeleteProduct(product._id || product.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

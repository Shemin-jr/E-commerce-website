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
    team: '',
    sizes: ['S', 'M', 'L', 'XL'],
    price: '',
    category: 'Home',
    image: '',
    backImage: '',
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error(" something went wrong");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        await API.put(`/products/${productId}`, { ...newProduct });
      } else {
        await API.post('/products', { ...newProduct });
      }
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct({
        team: '',
        sizes: ['S', 'M', 'L', 'XL'],
        price: '',
        category: 'Home',
        image: '',
        backImage: '',
        description: ''
      });
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error:', err);
      toast.error(" something went wrong ");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      team: product.team,
      sizes: product.sizes,
      price: product.price,
      category: product.category,
      image: product.image,
      backImage: product.backImage,
      description: product.description
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        toast.error(" something went wrong ");
      }
    }
  };

  if (loading) return <div className="text-center p-8 text-blue-400 font-bold animate-pulse">Loading Products...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Product Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({
                  team: '',
                  sizes: ['S', 'M', 'L', 'XL'],
                  price: '',
                  category: 'Home',
                  image: '',
                  backImage: '',
                  description: ''
                });
                setShowForm(!showForm);
              }}
              className={`${showForm ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-6 py-2 rounded font-bold shadow`}
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingProduct ? 'Update Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Team Name</label>
                  <input
                    type="text"
                    value={newProduct.team}
                    onChange={(e) => setNewProduct({ ...newProduct, team: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                    placeholder="e.g. Manchester United"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Price (INR)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                  >
                    <option value="Home">Home Kit</option>
                    <option value="Away">Away Kit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Primary Image URL</label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Secondary Image URL</label>
                  <input
                    type="url"
                    value={newProduct.backImage}
                    onChange={(e) => setNewProduct({ ...newProduct, backImage: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setShowForm(false);
                    }}
                    className="px-4 py-2 rounded bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products
                .filter(product =>
                  product.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  product.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.team} className="h-12 w-12 object-contain rounded bg-gray-50 p-1 border border-gray-200" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.team}</div>
                          <div className="text-sm text-gray-500">{product.description.substring(0, 30)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${product.category === 'Home' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex gap-1">
                        {product.sizes.map(size => (
                          <span key={size} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded border border-gray-200">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id || product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
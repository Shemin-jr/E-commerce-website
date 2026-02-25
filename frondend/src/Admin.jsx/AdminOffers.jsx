import React, { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercent: "",
    discountAmount: "",
    code: "",
    type: "percentage",
    applicableTo: "all",
    category: "",
    productIds: [],
    minPurchase: 0,
    maxDiscount: "",
    expiresAt: "",
    usageLimit: "",
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await API.get("/offers/global/admin");
      setOffers(response.data.offers);
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) : undefined,
        minPurchase: Number(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt || undefined,
        productIds: formData.productIds.length > 0 ? formData.productIds.split(',').map(id => id.trim()) : [],
      };

      if (editingOffer) {
        await API.put(`/offers/global/${editingOffer._id}`, data);
        toast.success("Offer updated successfully");
      } else {
        await API.post("/offers/global", data);
        toast.success("Offer created successfully");
      }

      setShowForm(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save offer");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      discountPercent: offer.discountPercent || "",
      discountAmount: offer.discountAmount || "",
      code: offer.code || "",
      type: offer.type || "percentage",
      applicableTo: offer.applicableTo || "all",
      category: offer.category || "",
      productIds: offer.productIds?.join(', ') || "",
      minPurchase: offer.minPurchase || 0,
      maxDiscount: offer.maxDiscount || "",
      expiresAt: offer.expiresAt ? offer.expiresAt.substring(0, 16) : "",
      usageLimit: offer.usageLimit || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await API.delete(`/offers/global/${id}`);
      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discountPercent: "",
      discountAmount: "",
      code: "",
      type: "percentage",
      applicableTo: "all",
      category: "",
      productIds: [],
      minPurchase: 0,
      maxDiscount: "",
      expiresAt: "",
      usageLimit: "",
    });
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await API.put(`/offers/global/${id}`, { active: !currentActive });
      toast.success("Offer status updated");
      fetchOffers();
    } catch (error) {
      toast.error("Failed to update offer status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOffer(null);
            resetForm();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create New Offer
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingOffer ? "Edit Offer" : "Create New Offer"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="Optional coupon code"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {formData.type === "percentage" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percent *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {formData.type === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
              <select
                value={formData.applicableTo}
                onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">All Products</option>
                <option value="category">Specific Category</option>
                <option value="product">Specific Products</option>
              </select>
            </div>

            {formData.applicableTo === "category" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}

            {formData.applicableTo === "product" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product IDs (comma separated)</label>
                <input
                  type="text"
                  value={formData.productIds}
                  onChange={(e) => setFormData({ ...formData, productIds: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="productId1, productId2, ..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                min="0"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {editingOffer ? "Update" : "Create"} Offer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingOffer(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map((offer) => (
                <tr key={offer._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                      {offer.description && (
                        <div className="text-sm text-gray-500">{offer.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.type === "percentage"
                      ? `${offer.discountPercent}%`
                      : `$${offer.discountAmount}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        offer.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {offer.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(offer._id, offer.active)}
                      className={`${
                        offer.active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {offer.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {offers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No offers found. Create your first offer!</p>
        </div>
      )}
    </div>
  );
}
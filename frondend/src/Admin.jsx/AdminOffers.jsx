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
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 font-black animate-pulse">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="uppercase tracking-[0.3em] text-xs">Accessing Voucher Vault...</span>
      </div>
    );
  }

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400 font-bold uppercase text-[10px] tracking-widest";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-3 tracking-[0.2em] uppercase";

  return (
    <div className="p-0">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Global Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col">
             <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Campaign Management</h1>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Offers & Promotions Console</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingOffer(null);
              resetForm();
            }}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-100 hover:shadow-blue-100"
          >
            + Create Campaign
          </button>
        </div>

        {/* Dynamic Editor Panel */}
        {showForm && (
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                 {editingOffer ? 'Modify Campaign' : 'New Promotion'}
               </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <label className={labelClass}>Promotion Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Seasonal Clearance 2024"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Voucher code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={inputClass}
                    placeholder="WINTER25"
                  />
                </div>

                <div className="md:col-span-full">
                  <label className={labelClass}>Campaign Narrative</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputClass} normal-case text-sm font-medium tracking-normal`}
                    rows="3"
                  />
                </div>

                <div>
                  <label className={labelClass}>Pricing logic</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed reduction (₹)</option>
                  </select>
                </div>

                {formData.type === "percentage" ? (
                  <div>
                    <label className={labelClass}>Rebate Magnitude (%) *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Rebate Magnitude (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Minimum Threshold (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {formData.type === "percentage" && (
                  <div>
                    <label className={labelClass}>Maximum Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Audience Context</label>
                  <select
                    value={formData.applicableTo}
                    onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                    className={inputClass}
                  >
                    <option value="all">Global Catalog</option>
                    <option value="category">Designated Category</option>
                    <option value="product">Designated Products</option>
                  </select>
                </div>

                {formData.applicableTo === "category" && (
                  <div>
                    <label className={labelClass}>Target Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Home"
                    />
                  </div>
                )}

                {formData.applicableTo === "product" && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>Asset IDs (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.productIds}
                      onChange={(e) => setFormData({ ...formData, productIds: e.target.value })}
                      className={inputClass}
                      placeholder="ID_001, ID_002, ..."
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Termination Clock</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Redeem Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className={inputClass}
                    placeholder="No Limit"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-10">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-blue-600 text-white px-8 py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl shadow-slate-100 hover:shadow-blue-100"
                >
                  {editingOffer ? "Commit Updates" : "Deploy Campaign"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                  className="px-10 py-5 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Campaign Registry */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Promotion Details</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic Code</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Magnitude</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Availability</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-black italic uppercase tracking-tighter text-slate-900">{offer.title}</div>
                        {offer.description && (
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{offer.description.substring(0, 40)}...</div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-[10px] font-black border-2 border-slate-100 px-3 py-1.5 rounded-lg text-blue-600 bg-slate-50">{offer.code || "GLOBAL"}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm font-black italic text-slate-900">
                        {offer.type === "percentage"
                          ? `${offer.discountPercent}% OFF`
                          : `₹${offer.discountAmount} OFF`}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full border-2 ${
                          offer.active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        {offer.active ? "Deployed" : "Dormant"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium space-x-6">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-slate-900 hover:text-blue-600 font-black italic uppercase text-[10px] tracking-widest transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(offer._id, offer.active)}
                        className={`font-black italic uppercase text-[10px] tracking-widest transition-all ${
                          offer.active ? "text-amber-500 hover:text-amber-600" : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {offer.active ? "Suspend" : "Deploy"}
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="text-red-500 hover:text-red-700 font-black italic uppercase text-[10px] tracking-widest transition-all"
                      >
                        Expunge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {offers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">No Active Campaigns Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
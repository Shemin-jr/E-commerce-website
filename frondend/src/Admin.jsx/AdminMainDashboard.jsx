import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number.isFinite(n) ? n : 0
  );

const COLORS = ["#38bdf8", "#2563eb", "#60a5fa", "#1d4ed8", "#93c5fd", "#0f172a"];

const getAdminName = () => {
  try {
    const data = JSON.parse(localStorage.getItem("adminData") || "{}");
    return data?.name || "Admin";
  } catch {
    return "Admin";
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get("/auth/users?all=true"),
        API.get("/orders?all=true"),
        API.get("/products?all=true"),
      ]);

      if (results[0].status === "fulfilled") setUsers(results[0].value.data.users || []);
      if (results[1].status === "fulfilled") setOrders(results[1].value.data.orders || []);
      if (results[2].status === "fulfilled") setProducts(results[2].value.data.products || []);

    } catch (err) {
      toast.error("Dashboard sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    return {
      users: users.length,
      products: products.length,
      orders: orders.length,
      revenue: totalRevenue,
    };
  }, [users, products, orders]);

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
      });
    }
    return days;
  }, []);

  const ordersByDay = useMemo(() => {
    const map = Object.fromEntries(last7.map((d) => [d.key, 0]));
    orders.forEach((o) => {
      const k = new Date(o.createdAt || o.date || Date.now()).toISOString().slice(0, 10);
      if (map[k] !== undefined) map[k] += 1;
    });
    return last7.map((d) => ({ day: d.label, count: map[d.key] }));
  }, [orders, last7]);

  const revenueByDay = useMemo(() => {
    const map = Object.fromEntries(last7.map((d) => [d.key, 0]));
    orders.forEach((o) => {
      const k = new Date(o.createdAt || o.date || Date.now()).toISOString().slice(0, 10);
      const r = o.total || 0;
      if (map[k] !== undefined) map[k] += r;
    });
    return last7.map((d) => ({ day: d.label, revenue: map[d.key] }));
  }, [orders, last7]);

  const categoriesPie = useMemo(() => {
    const catCounts = {};
    products.forEach((p) => {
      const c = p.category || "Uncategorized";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
    const arr = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
    return arr.length ? arr : [{ name: "No Data", value: 1 }];
  }, [products]);

  if (loading)
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-blue-600 font-black italic animate-pulse uppercase tracking-[0.3em] text-xs">Synchronizing Global Data...</p>
      </div>
    );

  const statCards = [
    { title: "Total Users", value: totals.users, icon: "👤", color: "from-blue-500 to-sky-500" },
    { title: "Gear Pieces", value: totals.products, icon: "📦", color: "from-slate-900 to-slate-800" },
    { title: "Total Orders", value: totals.orders, icon: "🧾", color: "from-blue-600 to-indigo-600" },
    { title: "Gross Revenue", value: formatCurrency(totals.revenue), icon: "💰", color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Workspace Intelligence</p>
          <h1 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">Welcome back, {getAdminName()}</h1>
        </div>
        <button 
          onClick={fetchAll}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-blue-100 transition-all duration-300"
        >
          Refresh Data
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-blue-500/10 transition-all duration-500 group relative overflow-hidden shadow-sm"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-[0.03] rounded-bl-full group-hover:opacity-[0.06] transition-opacity`} />
            
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{card.title}</p>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-black italic text-slate-900 tracking-tighter">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartCard title="Revenue Growth" className="lg:col-span-2">
          <div className="w-full h-[400px] pt-8">
            <ResponsiveContainer>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={1} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "1.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.05)", color: "#0f172a", fontSize: "12px", fontWeight: "900" }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={6} 
                  dot={{ fill: "#ffffff", stroke: "#2563eb", strokeWidth: 3, r: 8 }} 
                  activeDot={{ r: 10, strokeWidth: 0, fill: "#0f172a" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Inventory Analytics">
          <div className="w-full h-[400px] pt-8">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={categoriesPie} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                >
                  {categoriesPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "1.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.05)", color: "#0f172a", fontSize: "12px", fontWeight: "900" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Logistics Volume" className="lg:col-span-3">
          <div className="w-full h-[300px] pt-8">
            <ResponsiveContainer>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={1} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "1.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.05)", color: "#0f172a", fontSize: "12px", fontWeight: "900" }} />
                <Bar dataKey="count" fill="#0f172a" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group ${className}`}>
      <div className="flex items-center gap-3 mb-4">
         <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}

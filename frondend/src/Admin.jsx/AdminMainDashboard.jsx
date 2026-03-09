import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
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

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A78BFA"];

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

      results.forEach((res, i) => {
        if (res.status === "rejected") {
          console.error(`API ${i} failed:`, res.reason);
        }
      });
    } catch (err) {
      console.error("Fetch all error:", err);
      toast.error("Something went wrong");
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
      <div className="min-h-screen flex justify-center items-center text-xl text-indigo-400 font-bold animate-pulse bg-gray-950">
        Loading Dashboard...
      </div>
    );

  const statCards = [
    { title: "Total Users", value: totals.users, icon: "👤", color: "from-indigo-600 to-indigo-400" },
    { title: "Products", value: totals.products, icon: "📦", color: "from-emerald-600 to-emerald-400" },
    { title: "Orders", value: totals.orders, icon: "🧾", color: "from-amber-600 to-amber-400" },
    { title: "Revenue", value: formatCurrency(totals.revenue), icon: "💰", color: "from-purple-600 to-purple-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-3xl font-bold text-white">Welcome back, {getAdminName()} 👋</h1>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-gray-700 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{card.title}</p>
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg shadow-lg`}>
                {card.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Revenue (Last 7 Days)">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: "#9ca3af" }} />
                <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} dot={{ fill: "#6366F1", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders (Last 7 Days)">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: "#9ca3af" }} />
                <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }} />
                <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Product Categories">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoriesPie} dataKey="value" nameKey="name" outerRadius={90}>
                  {categoriesPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-gray-700 transition-all">
      <h3 className="font-semibold mb-4 text-gray-300">{title}</h3>
      {children}
    </div>
  );
}

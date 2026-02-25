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


  // ✅ Logout and Navigate to Home
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get("/auth/users"),
        API.get("/orders?all=true"),
        API.get("/products?all=true")
      ]);

      if (results[0].status === "fulfilled") setUsers(results[0].value.data || []);
      if (results[1].status === "fulfilled") setOrders(results[1].value.data.orders || []);
      if (results[2].status === "fulfilled") setProducts(results[2].value.data.products || []);

      // Log errors if any
      results.forEach((res, i) => {
        if (res.status === "rejected") {
          console.error(`API ${i} failed:`, res.reason);
        }
      });
    } catch (err) {
      console.error("Fetch all error:", err);
      toast.error(" something went wrong");
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
    return <div className="min-h-screen flex justify-center items-center text-xl text-blue-400 font-bold animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* ✅ SINGLE LOGOUT BUTTON */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome back, {getAdminName()} 👋</h1>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={totals.users} />
        <StatCard title="Products" value={totals.products} />
        <StatCard title="Orders" value={totals.orders} />
        <StatCard title="Revenue" value={formatCurrency(totals.revenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        <ChartCard title="Revenue (Last 7 Days)">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#000' }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={4} dot={{ fill: '#6366F1', r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders (Last 7 Days)">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#000' }} />
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
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#000' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>



      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:scale-105 transition-all duration-300">
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <h3 className="font-semibold mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}


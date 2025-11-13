import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

const API = "http://localhost:5000";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
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
  const navigate = useNavigate();

  // ✅ Logout and Navigate to Home
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    navigate("/", { replace: true });
  };

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, o, p] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/products`)
      ]);
      setUsers(u.data || []);
      setOrders(o.data || []);
      setProducts(p.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totals = useMemo(() => { 
    const totalRevenue = orders.reduce((sum, order) => {
      const itemsTotal = (order.items || []).reduce(
        (s, it) => s + (it.price || 0) * (it.quantity || 1),
        0
      );
      return sum + itemsTotal;
    }, 0);

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
      const r = (o.items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
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

  const topProducts = useMemo(() => {
    const tally = {};
    orders.forEach((order) => {
      (order.items || []).forEach((i) => {
        tally[i.name] = (tally[i.name] || 0) + (i.quantity || 1);
      });
    });
    return Object.entries(tally).map(([name, quantity]) => ({ name, quantity }));
  }, [orders]);

  if (loading)
    return <div className="min-h-screen flex justify-center items-center text-xl">Loading...</div>;

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
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders (Last 7 Days)">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
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
                <Tooltip />
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
    <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}


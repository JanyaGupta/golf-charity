"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, TrendingUp, Heart, Trophy, Award, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockRevenueData = [
  { month: "Jan", revenue: 42000, donations: 4200 },
  { month: "Feb", revenue: 58000, donations: 5800 },
  { month: "Mar", revenue: 71000, donations: 7100 },
  { month: "Apr", revenue: 65000, donations: 6500 },
  { month: "May", revenue: 89000, donations: 8900 },
  { month: "Jun", revenue: 94000, donations: 9400 },
];

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0, activeSubscriptions: 0, totalRevenue: 0,
    totalDonations: 0, currentPrizePool: 0, pendingWinners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400 bg-blue-500/20", change: "+12%" },
    { label: "Active Subs", value: stats.activeSubscriptions.toLocaleString(), icon: CreditCard, color: "text-brand-400 bg-brand-500/20", change: "+8%" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-gold-400 bg-gold-500/20", change: "+22%" },
    { label: "Total Donated", value: formatCurrency(stats.totalDonations), icon: Heart, color: "text-rose-400 bg-rose-500/20", change: "+15%" },
    { label: "Prize Pool", value: formatCurrency(stats.currentPrizePool), icon: Trophy, color: "text-gold-400 bg-gold-500/20", change: "Live" },
    { label: "Pending Wins", value: stats.pendingWinners.toString(), icon: Award, color: "text-amber-400 bg-amber-500/20", change: "Action needed" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1">Platform Overview</h1>
        <p className="text-slate-500">Real-time metrics for GolfCharity</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5 border border-white/5 card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full">{card.change}</span>
            </div>
            {loading ? (
              <div className="skeleton h-8 rounded-lg mb-1 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono mb-1">{card.value}</div>
            )}
            <div className="text-slate-500 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="font-semibold mb-6">Revenue & Donations</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `£${(v / 100).toFixed(0)}`} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                formatter={(v: any) => [formatCurrency(v), ""]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="donations" stroke="#f59e0b" strokeWidth={2} dot={false} name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center text-sm text-slate-500">
          <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-brand-500 inline-block" /> Revenue</span>
          <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-gold-400 inline-block" /> Donations</span>
        </div>
      </motion.div>
    </div>
  );
}

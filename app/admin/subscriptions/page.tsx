"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminSubscriptionsPage() {
  const supabase = createClient();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false });
      setSubs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = subs.filter((s) =>
    s.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.plan?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = subs.filter((s) => s.status === "active").reduce((a, s) => a + (s.amount_paid || 0), 0);
  const activeCount = subs.filter((s) => s.status === "active").length;

  const statusColor: Record<string, string> = {
    active: "bg-brand-500/20 text-brand-400",
    canceled: "bg-red-500/20 text-red-400",
    past_due: "bg-amber-500/20 text-amber-400",
    trialing: "bg-blue-500/20 text-blue-400",
    inactive: "bg-slate-500/20 text-slate-400",
  };

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-brand-400" /> Subscriptions
        </h1>
        <p className="text-slate-500">{activeCount} active · {formatCurrency(totalRevenue)} total revenue</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: activeCount, color: "text-brand-400" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-gold-400" },
          { label: "Monthly Donation Pool", value: formatCurrency(Math.floor(totalRevenue * 0.1)), color: "text-rose-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-4 text-slate-500 font-medium">User</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Plan</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Status</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Amount</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Renews</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-3"><div className="skeleton h-8 rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No subscriptions found</td></tr>
              ) : (
                filtered.map((s: any, i) => (
                  <tr key={s.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-sm">{s.profiles?.full_name || "—"}</div>
                      <div className="text-slate-500 text-xs">{s.profiles?.email}</div>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-300">{s.plan}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor[s.status] || "bg-slate-500/20 text-slate-400"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-brand-400">{formatCurrency(s.amount_paid || 0)}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {s.current_period_end ? formatDate(s.current_period_end) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

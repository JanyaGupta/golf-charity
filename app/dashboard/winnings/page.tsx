"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Trophy, Clock, Check, XCircle, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Winner } from "@/types";

const tierLabels = {
  five_match: { label: "Jackpot Winner!", emoji: "🏆", color: "text-gold-400 bg-gold-500/10 border-gold-500/30" },
  four_match: { label: "4-Match Prize", emoji: "🥈", color: "text-brand-400 bg-brand-500/10 border-brand-500/30" },
  three_match: { label: "3-Match Prize", emoji: "🥉", color: "text-slate-300 bg-slate-500/10 border-slate-500/30" },
};

const statusConfig = {
  pending: { icon: Clock, label: "Pending Verification", color: "text-amber-400" },
  verified: { icon: Check, label: "Verified", color: "text-brand-400" },
  paid: { icon: Trophy, label: "Paid Out", color: "text-gold-400" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-400" },
};

export default function WinningsPage() {
  const supabase = createClient();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("winners")
        .select("*, draws(month, year)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWinners(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const totalPaid = winners.filter((w) => w.status === "paid").reduce((acc, w) => acc + w.prize_amount, 0);
  const totalPending = winners.filter((w) => w.status !== "paid" && w.status !== "rejected").reduce((acc, w) => acc + w.prize_amount, 0);

  return (
    <div className="max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Gift className="w-8 h-8 text-gold-400" /> My Winnings
        </h1>
        <p className="text-slate-500">Your prize history across all monthly draws</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Won", value: formatCurrency(totalPaid + totalPending), icon: Trophy, color: "text-gold-400" },
          { label: "Paid Out", value: formatCurrency(totalPaid), icon: Check, color: "text-brand-400" },
          { label: "Pending", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4 border border-white/5 text-center"
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <div className="text-xl font-bold font-mono">{stat.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Winnings table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" /> Prize History
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No winnings yet</p>
            <p className="text-slate-600 text-sm mt-1">Enter the monthly draw to win!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {winners.map((w: any, i) => {
              const tier = tierLabels[w.tier as keyof typeof tierLabels];
              const status = statusConfig[w.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 flex items-center gap-4 hover:bg-white/2 transition-colors"
                >
                  <div className="text-2xl">{tier.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${tier.color}`}>{tier.label}</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                      {w.draws?.month && w.draws?.year
                        ? new Date(w.draws.year, w.draws.month - 1).toLocaleString("en-GB", { month: "long", year: "numeric" })
                        : formatDate(w.created_at)
                      }
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Matched: {w.matched_numbers?.join(", ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-white">{formatCurrency(w.prize_amount)}</div>
                    <div className={`flex items-center gap-1 text-xs justify-end mt-1 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

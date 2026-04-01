"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Check, X, Loader2, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "paid">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/winners");
      const data = await res.json();
      setWinners(data.winners || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (winnerId: string, action: "verify" | "pay" | "reject") => {
    setProcessing(winnerId);
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Winner ${action}ed!`);
      await load();
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const tierLabels: Record<string, string> = {
    five_match: "🏆 Jackpot",
    four_match: "🥈 4-Match",
    three_match: "🥉 3-Match",
  };

  const filtered = filter === "all" ? winners : winners.filter((w) => w.status === filter);

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Award className="w-8 h-8 text-gold-400" /> Winners Verification
        </h1>
        <p className="text-slate-500">Verify and pay out prize winners</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "verified", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "glass border border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Winners table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No winners found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((w: any, i: number) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 flex items-center gap-4 hover:bg-white/2 transition-colors"
              >
                <div className="text-2xl w-10">{tierLabels[w.tier]?.split(" ")[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{w.profiles?.email || w.user_id}</span>
                    <span className="text-xs glass px-2 py-0.5 rounded-full border border-white/5">{tierLabels[w.tier]?.split(" ").slice(1).join(" ")}</span>
                  </div>
                  <div className="text-slate-500 text-xs">
                    Matched: [{w.matched_numbers?.join(", ")}] · {formatDate(w.created_at)}
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-gold-400">{formatCurrency(w.prize_amount)}</div>
                <div className="flex items-center gap-2">
                  {w.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(w.id, "verify")}
                        disabled={processing === w.id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-500/20 text-brand-400 rounded-lg hover:bg-brand-500/30 transition-colors border border-brand-500/30"
                      >
                        {processing === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Verify
                      </button>
                      <button
                        onClick={() => handleAction(w.id, "reject")}
                        disabled={processing === w.id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {w.status === "verified" && (
                    <button
                      onClick={() => handleAction(w.id, "pay")}
                      disabled={processing === w.id}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors border border-gold-500/30"
                    >
                      {processing === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Mark Paid
                    </button>
                  )}
                  {(w.status === "paid" || w.status === "rejected") && (
                    <span className={`text-xs px-3 py-1.5 rounded-lg capitalize ${w.status === "paid" ? "text-brand-400 bg-brand-500/10" : "text-red-400 bg-red-500/10"}`}>
                      {w.status}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

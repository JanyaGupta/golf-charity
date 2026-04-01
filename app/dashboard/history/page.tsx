"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Calendar, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getMonthName, formatCurrency } from "@/lib/utils";
import type { Draw } from "@/types";

export default function HistoryPage() {
  const supabase = createClient();
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("draws")
        .select("*, draw_entries!inner(user_id, numbers)")
        .eq("draw_entries.user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      setDraws(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <History className="w-8 h-8 text-slate-400" /> Draw History
        </h1>
        <p className="text-slate-500">All your past draw entries</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : draws.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No draw history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw: any, i) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{getMonthName(draw.month, draw.year)}</div>
                <div className="text-slate-500 text-sm mt-0.5">
                  Your numbers: {draw.draw_entries[0]?.numbers?.join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                  draw.status === "completed" ? "bg-brand-500/20 text-brand-400" :
                  draw.status === "running" ? "bg-amber-500/20 text-amber-400" :
                  "bg-slate-500/20 text-slate-400"
                }`}>
                  {draw.status === "completed" ? "Completed" : draw.status === "running" ? "Running" : "Pending"}
                </div>
                {draw.status === "completed" && draw.winning_numbers && (
                  <div className="text-xs text-slate-600 mt-1">Winning: {draw.winning_numbers.join(", ")}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

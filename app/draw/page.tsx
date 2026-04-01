"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, CheckCircle } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";

export default function DrawResultsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/draw/results?limit=6")
      .then((r) => r.json())
      .then((d) => { setDraws(d.draws || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)" }} className="font-bold text-xl">GolfCharity</span>
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
            Join Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-bold mb-4">
              Draw <span className="gradient-text">Results</span>
            </h1>
            <p className="text-slate-400 text-lg">Past monthly draw results and prize distributions</p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}
            </div>
          ) : draws.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border border-white/5">
              <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-xl">No completed draws yet</p>
              <p className="text-slate-600 mt-2">The first draw results will appear here after month end</p>
            </div>
          ) : (
            <div className="space-y-6">
              {draws.map((draw: any, i: number) => (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-3xl p-8 border border-white/5 card-hover"
                >
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div>
                      <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold">
                        {getMonthName(draw.month, draw.year)}
                      </h2>
                      <div className="text-brand-400 font-semibold mt-1">{formatCurrency(draw.prize_pool)} Prize Pool</div>
                    </div>
                    <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2">
                      <CheckCircle className="w-4 h-4 text-brand-400" />
                      <span className="text-brand-400 text-sm font-medium">Completed</span>
                    </div>
                  </div>

                  {/* Winning numbers */}
                  {draw.winning_numbers && (
                    <div className="mb-6">
                      <div className="text-slate-500 text-sm mb-3">Winning Numbers</div>
                      <div className="flex gap-3 flex-wrap">
                        {draw.winning_numbers.map((n: number, j: number) => (
                          <motion.div
                            key={j}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.08 + j * 0.05, type: "spring" }}
                            className="number-ball number-ball-gold w-14 h-14 text-lg"
                          >
                            {n.toString().padStart(2, "0")}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prize summary */}
                  {draw.winners && draw.winners.length > 0 && (
                    <div>
                      <div className="text-slate-500 text-sm mb-3">Prize Distribution</div>
                      <div className="flex gap-3 flex-wrap">
                        {(["five_match", "four_match", "three_match"] as const).map((tier) => {
                          const tierWinners = draw.winners.filter((w: any) => w.tier === tier);
                          if (tierWinners.length === 0) return null;
                          const labels = { five_match: "🏆 Jackpot", four_match: "🥈 4-Match", three_match: "🥉 3-Match" };
                          return (
                            <div key={tier} className="glass rounded-xl px-4 py-2 border border-white/5 text-sm">
                              <span>{labels[tier]}</span>
                              <span className="text-slate-500 mx-2">·</span>
                              <span className="text-brand-400 font-mono">{tierWinners.length} winner{tierWinners.length > 1 ? "s" : ""}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {draw.jackpot_rollover > 0 && (
                    <div className="mt-4 text-gold-400 text-sm">
                      ★ Jackpot rolled over: {formatCurrency(draw.jackpot_rollover)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

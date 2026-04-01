"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy, Target, Heart, Gift, ArrowRight, Calendar, TrendingUp, Zap,
  CheckCircle, Clock, AlertCircle, ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Subscription, GolfScore, Draw, Winner } from "@/types";

function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: any; label: string; value: string; sub?: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 border border-white/5 group hover:border-white/10 transition-all card-hover"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-mono)" }}>{value}</div>
      <div className="text-slate-500 text-sm">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [hasEntry, setHasEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [subRes, scoresRes, drawRes, winnersRes] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
        supabase.from("golf_scores").select("*").eq("user_id", user.id).order("entered_at", { ascending: false }).limit(5),
        supabase.from("draws").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("winners").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setSubscription(subRes.data);
      setScores(scoresRes.data || []);
      setDraw(drawRes.data);
      setWinners(winnersRes.data || []);

      if (drawRes.data) {
        const { data: entry } = await supabase
          .from("draw_entries")
          .select("id")
          .eq("user_id", user.id)
          .eq("draw_id", drawRes.data.id)
          .single();
        setHasEntry(!!entry);
      }

      setLoading(false);
    };
    load();
  }, []);

  const totalWinnings = winners.reduce((acc, w) => acc + (w.prize_amount || 0), 0);
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  const now = new Date();
  const monthName = getMonthName(now.getMonth() + 1, now.getFullYear());

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1">Your Dashboard</h1>
        <p className="text-slate-500">{monthName} Draw · {draw ? formatCurrency(draw.prize_pool) : "–"} Prize Pool</p>
      </motion.div>

      {/* Subscription alert */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-amber-400">No active subscription</div>
            <div className="text-slate-400 text-sm">Subscribe to enter the monthly draw and access all features.</div>
          </div>
          <Link href="/dashboard/settings" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
            Subscribe Now
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Subscription"
          value={isActive ? "Active" : "Inactive"}
          sub={isActive ? `${subscription?.plan} plan` : "Not subscribed"}
          color={isActive ? "bg-brand-500/20" : "bg-slate-500/20"}
          delay={0}
        />
        <StatCard
          icon={Gift}
          label="Total Winnings"
          value={formatCurrency(totalWinnings)}
          sub={`${winners.length} prizes won`}
          color="bg-gold-500/20"
          delay={0.1}
        />
        <StatCard
          icon={Heart}
          label="Donated"
          value="£–"
          sub="Via your allocations"
          color="bg-rose-500/20"
          delay={0.2}
        />
        <StatCard
          icon={Calendar}
          label="Next Draw"
          value={hasEntry ? "Entered ✓" : "Not entered"}
          sub={monthName}
          color={hasEntry ? "bg-brand-500/20" : "bg-slate-500/20"}
          delay={0.3}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-400" /> Recent Scores
            </h2>
            <Link href="/dashboard/scores" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No scores yet</p>
              <Link href="/dashboard/scores" className="text-brand-400 text-sm mt-2 inline-block">Add your first score →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, i) => (
                <div key={score.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="number-ball number-ball-green w-10 h-10 text-sm">{score.score}</div>
                  <div>
                    <div className="text-sm font-medium">Score {score.score}</div>
                    <div className="text-xs text-slate-600">
                      {new Date(score.entered_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  {i === 0 && <span className="ml-auto text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Latest</span>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Draw entry status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-400" /> {monthName} Draw
            </h2>
            <Link href="/dashboard/draw" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              Enter <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="text-center py-6">
            {hasEntry ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-brand-400" />
                </div>
                <div>
                  <div className="font-bold text-brand-400 text-lg">You're in!</div>
                  <div className="text-slate-500 text-sm">Draw happens end of {monthName}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <div className="font-bold text-slate-400 text-lg">Not yet entered</div>
                  <div className="text-slate-600 text-sm mb-4">You need at least 3 scores to enter</div>
                  <Link href="/dashboard/draw">
                    <button disabled={scores.length < 3 || !isActive} className="btn-primary text-sm px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      Enter Draw
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {draw && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="text-xs text-slate-600 mb-2">Prize Pool</div>
                <div className="text-3xl font-bold gradient-text-gold" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatCurrency(draw.prize_pool + draw.jackpot_rollover)}
                </div>
                {draw.jackpot_rollover > 0 && (
                  <div className="text-xs text-gold-400 mt-1">
                    Incl. {formatCurrency(draw.jackpot_rollover)} rollover jackpot
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent winnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-400" /> Winnings
            </h2>
            <Link href="/dashboard/winnings" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {winners.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No winnings yet</p>
              <p className="text-slate-600 text-xs mt-1">Enter the draw to win!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winners.slice(0, 4).map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    w.status === "paid" ? "bg-brand-400" :
                    w.status === "verified" ? "bg-gold-400" : "bg-slate-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{w.tier.replace("_", " ")}</div>
                    <div className="text-xs text-slate-600 capitalize">{w.status}</div>
                  </div>
                  <div className="text-brand-400 font-bold text-sm font-mono">{formatCurrency(w.prize_amount)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        {[
          { href: "/dashboard/scores", label: "Add Score", icon: Target, desc: "Log your latest round" },
          { href: "/dashboard/charity", label: "Set Charity", icon: Heart, desc: "Choose where to give" },
          { href: "/dashboard/draw", label: "Enter Draw", icon: Trophy, desc: "This month's prize draw" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <motion.div
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-brand-500/20 transition-all group card-hover"
            >
              <action.icon className="w-6 h-6 text-brand-400 mb-3" />
              <div className="font-semibold mb-0.5">{action.label}</div>
              <div className="text-slate-500 text-sm">{action.desc}</div>
              <ArrowRight className="w-4 h-4 text-brand-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

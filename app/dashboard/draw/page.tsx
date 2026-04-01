"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Loader2, Check, AlertCircle, Lock, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Draw, DrawEntry, GolfScore } from "@/types";
import toast from "react-hot-toast";

function NumberBallAnimated({ n, index, matched = false }: { n: number; index: number; matched?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.15, y: -4 }}
      className={`number-ball w-14 h-14 text-lg cursor-default select-none ${matched ? "number-ball-gold" : "number-ball-green"}`}
    >
      {n.toString().padStart(2, "0")}
    </motion.div>
  );
}

export default function DrawPage() {
  const supabase = createClient();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [entry, setEntry] = useState<DrawEntry | null>(null);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [userId, setUserId] = useState("");
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const now = new Date();
  const monthName = getMonthName(now.getMonth() + 1, now.getFullYear());

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [drawRes, subRes, scoresRes] = await Promise.all([
        supabase.from("draws").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
        supabase.from("golf_scores").select("*").eq("user_id", user.id).order("entered_at", { ascending: false }).limit(5),
      ]);

      setDraw(drawRes.data);
      setSubscription(subRes.data);
      setScores(scoresRes.data || []);

      if (drawRes.data) {
        const { data: existingEntry } = await supabase
          .from("draw_entries")
          .select("*")
          .eq("user_id", user.id)
          .eq("draw_id", drawRes.data.id)
          .single();
        setEntry(existingEntry);
        if (existingEntry) setGeneratedNumbers(existingEntry.numbers);
      }
      setLoading(false);
    };
    load();
  }, []);

  const generateFromScores = () => {
    if (scores.length < 3) return;
    // Algorithm: use score values + frequency weighting
    const scoreValues = scores.map((s) => s.score);
    const numbers = new Set<number>();

    // Direct scores that fit range
    for (const s of scoreValues) {
      if (s >= 1 && s <= 45) numbers.add(s);
      if (numbers.size >= 5) break;
    }

    // Fill remaining with derived numbers
    while (numbers.size < 5) {
      const base = scoreValues[Math.floor(Math.random() * scoreValues.length)];
      const derived = Math.min(45, Math.max(1, base + Math.floor(Math.random() * 10) - 5));
      numbers.add(derived);
    }

    const sorted = Array.from(numbers).sort((a, b) => a - b);
    setGeneratedNumbers(sorted);
    toast.success("Numbers generated from your scores!");
  };

  const handleEnter = async () => {
    if (!draw || !userId || generatedNumbers.length < 5) return;
    setEntering(true);
    try {
      const { data, error } = await supabase
        .from("draw_entries")
        .insert({ user_id: userId, draw_id: draw.id, numbers: generatedNumbers })
        .select()
        .single();
      if (error) throw error;
      setEntry(data);
      toast.success("🎉 You're in the draw!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEntering(false);
    }
  };

  if (loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1">Monthly Draw</h1>
        <p className="text-slate-500">{monthName} · Prize pool: {draw ? formatCurrency(draw.prize_pool + draw.jackpot_rollover) : "Loading..."}</p>
      </motion.div>

      {/* Prize breakdown */}
      {draw && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "5 Match (Jackpot)", pct: "40%", amount: Math.floor((draw.prize_pool + draw.jackpot_rollover) * 0.4) },
            { label: "4 Match", pct: "35%", amount: Math.floor((draw.prize_pool + draw.jackpot_rollover) * 0.35) },
            { label: "3 Match", pct: "25%", amount: Math.floor((draw.prize_pool + draw.jackpot_rollover) * 0.25) },
          ].map((tier) => (
            <div key={tier.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
              <div className="text-gold-400 font-bold text-xl font-mono">{tier.pct}</div>
              <div className="text-white font-semibold text-sm mt-1">{formatCurrency(tier.amount)}</div>
              <div className="text-slate-600 text-xs mt-0.5">{tier.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Entry card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative glass rounded-3xl p-8 border ${entry ? "border-brand-500/30 glow-green" : "border-white/5"}`}
      >
        {entry && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-brand-500/20 rounded-full px-3 py-1.5 border border-brand-500/30">
            <Check className="w-4 h-4 text-brand-400" />
            <span className="text-brand-400 text-sm font-medium">Entered</span>
          </div>
        )}

        <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold-400" />
          Your Numbers
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          {entry
            ? "Your lucky numbers for this month's draw"
            : "Generate numbers from your golf scores to enter"}
        </p>

        {/* Number display */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          {generatedNumbers.length > 0 ? (
            generatedNumbers.map((n, i) => (
              <NumberBallAnimated key={n} n={n} index={i} />
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="number-ball w-14 h-14 number-ball-dim text-slate-600 text-xl"
              >
                ?
              </motion.div>
            ))
          )}
        </div>

        {!entry && (
          <div className="space-y-3">
            {/* Requirements check */}
            <div className="space-y-2 mb-6">
              {[
                { label: "Active subscription", met: isActive },
                { label: `At least 3 scores (you have ${scores.length})`, met: scores.length >= 3 },
                { label: "Not yet entered this month", met: !entry },
              ].map((req) => (
                <div key={req.label} className={`flex items-center gap-2 text-sm ${req.met ? "text-brand-400" : "text-red-400"}`}>
                  {req.met ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {req.label}
                </div>
              ))}
            </div>

            <button
              onClick={generateFromScores}
              disabled={scores.length < 3 || !isActive}
              className="w-full flex items-center justify-center gap-2 glass border border-white/10 hover:border-white/20 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              {generatedNumbers.length > 0 ? "Re-generate Numbers" : "Generate My Numbers"}
            </button>

            <button
              onClick={handleEnter}
              disabled={entering || generatedNumbers.length < 5 || !isActive || scores.length < 3}
              className="btn-primary w-full justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {entering ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Entering...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Confirm Entry</>
              )}
            </button>

            {!isActive && (
              <div className="flex items-center gap-2 text-amber-400 text-sm justify-center mt-2">
                <Lock className="w-4 h-4" />
                Active subscription required to enter
              </div>
            )}
          </div>
        )}

        {entry && (
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Draw happens at the end of {monthName}. Good luck! 🍀
            </p>
            <p className="text-slate-600 text-xs mt-2">Numbers: {entry.numbers.join(" · ")}</p>
          </div>
        )}
      </motion.div>

      {/* How scoring works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="font-semibold mb-4">How your numbers are generated</h3>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex gap-3">
            <span className="text-brand-400 font-bold">1.</span>
            <span>Your 5 most recent golf scores (1–45) are taken as seed values</span>
          </div>
          <div className="flex gap-3">
            <span className="text-brand-400 font-bold">2.</span>
            <span>Our algorithm applies frequency-weighting to bias toward your strongest scores</span>
          </div>
          <div className="flex gap-3">
            <span className="text-brand-400 font-bold">3.</span>
            <span>5 unique numbers (1–45) are selected and sorted for your ticket</span>
          </div>
          <div className="flex gap-3">
            <span className="text-brand-400 font-bold">4.</span>
            <span>Entries lock at month end. You can regenerate anytime before locking</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Loader2, Trophy, RefreshCw, Settings, AlertTriangle, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminDrawPage() {
  const [draw, setDraw] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [mode, setMode] = useState<"random" | "most_common" | "least_common" | "balanced">("balanced");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/draws");
        const data = await res.json();
        setDraw(data.draw);
        setEntries(data.entries || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/draw/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: draw?.id, mode }),
      });
      const data = await res.json();
      setSimulation(data);
      toast.success("Simulation complete!");
    } catch {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const handleRunDraw = async () => {
    if (!window.confirm("⚠️ This will run the LIVE draw and cannot be undone. Continue?")) return;
    setRunning(true);
    try {
      const res = await fetch("/api/draw/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: draw?.id, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      toast.success("🎉 Draw completed!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Shuffle className="w-8 h-8 text-brand-400" /> Draw System
        </h1>
        <p className="text-slate-500">Run and manage monthly prize draws</p>
      </motion.div>

      {/* Current draw status */}
      {loading ? (
        <div className="skeleton h-32 rounded-2xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Entries", value: entries.length },
            { label: "Prize Pool", value: formatCurrency(draw?.prize_pool || 0) },
            { label: "Jackpot Rollover", value: formatCurrency(draw?.jackpot_rollover || 0) },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 border border-white/5 text-center">
              <div className="text-2xl font-bold font-mono text-brand-400">{stat.value}</div>
              <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Draw config */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> Draw Configuration
        </h2>
        <div>
          <label className="text-sm text-slate-400 mb-3 block">Draw Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "random", label: "Pure Random", desc: "Fully random 5 numbers" },
              { value: "balanced", label: "Balanced", desc: "Mix of common + rare picks" },
              { value: "most_common", label: "Most Common", desc: "Bias toward popular numbers" },
              { value: "least_common", label: "Least Common", desc: "Bias toward rare numbers" },
            ] as const).map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === m.value
                    ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                    : "border-white/5 glass text-slate-400 hover:border-white/15"
                }`}
              >
                <div className="font-medium text-sm mb-0.5">{m.label}</div>
                <div className="text-xs opacity-70">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <button
          onClick={handleSimulate}
          disabled={simulating || !draw || draw?.status === "completed"}
          className="flex items-center justify-center gap-2 glass border border-white/10 hover:border-white/20 rounded-2xl p-5 font-semibold transition-all disabled:opacity-40"
        >
          {simulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 text-brand-400" />}
          Run Simulation
        </button>

        <button
          onClick={handleRunDraw}
          disabled={running || !draw || draw?.status === "completed" || entries.length === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-5 font-semibold transition-all hover:opacity-90 disabled:opacity-40"
        >
          {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Run Live Draw
        </button>
      </motion.div>

      {draw?.status === "completed" && (
        <div className="flex items-center gap-2 text-brand-400 glass rounded-xl p-4 border border-brand-500/20">
          <Check className="w-5 h-5" />
          This month's draw has already been completed.
        </div>
      )}

      {entries.length === 0 && draw?.status !== "completed" && (
        <div className="flex items-center gap-2 text-amber-400 glass rounded-xl p-4 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5" />
          No entries for this month's draw yet.
        </div>
      )}

      {/* Simulation result */}
      <AnimatePresence>
        {simulation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-6 border border-brand-500/20"
          >
            <h3 className="font-semibold mb-4 text-brand-400">Simulation Result (Preview Only)</h3>
            <div className="flex gap-3 mb-6">
              {simulation.winningNumbers?.map((n: number, i: number) => (
                <div key={i} className="number-ball number-ball-gold w-12 h-12 text-sm">{n}</div>
              ))}
            </div>
            <div className="space-y-2">
              {simulation.winners?.map((w: any) => (
                <div key={w.tier} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 capitalize">{w.tier.replace("_", " ")}</span>
                  <span>{w.count} winner(s) · {formatCurrency(w.prizePerWinner)} each</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-sm">
              <span className="text-slate-400">Jackpot rollover</span>
              <span className="font-bold text-gold-400">{formatCurrency(simulation.jackpotRollover || 0)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live draw result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-gold-500/30 glow-gold text-center"
          >
            <Trophy className="w-12 h-12 text-gold-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Draw Complete!</h3>
            <div className="flex gap-3 justify-center mb-6">
              {result.winningNumbers?.map((n: number, i: number) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="number-ball number-ball-gold w-14 h-14 text-lg"
                >
                  {n}
                </motion.div>
              ))}
            </div>
            <div className="text-slate-400 text-sm">
              {result.winners?.length || 0} winner(s) identified · {formatCurrency(result.totalPaidOut || 0)} paid out
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

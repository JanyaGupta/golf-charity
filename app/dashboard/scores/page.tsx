"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, Loader2, Info, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GolfScore } from "@/types";
import toast from "react-hot-toast";

export default function ScoresPage() {
  const supabase = createClient();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("golf_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("entered_at", { ascending: false });
      setScores(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
    const score = parseInt(newScore);
    if (!score || score < 1 || score > 45) {
      toast.error("Score must be between 1 and 45");
      return;
    }
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("golf_scores")
        .insert({ user_id: userId, score, round_date: newDate, notes: notes || null })
        .select()
        .single();
      if (error) throw error;
      // Reload to get updated list (trigger may have deleted oldest)
      const { data: updated } = await supabase
        .from("golf_scores")
        .select("*")
        .eq("user_id", userId)
        .order("entered_at", { ascending: false });
      setScores(updated || []);
      setNewScore("");
      setNotes("");
      toast.success("Score added!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("golf_scores").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setScores(scores.filter((s) => s.id !== id));
    toast.success("Score removed");
  };

  const getScoreColor = (s: number) => {
    if (s <= 15) return "number-ball-green";
    if (s <= 30) return "number-ball-gold";
    return "bg-slate-700 text-slate-300";
  };

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1">My Scores</h1>
        <p className="text-slate-500">Enter your last 5 golf scores (1–45). Oldest auto-replaced when full.</p>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 border border-brand-500/20 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300">
          Your 5 most recent scores are used to generate your draw numbers using our algorithm. 
          Scores range from <strong>1–45</strong>. You need at least <strong>3 scores</strong> to enter the monthly draw.
        </div>
      </motion.div>

      {/* Score cards - timeline */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-400" />
          Your Rolling 5 Scores ({scores.length}/5)
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-12 border border-white/5 text-center"
          >
            <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No scores yet. Add your first score below.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {scores.map((score, i) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4 group"
              >
                <div className={`number-ball w-14 h-14 text-xl font-bold ${getScoreColor(score.score)}`}>
                  {score.score}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Score: {score.score}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(score.round_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  {score.notes && <div className="text-slate-600 text-xs mt-1">"{score.notes}"</div>}
                </div>
                {i === 0 && (
                  <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-1 rounded-full border border-brand-500/20">
                    Latest
                  </span>
                )}
                {i === scores.length - 1 && scores.length === 5 && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">
                    Next to go
                  </span>
                )}
                <button
                  onClick={() => handleDelete(score.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add score form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-brand-400" /> Add New Score
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Golf Score (1–45)</label>
              <input
                type="number"
                min={1}
                max={45}
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="e.g. 28"
                className="score-input w-full text-left"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Round Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="score-input w-full text-left"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. St Andrews, windy conditions"
              className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>

          {scores.length === 5 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400">
              ⚠️ You already have 5 scores. Adding a new one will remove the oldest score ({scores[scores.length - 1]?.score}).
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={adding || !newScore}
            className="btn-primary w-full justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Score</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

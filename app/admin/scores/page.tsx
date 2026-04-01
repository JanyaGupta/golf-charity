"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function AdminScoresPage() {
  const supabase = createClient();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("golf_scores")
        .select("*, profiles(email, full_name)")
        .order("entered_at", { ascending: false })
        .limit(100);
      setScores(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = scores.filter((s) =>
    s.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Target className="w-8 h-8 text-brand-400" /> Golf Scores
        </h1>
        <p className="text-slate-500">{scores.length} scores recorded</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-4 text-slate-500 font-medium">User</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Score</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Round Date</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Entered</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-3"><div className="skeleton h-8 rounded-lg" /></td></tr>
                ))
              ) : filtered.map((s: any, i) => (
                <tr key={s.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-sm">{s.profiles?.full_name || "—"}</div>
                    <div className="text-slate-500 text-xs">{s.profiles?.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="number-ball number-ball-green w-10 h-10 text-sm inline-flex">{s.score}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{s.round_date}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(s.entered_at)}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{s.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

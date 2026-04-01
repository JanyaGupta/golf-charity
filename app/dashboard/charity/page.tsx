"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Check, ExternalLink, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Charity } from "@/types";
import toast from "react-hot-toast";

export default function CharityPage() {
  const supabase = createClient();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [charRes, allocRes] = await Promise.all([
        supabase.from("charities").select("*").eq("is_active", true).order("name"),
        supabase.from("charity_allocations").select("charity_id").eq("user_id", user.id).single(),
      ]);

      setCharities(charRes.data || []);
      if (allocRes.data?.charity_id) setSelected(allocRes.data.charity_id);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("charity_allocations")
        .upsert({
          user_id: userId,
          charity_id: selected,
          percentage: 100,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,charity_id" });
      if (error) throw error;
      toast.success("Charity preference saved! 💚");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const categoryColors: Record<string, string> = {
    "Health": "bg-rose-500/20 text-rose-400 border-rose-500/30",
    "Sports & Youth": "bg-brand-500/20 text-brand-400 border-brand-500/30",
    "Environment": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Community": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-400" /> Choose Your Charity
        </h1>
        <p className="text-slate-500">A portion of every subscription automatically supports your chosen charity.</p>
      </motion.div>

      {/* Impact summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5"
      >
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-rose-400" />
          <span className="font-semibold text-rose-400">How contributions work</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          10% of every subscription payment is pooled and distributed to charities based on member selections. 
          The more members who choose a charity, the more it receives each month.
        </p>
      </motion.div>

      {/* Charity grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {charities.map((charity, i) => {
            const isSelected = selected === charity.id;
            const catColor = categoryColors[charity.category] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
            return (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(charity.id)}
                className={`relative glass rounded-2xl p-5 border cursor-pointer transition-all card-hover ${
                  isSelected
                    ? "border-brand-500/50 bg-brand-500/5 glow-green"
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mb-3 ${catColor}`}>
                  {charity.category}
                </div>

                <h3 className="font-bold text-base mb-1">{charity.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{charity.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600">Total received</div>
                    <div className="text-brand-400 font-bold text-sm font-mono">{formatCurrency(charity.total_received)}</div>
                  </div>
                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 glass rounded-xl border border-white/5 hover:border-white/15 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="btn-primary w-full max-w-sm mx-auto flex justify-center py-3 disabled:opacity-40"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Charity Choice</>}
        </button>
      </motion.div>
    </div>
  );
}

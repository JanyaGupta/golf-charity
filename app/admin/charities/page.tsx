"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Edit, ToggleLeft, ToggleRight, Loader2, X, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Charity } from "@/types";
import toast from "react-hot-toast";

export default function AdminCharitiesPage() {
  const supabase = createClient();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "Health", website: "", logo_url: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("charities").select("*").order("name");
    setCharities(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from("charities").update({ is_active: !current }).eq("id", id);
    setCharities(charities.map((c) => c.id === id ? { ...c, is_active: !current } : c));
    toast.success(`Charity ${!current ? "activated" : "deactivated"}`);
  };

  const handleSave = async () => {
    if (!form.name || !form.description) {
      toast.error("Name and description required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("charities").insert({ ...form, is_active: true, total_received: 0 });
      if (error) throw error;
      toast.success("Charity added!");
      setShowForm(false);
      setForm({ name: "", description: "", category: "Health", website: "", logo_url: "" });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-400" /> Charities
          </h1>
          <p className="text-slate-500">{charities.filter((c) => c.is_active).length} active charities</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-6 border border-brand-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Add New Charity</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "name", label: "Name", placeholder: "Charity Name" },
                { key: "category", label: "Category", placeholder: "Health" },
                { key: "website", label: "Website", placeholder: "https://..." },
                { key: "logo_url", label: "Logo URL", placeholder: "https://..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the charity..."
                  className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Charity
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charities grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {charities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass rounded-2xl p-5 border transition-all ${c.is_active ? "border-white/5" : "border-white/2 opacity-60"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.category}</div>
                </div>
                <button
                  onClick={() => handleToggle(c.id, c.is_active)}
                  className={`transition-colors ${c.is_active ? "text-brand-400" : "text-slate-600"}`}
                >
                  {c.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{c.description}</p>
              <div className="text-xs text-brand-400 font-mono font-semibold">
                {formatCurrency(c.total_received)} received
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

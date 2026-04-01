"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, CreditCard, Check, Loader2, AlertCircle, ExternalLink, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Subscription } from "@/types";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", u.id).single();
      setSubscription(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setSubscribing(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "Failed to create checkout");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to open billing portal");
    } catch {
      toast.error("Network error.");
    } finally {
      setPortalLoading(false);
    }
  };

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-400" /> Settings
        </h1>
        <p className="text-slate-500">Manage your subscription and account</p>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          Account
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Member since</span>
            <span>{user?.created_at ? formatDate(user.created_at) : "–"}</span>
          </div>
        </div>
      </motion.div>

      {/* Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <Crown className="w-5 h-5 text-gold-400" /> Subscription
        </h2>

        {loading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : isActive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-brand-500/10 rounded-xl border border-brand-500/20">
              <Check className="w-5 h-5 text-brand-400" />
              <div>
                <div className="font-semibold text-brand-400">Active — {subscription?.plan} plan</div>
                <div className="text-slate-500 text-sm">
                  {subscription?.current_period_end
                    ? `Renews ${formatDate(subscription.current_period_end)}`
                    : "Active subscription"}
                </div>
              </div>
              <div className="ml-auto text-white font-bold font-mono">
                {subscription?.plan === "monthly" ? "£9.99/mo" : "£89.88/yr"}
              </div>
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                <AlertCircle className="w-4 h-4" />
                Cancels at end of billing period
              </div>
            )}

            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 glass border border-white/10 hover:border-white/20 rounded-xl px-5 py-3 text-sm font-medium transition-all"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage Billing / Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 mb-6">
              <AlertCircle className="w-4 h-4" />
              No active subscription. Subscribe to join the monthly draw.
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { plan: "monthly" as const, label: "Monthly", price: "£9.99", period: "/mo", desc: "Flexible · cancel anytime" },
                { plan: "yearly" as const, label: "Yearly", price: "£89.88", period: "/yr", desc: "Save 25% vs monthly", badge: "BEST VALUE" },
              ].map((p) => (
                <div key={p.plan} className="relative glass rounded-2xl p-5 border border-white/5">
                  {p.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-gradient-to-r from-brand-500 to-gold-400 text-white px-3 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {p.badge}
                    </div>
                  )}
                  <div className="text-slate-400 text-xs mb-1">{p.label}</div>
                  <div className="text-2xl font-bold mb-0.5 font-mono">{p.price}<span className="text-sm text-slate-500">{p.period}</span></div>
                  <div className="text-slate-600 text-xs mb-4">{p.desc}</div>
                  <button
                    onClick={() => handleSubscribe(p.plan)}
                    disabled={subscribing === p.plan}
                    className="btn-primary w-full justify-center text-sm py-2.5"
                  >
                    {subscribing === p.plan ? <Loader2 className="w-4 h-4 animate-spin" /> : `Choose ${p.label}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

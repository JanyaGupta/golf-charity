"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter((u: any) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" /> Users
        </h1>
        <p className="text-slate-500">{users.length} total members</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-4 text-slate-500 font-medium">User</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Subscription</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Joined</th>
                <th className="text-left px-5 py-4 text-slate-500 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="skeleton h-8 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500">No users found</td>
                </tr>
              ) : (
                filtered.map((u: any, i: number) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{u.full_name || "—"}</div>
                          <div className="text-slate-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {u.subscriptions?.[0] ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.subscriptions[0].status === "active" ? "bg-brand-500/20 text-brand-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          <CreditCard className="w-3 h-3" />
                          {u.subscriptions[0].status} · {u.subscriptions[0].plan}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4">
                      {u.is_admin ? (
                        <CheckCircle className="w-4 h-4 text-brand-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-700" />
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();

    const [usersRes, subsRes, drawRes, winnersRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id, amount_paid, status", { count: "exact" }),
      supabase.from("draws").select("prize_pool, jackpot_rollover").eq("status", "pending").order("created_at", { ascending: false }).limit(1).single(),
      supabase.from("winners").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const activeSubs = subsRes.data?.filter((s) => s.status === "active" || s.status === "trialing") || [];
    const totalRevenue = subsRes.data?.reduce((acc, s) => acc + (s.amount_paid || 0), 0) || 0;
    const totalDonations = Math.floor(totalRevenue * 0.1);

    return NextResponse.json({
      totalUsers: usersRes.count || 0,
      activeSubscriptions: activeSubs.length,
      totalRevenue,
      totalDonations,
      currentPrizePool: (drawRes.data?.prize_pool || 0) + (drawRes.data?.jackpot_rollover || 0),
      pendingWinners: winnersRes.count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

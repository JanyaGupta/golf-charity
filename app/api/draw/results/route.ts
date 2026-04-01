import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const { data: draws, error } = await supabase
      .from("draws")
      .select("*, winners(tier, prize_amount, status)")
      .eq("status", "completed")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ draws: draws || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

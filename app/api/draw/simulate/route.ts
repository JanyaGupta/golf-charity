import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { simulateDraw } from "@/lib/draw-engine";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { drawId, mode = "balanced", iterations = 100 } = await request.json();

    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

    const { data: entries } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", drawId);

    const result = simulateDraw(
      entries || [],
      draw.prize_pool,
      draw.jackpot_rollover,
      Math.min(iterations, 1000)
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

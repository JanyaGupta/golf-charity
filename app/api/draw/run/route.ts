import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runDraw } from "@/lib/draw-engine";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { drawId, mode = "balanced" } = await request.json();

    // Fetch the draw
    const { data: draw, error: drawErr } = await supabase
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .eq("status", "pending")
      .single();

    if (drawErr || !draw) {
      return NextResponse.json({ error: "Draw not found or already completed" }, { status: 404 });
    }

    // Fetch all entries
    const { data: entries, error: entriesErr } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", drawId);

    if (entriesErr) throw entriesErr;
    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No entries for this draw" }, { status: 400 });
    }

    // Run the draw engine
    const result = runDraw(entries, draw.prize_pool, draw.jackpot_rollover, mode as any);

    // Update draw status
    const { error: updateErr } = await supabase
      .from("draws")
      .update({
        status: "completed",
        winning_numbers: result.winningNumbers,
        five_match_pool: Math.floor(draw.prize_pool * 0.4),
        four_match_pool: Math.floor(draw.prize_pool * 0.35),
        three_match_pool: Math.floor(draw.prize_pool * 0.25),
        total_entries: entries.length,
        run_at: new Date().toISOString(),
      })
      .eq("id", drawId);

    if (updateErr) throw updateErr;

    // Insert winners
    if (result.winners.length > 0) {
      const winnerInserts = result.winners.map((w) => ({
        draw_id: drawId,
        user_id: w.userId,
        entry_id: w.entryId,
        matched_numbers: w.matchedNumbers,
        tier: w.tier,
        prize_amount:
          w.tier === "five_match" ? result.prizePerFiveMatch :
          w.tier === "four_match" ? result.prizePerFourMatch :
          result.prizePerThreeMatch,
        status: "pending",
      }));

      const { error: winnersErr } = await supabase.from("winners").insert(winnerInserts);
      if (winnersErr) throw winnersErr;
    }

    // Handle jackpot rollover — create next month's draw with rolled jackpot
    if (result.newJackpotRollover > 0) {
      const nextMonth = draw.month === 12 ? 1 : draw.month + 1;
      const nextYear = draw.month === 12 ? draw.year + 1 : draw.year;

      await supabase.from("draws").upsert({
        month: nextMonth,
        year: nextYear,
        status: "pending",
        prize_pool: 0,
        jackpot_rollover: result.newJackpotRollover,
      }, { onConflict: "month,year", ignoreDuplicates: false });
    }

    return NextResponse.json({
      success: true,
      winningNumbers: result.winningNumbers,
      winners: result.winners,
      fiveMatchCount: result.fiveMatchCount,
      fourMatchCount: result.fourMatchCount,
      threeMatchCount: result.threeMatchCount,
      totalPaidOut: result.totalPaidOut,
      newJackpotRollover: result.newJackpotRollover,
    });
  } catch (error: any) {
    console.error("Draw run error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

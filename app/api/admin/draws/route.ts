import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let entries: any[] = [];
    if (draw) {
      const { data } = await supabase
        .from("draw_entries")
        .select("*, profiles(email, full_name)")
        .eq("draw_id", draw.id);
      entries = data || [];
    }

    return NextResponse.json({ draw, entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: winners, error } = await supabase
      .from("winners")
      .select("*, profiles(email, full_name), draws(month, year)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ winners: winners || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

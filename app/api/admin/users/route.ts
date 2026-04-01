import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*, subscriptions(status, plan, amount_paid)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

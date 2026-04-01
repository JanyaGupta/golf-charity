import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("entered_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json({ scores: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check active subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (!sub || (sub.status !== "active" && sub.status !== "trialing")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
    }

    const { score, round_date, notes } = await request.json();

    if (!score || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("golf_scores")
      .insert({ user_id: user.id, score, round_date, notes })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ score: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

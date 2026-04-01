import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { action } = await request.json();

    const statusMap: Record<string, { status: string; field?: string }> = {
      verify: { status: "verified", field: "verified_at" },
      pay: { status: "paid", field: "paid_at" },
      reject: { status: "rejected" },
    };

    const update = statusMap[action];
    if (!update) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const updateData: any = { status: update.status };
    if (update.field) updateData[update.field] = new Date().toISOString();

    const { error } = await supabase
      .from("winners")
      .update(updateData)
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

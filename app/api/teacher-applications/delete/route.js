import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req) {
  try {
    // ✅ Validate ENV
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { ids } = body;

    // ✅ Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No IDs provided" },
        { status: 400 }
      );
    }

    // ✅ Create Supabase Admin Client (Service Role - bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Delete records
    const { error } = await supabase
      .from("teacher_applications")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Delete Error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} applications`,
    });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

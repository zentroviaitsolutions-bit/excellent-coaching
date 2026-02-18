import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    // ✅ Validate ENV
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    // ✅ Parse request body
    const body = await req.json();

    // ✅ Validate required fields
    if (!body.full_name?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!body.phone?.trim()) {
      return NextResponse.json(
        { error: "Phone is required" },
        { status: 400 }
      );
    }

    // ✅ Create Supabase Admin Client (Service Role - bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Prepare data
    const payload = {
      full_name: body.full_name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone.trim(),
      whatsapp: body.whatsapp?.trim() || null,
      city: body.city?.trim() || null,
      address: body.address?.trim() || null,
      qualification: body.qualification?.trim() || null,
      subjects: body.subjects?.trim() || null,
      experience_years: body.experience_years ? Number(body.experience_years) : null,
      expected_salary: body.expected_salary?.trim() || null,
      availability: body.availability?.trim() || null,
      notes: body.notes?.trim() || null,
      status: "pending", // Default status
    };

    // ✅ Insert data
    const { data, error } = await supabase
      .from("teacher_applications")
      .insert([payload])
      .select();

    if (error) {
      console.error("Database Insert Error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to submit application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
      data: data?.[0] || null,
    });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

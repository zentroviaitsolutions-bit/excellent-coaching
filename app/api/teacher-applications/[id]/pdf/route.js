import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    // ✅ Await params (Next.js 13+)
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    // ✅ Validate ENV
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    // ✅ Validate ID
    if (!id || isNaN(Number(id))) {
      console.error("Invalid ID:", id);
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // ✅ Create Supabase Admin Client (RLS safe)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Fetch Data
    const { data, error } = await supabase
      .from("teacher_applications")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error("Database Error:", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // ✅ Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 🎨 Colors
    const primaryColor = rgb(0, 0.2, 0.7); // Blue
    const secondaryColor = rgb(0.5, 0.5, 0.5); // Gray
    const lightGray = rgb(0.95, 0.95, 0.95);
    const white = rgb(1, 1, 1);
    const darkText = rgb(0.1, 0.1, 0.1);

    // ✅ Load and embed logo
    let logoImaged = null;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.jpeg");
      const logoBuffer = fs.readFileSync(logoPath);
      logoImaged = await pdfDoc.embedJpeg(logoBuffer);
    } catch (err) {
      console.warn("Logo not found, continuing without it");
    }

    // 🎨 Header Section with Logo & Title
    if (logoImaged) {
      page.drawImage(logoImaged, {
        x: 50,
        y: height - 80,
        width: 50,
        height: 50,
      });
    }

    page.drawText("EXCELLENT COACHING", {
      x: logoImaged ? 110 : 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: primaryColor,
    });

    page.drawText("Teacher Application Form", {
      x: logoImaged ? 110 : 50,
      y: height - 70,
      size: 12,
      font,
      color: secondaryColor,
    });

    // 📋 Divider Line
    page.drawLine({
      start: { x: 50, y: height - 95 },
      end: { x: width - 50, y: height - 95 },
      thickness: 2,
      color: primaryColor,
    });

    let y = height - 130;

    // 📝 Application Section Header
    page.drawText("APPLICATION INFORMATION", {
      x: 50,
      y,
      size: 13,
      font: boldFont,
      color: white,
    });

    // Background for section header
    page.drawRectangle({
      x: 45,
      y: y - 3,
      width: width - 90,
      height: 20,
      color: primaryColor,
    });

    page.drawText("APPLICATION INFORMATION", {
      x: 50,
      y,
      size: 13,
      font: boldFont,
      color: white,
    });

    y -= 35;

    const fields = [
      ["Application ID", data.id?.toString()],
      ["Full Name", data.full_name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["City", data.city],
    ];

    fields.forEach(([label, value], index) => {
      // Alternating background
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 45,
          y: y - 15,
          width: width - 90,
          height: 20,
          color: lightGray,
        });
      }

      page.drawText(label, {
        x: 60,
        y,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });

      page.drawText(value ?? "-", {
        x: 220,
        y,
        size: 11,
        font,
        color: darkText,
      });

      y -= 22;
    });

    // 🎓 Qualifications Section
    y -= 10;
    page.drawRectangle({
      x: 45,
      y: y - 3,
      width: width - 90,
      height: 20,
      color: primaryColor,
    });

    page.drawText("QUALIFICATIONS & EXPERIENCE", {
      x: 50,
      y,
      size: 13,
      font: boldFont,
      color: white,
    });

    y -= 35;

    const qualFields = [
      ["Qualification", data.qualification],
      ["Experience (Years)", data.experience_years?.toString()],
      ["Subjects", data.subjects],
    ];

    qualFields.forEach(([label, value], index) => {
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 45,
          y: y - 15,
          width: width - 90,
          height: 20,
          color: lightGray,
        });
      }

      page.drawText(label, {
        x: 60,
        y,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });

      page.drawText(value ?? "-", {
        x: 220,
        y,
        size: 11,
        font,
        color: darkText,
      });

      y -= 22;
    });

    // 📊 Application Status Section
    y -= 10;
    page.drawRectangle({
      x: 45,
      y: y - 3,
      width: width - 90,
      height: 20,
      color: primaryColor,
    });

    page.drawText("APPLICATION STATUS", {
      x: 50,
      y,
      size: 13,
      font: boldFont,
      color: white,
    });

    y -= 35;

    const statusColor =
      data.status === "approved" ? rgb(0, 0.7, 0) :
      data.status === "rejected" ? rgb(0.7, 0, 0) :
      rgb(0.7, 0.5, 0);

    page.drawRectangle({
      x: 45,
      y: y - 15,
      width: width - 90,
      height: 20,
      color: lightGray,
    });

    page.drawText("Status", {
      x: 60,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });

    page.drawText(data.status?.toUpperCase() ?? "-", {
      x: 220,
      y,
      size: 11,
      font: boldFont,
      color: statusColor,
    });

    y -= 22;

    page.drawRectangle({
      x: 45,
      y: y - 15,
      width: width - 90,
      height: 20,
      color: lightGray,
    });

    page.drawText("Applied At", {
      x: 60,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });

    page.drawText(new Date(data.created_at).toLocaleString(), {
      x: 220,
      y,
      size: 11,
      font,
      color: darkText,
    });

    // 🔽 Footer Divider
    page.drawLine({
      start: { x: 50, y: 60 },
      end: { x: width - 50, y: 60 },
      thickness: 1,
      color: secondaryColor,
    });

    // Footer
    page.drawText("Generated by Excellent Coaching | Teacher Applications System", {
      x: 50,
      y: 40,
      size: 10,
      font,
      color: secondaryColor,
    });

    page.drawText(`Document ID: ${Number(id)} | ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 25,
      size: 9,
      font,
      color: rgb(0.7, 0.7, 0.7),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="teacher_application_${Number(id)}.pdf"`,
      },
    });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


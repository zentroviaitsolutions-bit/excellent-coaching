"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabaseClient";

/**
 * ✅ More Attractive PDF + MORE VISIBLE WATERMARK
 * ------------------------------------------------
 * Changes:
 * - Stronger watermark (bigger + darker + repeated light pattern)
 * - Full border frame (top/bottom/left/right)
 * - Gradient-like header blocks + accent line
 * - Centered title + fancy section pills
 * - Clean two-column rows (label left, value right)
 * - Footer card with contact info
 *
 * Logo:
 * Put your logo at: /public/logo.jpeg
 */

const BRAND = {
  name: "Excellent Coaching Baheri",
  tagline: "Free Trial Registration Form",
  phone: "+91 8899911392",
  email: "mohdizharjafri@gmail.com",
  address: "Mohl Islam Nagar, Baheri, Bareilly, Uttar Pradesh, India",
  website: "https://yourdomain.com",
};

const LOGO_URL = "/logo.jpeg";

export default function FormTrialPage() {
  const [form, setForm] = useState({
    parent_name: "",
    email: "",
    phone: "",
    child_name: "",
    age: "",
    program: "",
    schedule: "",
    goals: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const imageToDataUrl = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // layout
    const m = 12; // outer margin
    const innerM = 8; // inner padding inside frame
    const xL = m + innerM;
    const xR = W - m - innerM;

    // colors
    const PURPLE = [124, 58, 237];
    const PINK = [236, 72, 153];
    const DARK = [17, 24, 39];
    const GRAY = [107, 114, 128];
    const LIGHT = [243, 244, 246];
    const BORDER = [209, 213, 219];

    // ---------- Background ----------
    pdf.setFillColor(250, 245, 255);
    pdf.rect(0, 0, W, H, "F");

    // soft corner blobs (fake gradient vibe)
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(m, m, W - m * 2, H - m * 2, 8, 8, "F");

    // ---------- Frame border (all sides) ----------
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(m, m, W - m * 2, H - m * 2, 8, 8, "S");

    // ---------- Watermark (more visible) ----------
    // Primary big watermark
    pdf.setTextColor(205, 205, 205); // darker than before
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(46);
    pdf.text(BRAND.name.toUpperCase(), W / 2, H / 2, {
      align: "center",
      angle: 25,
    });

    // Repeated light pattern watermark (adds premium feel)
    pdf.setTextColor(225, 225, 225);
    pdf.setFontSize(18);
    for (let yy = 70; yy < H - 60; yy += 28) {
      pdf.text("EXCELLENT COACHING", W / 2, yy, { align: "center", angle: 25 });
    }

    // ---------- Header ----------
    // header card with "gradient blocks"
    const headerY = m + 8;
    const headerH = 30;
    const headerX = m + 8;
    const headerW = W - (m + 8) * 2;

    pdf.setFillColor(...PURPLE);
    pdf.roundedRect(headerX, headerY, headerW, headerH, 8, 8, "F");
    pdf.setFillColor(...PINK);
    pdf.roundedRect(headerX + headerW * 0.55, headerY, headerW * 0.45, headerH, 8, 8, "F");

    // Accent line
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.6);
    pdf.line(headerX + 14, headerY + headerH - 6, headerX + headerW - 14, headerY + headerH - 6);

    // Logo
    pdf.setTextColor(255, 255, 255);
    let logoDataUrl = null;
    try {
      logoDataUrl = await imageToDataUrl(LOGO_URL);
      pdf.addImage(logoDataUrl, "JPEG", headerX + 10, headerY + 6, 18, 18);
    } catch (e) {
      console.warn("Logo load issue:", e?.message || e);
    }

    // Brand text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(BRAND.name, headerX + 32, headerY + 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(BRAND.tagline, headerX + 32, headerY + 20);

    // Date + ID (right)
    const formId = `TRIAL-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`Date: ${dateStr}`, headerX + headerW - 10, headerY + 12, { align: "right" });
    pdf.text(`Form ID: ${formId}`, headerX + headerW - 10, headerY + 18, { align: "right" });

    // ---------- Title pill ----------
    let y = headerY + headerH + 16;

    pdf.setFillColor(...LIGHT);
    pdf.setDrawColor(230, 231, 235);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(headerX, y - 9, headerW, 14, 8, 8, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...DARK);
    pdf.text("FREE TRIAL REGISTRATION DETAILS", W / 2, y, { align: "center" });

    y += 16;

    // ---------- Helpers ----------
    const sectionPill = (title) => {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(235, 236, 240);
      pdf.roundedRect(headerX, y - 6, headerW, 10, 6, 6, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...PURPLE);
      pdf.text(title.toUpperCase(), W / 2, y, { align: "center" });

      y += 12;
    };

    const row = (label, value) => {
      const safe = value?.toString()?.trim() ? value.toString().trim() : "-";

      // label left
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...GRAY);
      pdf.text(label, xL, y);

      // value right area (wrapped)
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...DARK);

      const valueX = xL + 70;
      const maxW = xR - valueX;
      const lines = pdf.splitTextToSize(safe, maxW);
      pdf.text(lines, valueX, y);

      y += 7 + (lines.length - 1) * 5;
    };

    // ---------- Content Card ----------
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(235, 236, 240);
    pdf.roundedRect(headerX, y - 6, headerW, 110, 10, 10, "FD");

    sectionPill("Parent Information");
    row("Parent Name", form.parent_name);
    row("Email", form.email);
    row("Phone", form.phone);

    y += 2;
    sectionPill("Child Information");
    row("Child Name", form.child_name);
    row("Age", form.age);
    row("Program", form.program);
    row("Schedule", form.schedule);

    // ---------- Goals Card ----------
    y += 4;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(235, 236, 240);
    pdf.roundedRect(headerX, y, headerW, 48, 10, 10, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...PINK);
    pdf.text("GOALS / NOTES", W / 2, y + 10, { align: "center" });

    pdf.setDrawColor(235, 236, 240);
    pdf.line(headerX + 12, y + 14, headerX + headerW - 12, y + 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    const goals = form.goals?.trim() ? form.goals.trim() : "-";
    const goalLines = pdf.splitTextToSize(goals, headerW - 24);
    pdf.text(goalLines.slice(0, 6), headerX + 12, y + 22);

    // ---------- Footer Card ----------
    const footerH = 26;
    const footerY = H - m - 8 - footerH;

    pdf.setFillColor(...LIGHT);
    pdf.setDrawColor(230, 231, 235);
    pdf.roundedRect(headerX, footerY, headerW, footerH, 10, 10, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    pdf.text("CONTACT", headerX + 12, footerY + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...GRAY);
    pdf.text(`${BRAND.phone}  |  ${BRAND.email}`, headerX + 12, footerY + 16);
    pdf.text(BRAND.address, headerX + 12, footerY + 21);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PURPLE);
    pdf.text(BRAND.website, headerX + headerW - 12, footerY + 16, { align: "right" });

    // Page number
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(156, 163, 175);
    pdf.text("Page 1/1", headerX + headerW - 12, footerY + 23, { align: "right" });

    // Save + return blob
    pdf.save(`${form.parent_name || "trial"}-form.pdf`);
    return pdf.output("blob");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pdfBlob = await generatePDF();

    const fileName = `${Date.now()}-${(form.parent_name || "trial")
      .toLowerCase()
      .replace(/\s+/g, "-")}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("form-pdfs")
      .upload(fileName, pdfBlob, { contentType: "application/pdf" });

    if (uploadError) return alert(uploadError.message);

    const { data } = supabase.storage.from("form-pdfs").getPublicUrl(fileName);
    const pdfUrl = data.publicUrl;

    const { error } = await supabase.from("forms").insert([
      { ...form, pdf_url: pdfUrl },
    ]);

    if (error) alert(error.message);
    else alert("Form submitted & PDF downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <section className="py-24 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Start Your Free Trial!
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Fill out the form below and let's begin your child's journey to
              success. No credit card required!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-2xl text-gray-900 mb-4">
                  Parent Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    name="parent_name"
                    onChange={handleChange}
                    required
                    placeholder="Parent Name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <input
                  name="phone"
                  onChange={handleChange}
                  required
                  placeholder="Phone Number"
                  className="w-full mt-6 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <h3 className="text-2xl text-gray-900 mb-4">
                  Child Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    name="child_name"
                    onChange={handleChange}
                    required
                    placeholder="Child Name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                  />
                  <input
                    name="age"
                    type="number"
                    onChange={handleChange}
                    required
                    placeholder="Age"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <select
                name="program"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              >
                <option value="">Select Program</option>
                <option>Reading & Writing</option>
                <option>Math Mastery</option>
                <option>Creative Arts</option>
                <option>Music</option>
                <option>Science</option>
                <option>Coding Kids</option>
                <option>All in One</option>
              </select>

              <select
                name="schedule"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              >
                <option value="">Select Schedule</option>
                <option>Weekday Morning</option>
                <option>Weekday Evening</option>
                <option>Weekend</option>
                <option>Flexible</option>
              </select>

              <textarea
                name="goals"
                onChange={handleChange}
                rows={4}
                placeholder="Your goals for your child..."
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg shadow-lg hover:scale-[1.02] transition cursor-pointer"
              >
                Submit & Start Free Trial 🎉
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              By submitting this form, you agree to our Terms & Privacy Policy.
            </p>

            <p className="text-center text-xs text-gray-500 mt-2">
              PDF will include coaching branding automatically using{" "}
              <span className="font-mono">/public/logo.jpeg</span>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

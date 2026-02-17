"use client";
import AdminBackButton from '@/app/components/AdminBackButton'
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import {
  BarChart3,
  CalendarDays,
  Download,
  Eye,
  Mail,
  MousePointerClick,
  RefreshCw,
  Users,
  AlertTriangle,
  FileDown,
} from "lucide-react";

/**
 * ✅ /admin/analytics/page.jsx (UPDATED)
 * -----------------------------------------
 * Tables:
 * - page_views (path, session_id, created_at)
 * - forms (created_at) ✅ admissions table
 * - contact_forms (created_at)
 * - contact_clicks (type, created_at)
 *
 * Exports:
 * - CSV (with branded header lines)
 * - PDF Report (logo + theme)
 */

const BRAND = {
  name: "Excellent Coaching Baheri",
  website: "https://yourdomain.com",
  email: "mohdizharjafri@gmail.com",
  phone: "+91 8899911392",
  address: "Mohl Islam Nagar, Baheri, Bareilly, Uttar Pradesh, India",
  logoUrl: "/logo.jpeg", // ✅ public/logo.jpeg
};

const CONTACT_TABLE = "contact_forms";
const ADMISSIONS_TABLE = "forms"; // ✅ FIXED
const CLICKS_TABLE = "contact_clicks";
const VIEWS_TABLE = "page_views";

function toDateKey(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function imageToDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Logo not found at " + url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("7d"); // 7d / 30d
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(null);

  const [summary, setSummary] = useState({
    visits: 0,
    uniqueVisitors: 0,
    admissions: 0,
    contacts: 0,
    clicks: 0,
    whatsapp: 0,
    email: 0,
    map: 0,
  });

  const [daily, setDaily] = useState([]);
  const [topPages, setTopPages] = useState([]);

  const daysCount = range === "30d" ? 30 : 7;

  const sinceISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysCount);
    return d.toISOString();
  }, [daysCount]);

  const dateLabel = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysCount);
    const fmt = (x) =>
      x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt(start)} - ${fmt(end)}`;
  }, [daysCount]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setDebug(null);

    try {
      const [viewsRes, admissionsRes, contactsRes, clicksRes] =
        await Promise.all([
          supabase
            .from(VIEWS_TABLE)
            .select("path, session_id, created_at")
            .gte("created_at", sinceISO)
            .order("created_at", { ascending: false })
            .limit(5000),

          supabase
            .from(ADMISSIONS_TABLE)
            .select("created_at")
            .gte("created_at", sinceISO)
            .order("created_at", { ascending: false })
            .limit(5000),

          supabase
            .from(CONTACT_TABLE)
            .select("created_at")
            .gte("created_at", sinceISO)
            .order("created_at", { ascending: false })
            .limit(5000),

          supabase
            .from(CLICKS_TABLE)
            .select("type, created_at")
            .gte("created_at", sinceISO)
            .order("created_at", { ascending: false })
            .limit(5000),
        ]);

      if (viewsRes.error || admissionsRes.error || contactsRes.error || clicksRes.error) {
        setDebug({
          views: viewsRes.error?.message || null,
          admissions: admissionsRes.error?.message || null,
          contacts: contactsRes.error?.message || null,
          clicks: clicksRes.error?.message || null,
          hint:
            "If you see 'permission denied' → RLS issue. If 'relation does not exist' → table name. If 'created_at does not exist' → add created_at column.",
        });
      }

      if (viewsRes.error) throw viewsRes.error;
      if (admissionsRes.error) throw admissionsRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (clicksRes.error) throw clicksRes.error;

      const views = viewsRes.data || [];
      const admissions = admissionsRes.data || [];
      const contacts = contactsRes.data || [];
      const clicks = clicksRes.data || [];

      const uniqueVisitors = new Set(
        views.map((v) => v.session_id).filter(Boolean)
      ).size;

      const whatsapp = clicks.filter((c) => c.type === "whatsapp").length;
      const email = clicks.filter((c) => c.type === "email").length;
      const map = clicks.filter((c) => c.type === "map").length;

      setSummary({
        visits: views.length,
        uniqueVisitors,
        admissions: admissions.length,
        contacts: contacts.length,
        clicks: clicks.length,
        whatsapp,
        email,
        map,
      });

      const pageCounts = new Map();
      for (const v of views) {
        const p = v.path || "/";
        pageCounts.set(p, (pageCounts.get(p) || 0) + 1);
      }
      const top = [...pageCounts.entries()]
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      setTopPages(top);

      const days = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        days.push({
          date: key,
          visits: 0,
          unique: 0,
          admissions: 0,
          contacts: 0,
          clicks: 0,
        });
      }

      const idxByDate = new Map(days.map((d, i) => [d.date, i]));
      const uniqueSets = new Map();

      for (const v of views) {
        const key = toDateKey(v.created_at);
        const idx = idxByDate.get(key);
        if (idx == null) continue;
        days[idx].visits += 1;

        if (v.session_id) {
          if (!uniqueSets.has(key)) uniqueSets.set(key, new Set());
          uniqueSets.get(key).add(v.session_id);
        }
      }

      for (const a of admissions) {
        const key = toDateKey(a.created_at);
        const idx = idxByDate.get(key);
        if (idx == null) continue;
        days[idx].admissions += 1;
      }

      for (const c of contacts) {
        const key = toDateKey(c.created_at);
        const idx = idxByDate.get(key);
        if (idx == null) continue;
        days[idx].contacts += 1;
      }

      for (const c of clicks) {
        const key = toDateKey(c.created_at);
        const idx = idxByDate.get(key);
        if (idx == null) continue;
        days[idx].clicks += 1;
      }

      for (const d of days) {
        d.unique = uniqueSets.has(d.date) ? uniqueSets.get(d.date).size : 0;
      }

      setDaily(days);
    } catch (e) {
      console.warn("Analytics fetch failed:", e?.message || e);
      setDebug((prev) => ({
        ...(prev || {}),
        fatal: e?.message || String(e),
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceISO]);

  // ✅ Branded CSV (header lines)
  const exportCSV = () => {
    const lines = [];

    // "Brand header" lines (Excel will show them as top rows)
    lines.push(`${BRAND.name}`);
    lines.push(`Analytics Report`);
    lines.push(`Date Range,${dateLabel}`);
    lines.push(`Website,${BRAND.website}`);
    lines.push(`Email,${BRAND.email}`);
    lines.push(`Phone,${BRAND.phone}`);
    lines.push(""); // blank row

    // data header
    lines.push(
      ["date", "visits", "unique_visitors", "admissions", "contact_messages", "clicks"].join(",")
    );

    for (const d of daily) {
      lines.push([d.date, d.visits, d.unique, d.admissions, d.contacts, d.clicks].join(","));
    }

    lines.push("");
    lines.push("SUMMARY");
    lines.push(`total_visits,${summary.visits}`);
    lines.push(`unique_visitors,${summary.uniqueVisitors}`);
    lines.push(`admissions,${summary.admissions}`);
    lines.push(`contact_messages,${summary.contacts}`);
    lines.push(`clicks,${summary.clicks}`);
    lines.push(`whatsapp_clicks,${summary.whatsapp}`);
    lines.push(`email_clicks,${summary.email}`);
    lines.push(`map_clicks,${summary.map}`);

    downloadTextFile(
      `analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`,
      lines.join("\n")
    );
  };

  // ✅ PDF report with logo + theme
  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const m = 12;

    const PURPLE = [124, 58, 237];
    const PINK = [236, 72, 153];
    const DARK = [17, 24, 39];
    const GRAY = [107, 114, 128];
    const BORDER = [220, 220, 220];

    // page background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    // border
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(1);
    pdf.rect(m, m, W - m * 2, H - m * 2);

    // watermark (visible)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(48);
    pdf.setTextColor(215, 215, 215);
    pdf.text(BRAND.name.toUpperCase(), W / 2, H / 2, { align: "center", angle: 28 });

    // header bar
    pdf.setFillColor(...PURPLE);
    pdf.rect(m, m, W - m * 2, 18, "F");
    pdf.setFillColor(...PINK);
    pdf.rect(m, m + 18, W - m * 2, 4, "F");

    // logo
    try {
      const logo = await imageToDataUrl(BRAND.logoUrl);
      pdf.addImage(logo, "JPEG", m + 3, m + 2, 14, 14);
    } catch (e) {
      // if logo missing, continue
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.text(BRAND.name, m + 20, m + 9);

    pdf.setFontSize(9);
    pdf.text(`Analytics Report (${range === "30d" ? "Last 30 days" : "Last 7 days"})`, m + 20, m + 14);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`Date Range: ${dateLabel}`, W - m - 3, m + 9, { align: "right" });
    pdf.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W - m - 3, m + 14, { align: "right" });

    // summary cards (simple)
    let y = m + 30;
    pdf.setTextColor(...DARK);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary", m + 4, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...GRAY);

    const sLines = [
      `Visits: ${summary.visits}`,
      `Unique Visitors: ${summary.uniqueVisitors}`,
      `Admissions (forms): ${summary.admissions}`,
      `Contact Messages: ${summary.contacts}`,
      `Clicks: ${summary.clicks} (WhatsApp ${summary.whatsapp}, Email ${summary.email}, Maps ${summary.map})`,
    ];

    for (const line of sLines) {
      pdf.text(line, m + 6, y);
      y += 6;
    }

    // daily table
    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...DARK);
    pdf.text("Daily Trend", m + 4, y);
    y += 6;

    // table header
    const colX = [m + 4, m + 40, m + 65, m + 90, m + 125, m + 155];
    pdf.setFontSize(9);
    pdf.setTextColor(...GRAY);
    pdf.text("Date", colX[0], y);
    pdf.text("Visits", colX[1], y);
    pdf.text("Unique", colX[2], y);
    pdf.text("Admissions", colX[3], y);
    pdf.text("Contacts", colX[4], y);
    pdf.text("Clicks", colX[5], y);

    pdf.setDrawColor(235, 235, 235);
    pdf.line(m + 4, y + 2, W - m - 4, y + 2);
    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...DARK);

    // show last 20 rows max (keep neat)
    const rows = daily.slice(-20);

    for (const d of rows) {
      if (y > H - m - 28) break; // avoid footer overlap
      pdf.text(d.date, colX[0], y);
      pdf.text(String(d.visits), colX[1], y);
      pdf.text(String(d.unique), colX[2], y);
      pdf.text(String(d.admissions), colX[3], y);
      pdf.text(String(d.contacts), colX[4], y);
      pdf.text(String(d.clicks), colX[5], y);
      y += 6;
    }

    // footer
    const fy = H - m - 10;
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(9);
    pdf.text(`${BRAND.phone} | ${BRAND.email}`, m + 4, fy);
    pdf.setTextColor(...PURPLE);
    pdf.setFont("helvetica", "bold");
    pdf.text(BRAND.website, W - m - 4, fy, { align: "right" });

    pdf.save(`analytics_${range}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const cards = [
    {
      title: "Visits",
      value: loading ? "—" : summary.visits,
      icon: <Eye className="w-5 h-5" />,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Unique Visitors",
      value: loading ? "—" : summary.uniqueVisitors,
      icon: <Users className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Contact Messages",
      value: loading ? "—" : summary.contacts,
      icon: <Mail className="w-5 h-5" />,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Clicks (Leads)",
      value: loading ? "—" : summary.clicks,
      icon: <MousePointerClick className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 sm:px-6">

        <AdminBackButton />
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Analytics
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Traffic + Leads in last {range === "30d" ? "30" : "7"} days
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white rounded-2xl shadow-sm p-1 flex">
                <button
                  onClick={() => setRange("7d")}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    range === "7d"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => setRange("30d")}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    range === "30d"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Last 30 days
                </button>
              </div>

              <button
                onClick={fetchAnalytics}
                className="px-4 py-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-gray-700" />
                Refresh
              </button>

              {/* ✅ Branded CSV */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={exportCSV}
                className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>

              {/* ✅ Themed PDF */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={exportPDF}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </motion.button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {debug && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Data fetch issue detected</p>
                  <ul className="mt-2 space-y-1">
                    {debug.views && <li>page_views: {debug.views}</li>}
                    {debug.admissions && <li>forms: {debug.admissions}</li>}
                    {debug.contacts && <li>contact_forms: {debug.contacts}</li>}
                    {debug.clicks && <li>contact_clicks: {debug.clicks}</li>}
                    {debug.fatal && <li>fatal: {debug.fatal}</li>}
                  </ul>
                  <p className="mt-2 text-xs text-yellow-800">{debug.hint}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((c) => (
            <motion.div
              key={c.title}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600">{c.title}</p>
                  <h2 className="text-4xl font-bold text-gray-900 mt-2">
                    {c.value}
                  </h2>
                  {c.title === "Clicks (Leads)" && !loading && (
                    <p className="text-sm text-gray-500 mt-2">
                      WhatsApp: {summary.whatsapp} • Email: {summary.email} • Maps: {summary.map}
                    </p>
                  )}
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  {c.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top pages + Daily trend */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 mb-10">
          {/* Top pages */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : topPages.length === 0 ? (
              <p className="text-gray-500">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {topPages.map((p) => (
                  <div
                    key={p.path}
                    className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3"
                  >
                    <span className="text-gray-700 font-medium truncate max-w-[70%]">
                      {p.path}
                    </span>
                    <span className="text-gray-900 font-semibold">{p.views}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily trend table */}
          <div className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Trend (Visits / Leads)
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Visits</th>
                    <th className="py-3 pr-4">Unique</th>
                    <th className="py-3 pr-4">Admissions</th>
                    <th className="py-3 pr-4">Contacts</th>
                    <th className="py-3 pr-4">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="py-4 text-gray-500" colSpan={6}>
                        Loading...
                      </td>
                    </tr>
                  ) : daily.length === 0 ? (
                    <tr>
                      <td className="py-4 text-gray-500" colSpan={6}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    daily.map((d) => (
                      <tr
                        key={d.date}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {d.date}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{d.visits}</td>
                        <td className="py-3 pr-4 text-gray-700">{d.unique}</td>
                        <td className="py-3 pr-4 text-gray-700">{d.admissions}</td>
                        <td className="py-3 pr-4 text-gray-700">{d.contacts}</td>
                        <td className="py-3 pr-4 text-gray-700">{d.clicks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              CSV cannot have logo/theme (text only). Use “Export PDF” for branded report.
            </p>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </>
  );
}

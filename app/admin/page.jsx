"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ClipboardList,
  Eye,
  GraduationCap,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  PhoneCall,
  Quote,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

/** ✅ CHANGE THESE IF YOUR TABLE NAMES ARE DIFFERENT */
const CONTACT_TABLE = "contact_forms"; // your contact page form table
const ADMISSIONS_TABLE = "forms"; // your admissions table
const CLICKS_TABLE = "contact_clicks"; // whatsapp/email/map clicks
const VIEWS_TABLE = "page_views"; // page visit tracking
const TEACHERS_TABLE = "teacher_applications"; // ✅ career teachers apply table

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // last X days filter
  const [range, setRange] = useState("7d"); // 7d / 30d
  const sinceISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (range === "30d" ? 30 : 7));
    return d.toISOString();
  }, [range]);

  const [kpis, setKpis] = useState({
    visitorsTotal: 0,
    visitorsRange: 0,
    uniqueVisitorsRange: 0,

    admissionsTotal: 0,
    admissionsRange: 0,

    contactsTotal: 0,
    contactsRange: 0,

    clicksTotal: 0,
    clicksRange: 0,
    whatsappClicks: 0,
    emailClicks: 0,
    mapClicks: 0,
  });

  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]); // ✅ NEW
  const [topPages, setTopPages] = useState([]); // { path, views }
  const [latestViews, setLatestViews] = useState([]); // { path, created_at }

  // ---------------- Actions ----------------
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const safeCount = async (table, filter = (q) => q) => {
    const { count, error } = await filter(
      supabase.from(table).select("*", { count: "exact", head: true })
    );
    if (error) throw error;
    return count || 0;
  };

  const fetchTopPages = async () => {
    const { data, error } = await supabase
      .from(VIEWS_TABLE)
      .select("path, created_at")
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) throw error;

    const counts = new Map();
    for (const row of data || []) {
      const p = row.path || "/";
      counts.set(p, (counts.get(p) || 0) + 1);
    }

    const sorted = [...counts.entries()]
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    setTopPages(sorted);
  };

  const fetchLatestViews = async () => {
    const { data, error } = await supabase
      .from(VIEWS_TABLE)
      .select("path, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw error;
    setLatestViews(data || []);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Visitors
      const visitorsTotal = await safeCount(VIEWS_TABLE);
      const visitorsRange = await safeCount(VIEWS_TABLE, (q) =>
        q.gte("created_at", sinceISO)
      );

      // unique visitors (session_id distinct)
      const { data: uniqData, error: uniqErr } = await supabase
        .from(VIEWS_TABLE)
        .select("session_id")
        .gte("created_at", sinceISO)
        .limit(5000);

      if (uniqErr) throw uniqErr;

      const uniqueVisitorsRange = new Set(
        (uniqData || []).map((x) => x.session_id).filter(Boolean)
      ).size;

      // Admissions
      const admissionsTotal = await safeCount(ADMISSIONS_TABLE);
      const admissionsRange = await safeCount(ADMISSIONS_TABLE, (q) =>
        q.gte("created_at", sinceISO)
      );

      const { data: aData, error: aErr } = await supabase
        .from(ADMISSIONS_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (aErr) throw aErr;

      // Contacts
      const contactsTotal = await safeCount(CONTACT_TABLE);
      const contactsRange = await safeCount(CONTACT_TABLE, (q) =>
        q.gte("created_at", sinceISO)
      );

      const { data: cData, error: cErr } = await supabase
        .from(CONTACT_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (cErr) throw cErr;

      // ✅ Teachers (Career Applications)
      const { data: tData, error: tErr } = await supabase
        .from(TEACHERS_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (tErr) throw tErr;

      // Clicks
      const clicksTotal = await safeCount(CLICKS_TABLE);
      const clicksRange = await safeCount(CLICKS_TABLE, (q) =>
        q.gte("created_at", sinceISO)
      );

      const whatsappClicks = await safeCount(CLICKS_TABLE, (q) =>
        q.eq("type", "whatsapp")
      );
      const emailClicks = await safeCount(CLICKS_TABLE, (q) =>
        q.eq("type", "email")
      );
      const mapClicks = await safeCount(CLICKS_TABLE, (q) => q.eq("type", "map"));

      // Pages
      await Promise.all([fetchTopPages(), fetchLatestViews()]);

      setKpis({
        visitorsTotal,
        visitorsRange,
        uniqueVisitorsRange,
        admissionsTotal,
        admissionsRange,
        contactsTotal,
        contactsRange,
        clicksTotal,
        clicksRange,
        whatsappClicks,
        emailClicks,
        mapClicks,
      });

      setRecentAdmissions(aData || []);
      setRecentContacts(cData || []);
      setRecentTeachers(tData || []); // ✅ NEW
    } catch (e) {
      console.warn("Dashboard fetch failed:", e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  // Realtime admissions notification
  useEffect(() => {
    Notification.requestPermission();

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: ADMISSIONS_TABLE },
        (payload) => {
          const f = payload.new;
          if (Notification.permission === "granted") {
            new Notification("New Admission Form!", {
              body: `${f?.parent_name || "Someone"} submitted an admission form`,
            });
          }
          fetchDashboard();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceISO]);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceISO]);

  // ---------------- UI Data ----------------
  const kpiCards = [
    {
      title: "Visitors",
      value: loading ? "—" : kpis.visitorsTotal,
      sub: loading
        ? "—"
        : `${kpis.visitorsRange} visits • ${kpis.uniqueVisitorsRange} unique (last ${
            range === "30d" ? "30" : "7"
          } days)`,
      icon: <Eye className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-500",
      onClick: () => router.push("/admin/analytics"),
    },
    {
      title: "Admissions",
      value: loading ? "—" : kpis.admissionsTotal,
      sub: loading
        ? "—"
        : `${kpis.admissionsRange} new (last ${range === "30d" ? "30" : "7"} days)`,
      icon: <ClipboardList className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => router.push("/admin/forms"),
    },
    {
      title: "Contact Messages",
      value: loading ? "—" : kpis.contactsTotal,
      sub: loading
        ? "—"
        : `${kpis.contactsRange} new (last ${range === "30d" ? "30" : "7"} days)`,
      icon: <Mail className="w-6 h-6" />,
      gradient: "from-blue-500 to-purple-500",
      onClick: () => router.push("/admin/contact-messages"),
    },
    {
      title: "Lead Clicks",
      value: loading ? "—" : kpis.clicksTotal,
      sub: loading
        ? "—"
        : `${kpis.clicksRange} clicks (last ${range === "30d" ? "30" : "7"} days)`,
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-500",
      onClick: () => router.push("/admin/contact-messages"),
    },
  ];

  const leadSplit = [
    {
      label: "WhatsApp",
      value: loading ? "—" : kpis.whatsappClicks,
      icon: <PhoneCall className="w-4 h-4" />,
    },
    {
      label: "Email",
      value: loading ? "—" : kpis.emailClicks,
      icon: <Mail className="w-4 h-4" />,
    },
    {
      label: "Maps",
      value: loading ? "—" : kpis.mapClicks,
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const quickActions = [
    {
      title: "Add Coach",
      desc: "Create new teacher profiles",
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => router.push("/admin/add-coach"),
    },
    {
      title: "Manage Coaches",
      desc: "Edit or remove coaches",
      icon: <Users className="w-5 h-5" />,
      onClick: () => router.push("/admin/manage-coaches"),
    },
    {
      title: "Add Gallery",
      desc: "Upload photos & videos",
      icon: <Images className="w-5 h-5" />,
      onClick: () => router.push("/admin/add-gallery"),
    },
    {
      title: "Manage Gallery",
      desc: "Delete photos & videos",
      icon: <Images className="w-5 h-5" />,
      onClick: () => router.push("/admin/manage-gallery"),
    },
    {
      title: "Add Testimonial",
      desc: "Create new parent reviews",
      icon: <Quote className="w-5 h-5" />,
      onClick: () => router.push("/admin/add-testimonial"),
    },
    {
      title: "Manage Testimonials",
      desc: "View & delete testimonials",
      icon: <Quote className="w-5 h-5" />,
      onClick: () => router.push("/admin/manage-testimonials"),
    },
    {
      title: "Admissions",
      desc: "View admission submissions",
      icon: <GraduationCap className="w-5 h-5" />,
      onClick: () => router.push("/admin/forms"),
    },
    {
      title: "Contact Messages",
      desc: "View contact page leads",
      icon: <Mail className="w-5 h-5" />,
      onClick: () => router.push("/admin/contact-messages"),
    },
    // ✅ Optional quick action (agar tum page banayoge /admin/teachers)
    {
      title: "Teacher Applications",
      desc: "View career applications",
      icon: <Users className="w-5 h-5" />,
      onClick: () => router.push("/admin/teachers"),
    },
  ];

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <LayoutDashboard className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Realtime analytics & lead monitoring
                </p>
              </div>
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
                onClick={fetchDashboard}
                className="px-4 py-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-gray-700" />
                Refresh
              </button>

              <button
                onClick={() => router.push("/admin/settings")}
                className="px-4 py-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-gray-700" />
                Settings
              </button>

              <button
                onClick={logout}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-lg hover:scale-[1.02] transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.99 }}
              onClick={card.onClick}
              className="cursor-pointer bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600">{card.title}</p>
                  <div className="flex items-end gap-3 mt-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                      {card.value}
                    </h2>
                    <span className="text-sm text-gray-500 mb-1">
                      <ArrowUpRight className="inline w-4 h-4 mr-1" />
                      Open
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{card.sub}</p>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 mb-8">
          {/* Lead Intent */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Intent (Clicks)
            </h3>

            <div className="space-y-4">
              {leadSplit.map((x) => (
                <div key={x.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700">
                    {x.icon} {x.label}
                  </span>
                  <span className="font-semibold text-gray-900">{x.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/admin/contact-messages")}
              className="mt-6 w-full px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              View leads
            </button>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Pages (last {range === "30d" ? "30" : "7"} days)
            </h3>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : topPages.length === 0 ? (
              <p className="text-gray-500">No page views yet.</p>
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
                    <span className="text-gray-900 font-semibold">
                      {p.views}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/admin/analytics")}
              className="mt-6 w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              Open analytics
            </button>
          </div>

          {/* Latest Visits */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Latest Visits
            </h3>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : latestViews.length === 0 ? (
              <p className="text-gray-500">No visits yet.</p>
            ) : (
              <div className="space-y-3">
                {latestViews.map((v, idx) => (
                  <div
                    key={`${v.created_at}-${idx}`}
                    className="border border-gray-100 rounded-2xl p-3 hover:bg-gray-50 transition"
                  >
                    <p className="text-gray-900 font-medium truncate">
                      {v.path || "/"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {v.created_at
                        ? new Date(v.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Lists */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 mb-10">
          {/* Admissions */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Admissions
              </h3>
              <button
                onClick={() => router.push("/admin/forms")}
                className="text-sm text-purple-600 hover:underline"
              >
                Open all
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : recentAdmissions.length === 0 ? (
              <p className="text-gray-500">No admissions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAdmissions.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold text-gray-900">
                      {f.parent_name || "Parent"}{" "}
                      <span className="text-gray-500 font-normal">
                        • {f.phone || "—"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Program: {f.program || "—"} • Age: {f.child_age || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {f.created_at
                        ? new Date(f.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Contact Messages
              </h3>
              <button
                onClick={() => router.push("/admin/contact-messages")}
                className="text-sm text-purple-600 hover:underline"
              >
                Open all
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : recentContacts.length === 0 ? (
              <p className="text-gray-500">No contact messages yet.</p>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold text-gray-900">
                      {m.parent_name || "Parent"}{" "}
                      <span className="text-gray-500 font-normal">
                        • {m.phone || "—"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {m.message || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Teacher Applications */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Teacher Applications
              </h3>
              <button
                onClick={() => router.push("/admin/teachers")}
                className="text-sm text-purple-600 hover:underline"
              >
                Open all
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : recentTeachers.length === 0 ? (
              <p className="text-gray-500">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTeachers.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold text-gray-900">
                      {t.full_name || "Teacher"}{" "}
                      <span className="text-gray-500 font-normal">
                        • {t.phone || "—"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Subjects: {t.subjects || "—"} • City: {t.city || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                    </p>

                    {/* PDF button */}
                    {t.id && (
                      <a
                        className="inline-flex mt-3 text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
                        href={`/api/teacher-applications/${t.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((a, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
                onClick={a.onClick}
                className="cursor-pointer bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                    {a.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600">{a.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-10" />
      </div>
    </>
  );
}




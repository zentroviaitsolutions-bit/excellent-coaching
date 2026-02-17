"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FiDownload,
  FiSearch,
  FiRefreshCw,
  FiLock,
  FiUsers,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";

const ADMIN_EMAILS = ["mohdizharjafri@gmail.com"];

export default function AdminTeachersPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  // auth guard
  useEffect(() => {
    const run = async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      const email = (data?.user?.email || "").toLowerCase();
      const ok = ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
      if (!ok) return router.replace("/admin/login");
      setAuthLoading(false);
    };
    run();
  }, [router]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      setRows([]);
    } else setRows(data || []);

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading]);

  // DELETE FUNCTION
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("teacher_applications")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete.");
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [
        r.full_name,
        r.phone,
        r.whatsapp,
        r.email,
        r.subjects,
        r.qualification,
        r.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#EFF5FF] flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white/70 border border-blue-100 shadow p-6">
          Checking admin…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF5FF] pt-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-medium"
            >
              <FiArrowLeft />
              Back
            </Link>

            <div>
              <p className="text-sm text-slate-600">Admin</p>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <FiUsers className="text-blue-700" /> Teacher Applications
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
            >
              <FiLock /> Settings
            </Link>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* CARD */}
        <div className="rounded-3xl bg-white/70 border border-blue-100 shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-200"
                placeholder="Search name, phone, subjects, city..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-600">
              Showing <b>{filtered.length}</b> of <b>{rows.length}</b>
            </div>
          </div>

          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-[1050px] w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Teacher</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Subjects</th>
                    <th className="px-4 py-3 font-semibold">City</th>
                    <th className="px-4 py-3 font-semibold">PDF</th>
                    <th className="px-4 py-3 font-semibold">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-600">
                        No applications
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{r.full_name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {r.qualification || "-"} • {r.experience_years ?? "-"} yrs
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.phone} {r.whatsapp ? ` / ${r.whatsapp}` : ""}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.subjects || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{r.city || "-"}</td>
                        <td className="px-4 py-3">
                          <a
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
                            href={`/api/teacher-applications/${r.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FiDownload /> PDF
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// import AdminBackButton from "../../components/AdminBackButton";
// import Navbar from '@/app/components/Navbar'

import { supabase } from "@/lib/supabaseClient";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiSettings,
  FiExternalLink,
  FiLogOut,
  FiPhone,
  FiMapPin,
  FiMessageSquare,
  FiLink,
  FiAlertCircle,
  FiTool,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";

/**
 * ✅ SET YOUR ADMIN EMAILS HERE
 * (jis email se supabase auth login hota hai)
 */
const ADMIN_EMAILS = ["mohdizharjafri@gmail.com"]; // add more if needed

export default function AdminSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    whatsapp: "",
    phone: "",
    address: "",
    map_link: "",
    announcement: "",
    maintenance_mode: false,
    admission_alerts: true,
  });

  const [initialForm, setInitialForm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // success | error | info

  // ✅ Auth Guard
  useEffect(() => {
    const run = async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.replace("/admin/login");
        return;
      }

      const email = (data.user.email || "").toLowerCase();
      const allowed = ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);

      if (!allowed) {
        // unauthorized
        router.replace("/admin/login");
        return;
      }

      setAdminEmail(email);
      setAuthLoading(false);
    };

    run();
  }, [router]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  // ✅ Load Settings (id=1)
  useEffect(() => {
    const load = async () => {
      // auth not done yet => don't load
      if (authLoading) return;

      setLoading(true);
      setMessage({ type: "", text: "" });

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.log("settings load error:", error);
        setMessage({ type: "error", text: error.message || "Failed to load settings" });
      } else if (data) {
        const next = {
          whatsapp: data.whatsapp || "",
          phone: data.phone || "",
          address: data.address || "",
          map_link: data.map_link || "",
          announcement: data.announcement || "",
          maintenance_mode: !!data.maintenance_mode,
          admission_alerts: !!data.admission_alerts,
        };
        setForm(next);
        setInitialForm(next);
      }

      setLoading(false);
    };

    load();
  }, [authLoading]);

  const save = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    const { error } = await supabase
      .from("site_settings")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setInitialForm(form);
      setMessage({ type: "success", text: "Settings saved ✅" });
      setTimeout(() => setMessage({ type: "", text: "" }), 2500);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const maintenanceBannerPreview = form.maintenance_mode
    ? "Maintenance mode ON — Website par maintenance message show hoga."
    : form.announcement?.trim()
    ? form.announcement
    : "No announcement set (optional).";

  // ---------------- UI Components ----------------

  const NavItem = ({ href, icon, label }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          "flex items-center gap-3 px-4 py-3 rounded-2xl transition",
          active
            ? "bg-blue-600 text-white shadow"
            : "text-slate-700 hover:bg-blue-50",
        ].join(" ")}
        onClick={() => setMobileOpen(false)}
      >
        <span className="text-lg">{icon}</span>
        <span className="font-semibold">{label}</span>
      </Link>
    );
  };

  const Field = ({ icon, label, hint, children }) => (
    <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-0.5 text-blue-700">{icon}</div>
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ title, desc, checked, onChange, icon }) => (
    <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-blue-700">{icon}</div>
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full transition",
          checked ? "bg-blue-600" : "bg-slate-300",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white transition",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900",
        "placeholder:text-slate-400 outline-none",
        "focus:ring-4 focus:ring-blue-200 focus:border-blue-300 transition",
        props.className || "",
      ].join(" ")}
    />
  );

  const Textarea = (props) => (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900",
        "placeholder:text-slate-400 outline-none",
        "focus:ring-4 focus:ring-blue-200 focus:border-blue-300 transition",
        props.className || "",
      ].join(" ")}
    />
  );

  const MessageBar = () => {
    if (!message?.text) return null;

    const styles =
      message.type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : message.type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-blue-200 bg-blue-50 text-blue-800";

    const Icon =
      message.type === "success" ? (
        <FiCheckCircle />
      ) : message.type === "error" ? (
        <FiAlertCircle />
      ) : (
        <FiAlertCircle />
      );

    return (

      <div className={`mb-5 rounded-2xl border px-4 py-3 flex items-start gap-2 ${styles}`}>
     
        <div className="mt-0.5">{Icon}</div>
        <p className="text-sm font-medium">{message.text}</p>
      </div>
    );
  };

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-56 rounded-xl bg-slate-200" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-24 rounded-2xl bg-slate-200" />
    </div>
  );

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-5 pb-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow">
          <p className="text-xs/5 opacity-90">Excellent Coaching</p>
          <p className="text-lg font-extrabold">Admin Panel</p>
          <p className="text-xs opacity-90 mt-1 truncate">{adminEmail || "admin"}</p>
        </div>
      </div>

      <div className="px-3 space-y-2">
        <NavItem href="/admin" icon={<FiHome />} label="Dashboard" />
        <NavItem href="/admin/admissions" icon={<FiUsers />} label="Admissions" />
        <NavItem href="/admin/settings" icon={<FiSettings />} label="Settings" />
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-blue-50 transition"
        >
          <span className="text-lg">
            <FiExternalLink />
          </span>
          <span className="font-semibold">Open Website</span>
        </a>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#EFF5FF] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white/70 border border-blue-100 shadow p-6">
          <p className="font-extrabold text-slate-900 text-xl">Checking admin access…</p>
          <p className="text-slate-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
   
    <div className="min-h-screen bg-[#EFF5FF]">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-blue-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-900">Admin Settings</p>
            <p className="text-xs text-slate-600 truncate max-w-[220px]">{adminEmail}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl">
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <p className="font-extrabold text-slate-900">Menu</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl border border-slate-200 bg-white"
              >
                <FiX />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block sticky top-6 h-[calc(100vh-24px)] rounded-3xl bg-white/70 border border-blue-100 shadow overflow-hidden">
            <SidebarContent />
          </aside>

          {/* Main */}
          <main className="pt-6 pb-28">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <p className="text-sm text-slate-600">Admin Panel</p>
                <h1 className="text-3xl font-extrabold text-slate-900">Site Settings</h1>
                <p className="text-slate-600 mt-1">
                  Update contact info, banner, and system toggles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isDirty ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Unsaved changes
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    All changes saved
                  </span>
                )}
              </div>
            </div>

            {/* Content card */}
            <div className="rounded-3xl bg-white/60 backdrop-blur border border-blue-100 shadow p-6">
              {loading ? (
                <Skeleton />
              ) : (
                <>
                  <MessageBar />

                  {/* Preview Banner */}
                  <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-700 mt-0.5">
                        <FiAlertCircle />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Banner Preview</p>
                        <p className="text-sm text-slate-700 mt-1">{maintenanceBannerPreview}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field
                      icon={<FiMessageSquare />}
                      label="WhatsApp Number"
                      hint="Website & inquiry buttons me use hoga"
                    >
                      <Input
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="7055902068"
                        inputMode="numeric"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Tip: country code chahiye ho to 91 + number.
                      </p>
                    </Field>

                    <Field icon={<FiPhone />} label="Phone Number" hint="Call button/Contact section">
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="Phone number"
                        inputMode="tel"
                      />
                    </Field>

                    <Field icon={<FiMapPin />} label="Address" hint="Footer / Contact page">
                      <Textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={4}
                        placeholder="Baheri, Uttar Pradesh..."
                      />
                    </Field>

                    <Field icon={<FiLink />} label="Google Maps Link" hint="Location open link">
                      <Input
                        value={form.map_link}
                        onChange={(e) => setForm({ ...form, map_link: e.target.value })}
                        placeholder="https://maps.google.com/..."
                      />
                      {!!form.map_link?.trim() && (
                        <a
                          className="inline-flex mt-3 text-sm font-semibold text-blue-700 hover:underline"
                          href={form.map_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open map ↗
                        </a>
                      )}
                    </Field>

                    <div className="md:col-span-2">
                      <Field
                        icon={<FiAlertCircle />}
                        label="Announcement Banner"
                        hint="Top of site ya homepage par show (optional)"
                      >
                        <Input
                          value={form.announcement}
                          onChange={(e) =>
                            setForm({ ...form, announcement: e.target.value })
                          }
                          placeholder="Admissions open for new batch..."
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                      <Toggle
                        icon={<FiTool />}
                        title="Maintenance Mode"
                        desc="ON hone par website par maintenance message dikhega"
                        checked={form.maintenance_mode}
                        onChange={(v) => setForm({ ...form, maintenance_mode: v })}
                      />

                      <Toggle
                        icon={<FiAlertCircle />}
                        title="Admission Alerts"
                        desc="New admission aane par admin alerts enabled"
                        checked={form.admission_alerts}
                        onChange={(v) => setForm({ ...form, admission_alerts: v })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Save Bar */}
            {!loading && (
              <div className="fixed bottom-0 left-0 right-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4">
                  <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur shadow-lg p-4 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">Settings</p>
                      <p className="text-slate-600">
                        {isDirty ? "Changes pending — save kar do." : "Everything up to date."}
                      </p>
                    </div>

                    <button
                      onClick={save}
                      disabled={saving || !isDirty}
                      className={[
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white",
                        "bg-gradient-to-r from-blue-600 to-indigo-600",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                      ].join(" ")}
                    >
                      <FiSave />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

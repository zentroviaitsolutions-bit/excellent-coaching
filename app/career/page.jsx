"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  FiBriefcase,
  FiPhone,
  FiMail,
  FiUser,
  FiMapPin,
  FiSend,
  FiLock,
  FiArrowLeft,
} from "react-icons/fi";

/* ---- Stable class constants (outside component = hydration safe) ---- */
const inputCls =
  "w-full mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-300 transition";

const labelCls = "text-sm font-semibold text-slate-700";

export default function CareerPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    address: "",
    qualification: "",
    subjects: "",
    experience_years: "",
    expected_salary: "",
    availability: "",
    notes: "",
  });

  const submit = async () => {
    setMsg("");

    if (!form.full_name.trim()) return setMsg("Full name required");
    if (!form.phone.trim()) return setMsg("Phone required");

    setLoading(true);

    const payload = {
      ...form,
      experience_years:
        form.experience_years === "" ? null : Number(form.experience_years),
    };

    const { error } = await supabase
      .from("teacher_applications")
      .insert(payload);

    setLoading(false);

    if (error) {
      console.log(error);
      setMsg(error.message);
    } else {
      setMsg("✅ Application submitted! We will contact you soon.");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        city: "",
        address: "",
        qualification: "",
        subjects: "",
        experience_years: "",
        expected_salary: "",
        availability: "",
        notes: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF5FF] pt-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition font-medium"
          >
            <FiArrowLeft />
            Back
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition font-semibold"
          >
            <FiLock />
            Admin Login
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">Career</p>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <FiBriefcase className="text-blue-700" />
            Teacher Job Application
          </h1>
          <p className="text-slate-600 mt-1">
            Apply to join our teaching team. Fill details carefully.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-blue-100 shadow-lg p-6">
          {msg && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-800">
              {msg}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={inputCls + " pl-11"}
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={inputCls + " pl-11"}
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Phone <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={inputCls + " pl-11"}
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="Phone number"
                  inputMode="tel"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
                placeholder="Your city"
              />
            </div>

            <div>
              <label className={labelCls}>Qualification</label>
              <input
                className={inputCls}
                value={form.qualification}
                onChange={(e) =>
                  setForm({ ...form, qualification: e.target.value })
                }
                placeholder="B.A / B.Ed / M.A"
              />
            </div>

            <div>
              <label className={labelCls}>Experience (years)</label>
              <input
                className={inputCls}
                value={form.experience_years}
                onChange={(e) =>
                  setForm({ ...form, experience_years: e.target.value })
                }
                inputMode="numeric"
                placeholder="0 / 1 / 2"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Any extra info..."
              />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold disabled:opacity-60 transition-all duration-200"
          >
            <FiSend />
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { supabase } from "@/lib/supabaseClient";
// import {
//   FiBriefcase,
//   FiPhone,
//   FiMail,
//   FiUser,
//   FiSend,
//   FiLock,
//   FiArrowLeft,
// } from "react-icons/fi";

// /* ---- Stable class constants ---- */
// const inputCls =
//   "w-full mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-300 transition";

// const labelCls = "text-sm font-semibold text-slate-700";

// export default function CareerPage() {
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState("");

//   const [form, setForm] = useState({
//     full_name: "",
//     email: "",
//     phone: "",
//     whatsapp: "",
//     city: "",
//     address: "",
//     qualification: "",
//     subjects: "",
//     experience_years: "",
//     expected_salary: "",
//     availability: "",
//     notes: "",
//   });

//   const submit = async () => {
//     setMsg("");

//     if (!form.full_name.trim()) return setMsg("Full name required");
//     if (!form.phone.trim()) return setMsg("Phone required");

//     setLoading(true);

//     try {
//       const payload = {
//         ...form,
//         experience_years:
//           form.experience_years === ""
//             ? null
//             : Number(form.experience_years),
//       };

//       const { data, error } = await supabase
//         .from("teacher_applications")
//         .insert([payload])
//         .select(); // FORCE RETURN DATA

//       console.log("INSERT DATA:", data);
//       console.log("INSERT ERROR:", error);

//       if (error) {
//         setMsg("Database Error: " + error.message);
//         setLoading(false);
//         return;
//       }

//       if (!data || data.length === 0) {
//         setMsg("Insert failed — no data returned.");
//         setLoading(false);
//         return;
//       }

//       setMsg("✅ Application submitted successfully!");
//       setForm({
//         full_name: "",
//         email: "",
//         phone: "",
//         whatsapp: "",
//         city: "",
//         address: "",
//         qualification: "",
//         subjects: "",
//         experience_years: "",
//         expected_salary: "",
//         availability: "",
//         notes: "",
//       });

//     } catch (err) {
//       console.log("Unexpected Error:", err);
//       setMsg("Unexpected error occurred.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-[#EFF5FF] pt-24 px-4">
//       <div className="max-w-4xl mx-auto">

//         {/* Top Navigation */}
//         <div className="flex items-center justify-between mb-6">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition font-medium"
//           >
//             <FiArrowLeft />
//             Back
//           </Link>

//           <Link
//             href="/admin/login"
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition font-semibold"
//           >
//             <FiLock />
//             Admin Login
//           </Link>
//         </div>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
//             <FiBriefcase className="text-blue-700" />
//             Teacher Job Application
//           </h1>
//         </div>

//         {/* Card */}
//         <div className="rounded-3xl bg-white shadow-lg p-6">

//           {msg && (
//             <div className="mb-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm">
//               {msg}
//             </div>
//           )}

//           <div className="grid md:grid-cols-2 gap-4">

//             <div>
//               <label className={labelCls}>Full Name *</label>
//               <input
//                 className={inputCls}
//                 value={form.full_name}
//                 onChange={(e) =>
//                   setForm({ ...form, full_name: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Email</label>
//               <input
//                 className={inputCls}
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm({ ...form, email: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Phone *</label>
//               <input
//                 className={inputCls}
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm({ ...form, phone: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className={labelCls}>City</label>
//               <input
//                 className={inputCls}
//                 value={form.city}
//                 onChange={(e) =>
//                   setForm({ ...form, city: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Qualification</label>
//               <input
//                 className={inputCls}
//                 value={form.qualification}
//                 onChange={(e) =>
//                   setForm({ ...form, qualification: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Experience (years)</label>
//               <input
//                 className={inputCls}
//                 value={form.experience_years}
//                 onChange={(e) =>
//                   setForm({ ...form, experience_years: e.target.value })
//                 }
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className={labelCls}>Notes</label>
//               <textarea
//                 className={inputCls}
//                 rows={3}
//                 value={form.notes}
//                 onChange={(e) =>
//                   setForm({ ...form, notes: e.target.value })
//                 }
//               />
//             </div>

//           </div>

//           <button
//             onClick={submit}
//             disabled={loading}
//             className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold disabled:opacity-60 transition"
//           >
//             <FiSend />
//             {loading ? "Submitting..." : "Submit Application"}
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// }

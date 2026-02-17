'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import AdminBackButton from "../../components/AdminBackButton";


export default function AdminForms() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    Notification.requestPermission();
    fetchForms();
    listenForNewForms();
  }, []);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setForms(data);
  };

  // 🔔 REALTIME LISTENER WITH NOTIFICATION
  const listenForNewForms = () => {
    supabase
      .channel("realtime-forms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forms" },
        (payload) => {
          const f = payload.new;

          console.log("NEW FORM RECEIVED:", f);

          if (Notification.permission === "granted") {
            new Notification("New Form Submitted!", {
              body: `${f.parent_name} submitted a form`,
              icon: "/favicon.ico",
            });
          }

          fetchForms();
        }
      )
      .subscribe();
  };

  // 🗑 DELETE FORM + PDF
  const deleteForm = async (form) => {
    const confirmDelete = confirm("Delete this form?");
    if (!confirmDelete) return;

    try {
      if (form.pdf_url) {
        const path = form.pdf_url.split("/form-pdfs/")[1];
        await supabase.storage.from("form-pdfs").remove([path]);
      }

      await supabase.from("forms").delete().eq("id", form.id);

      fetchForms();
    } catch (err) {
      console.log(err);
      alert("Error deleting form");
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-6">

        <AdminBackButton />
        
        <h1 className="text-5xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Manage Form Submissions
        </h1>

        {forms.length === 0 && (
          <p className="text-center text-gray-600 text-lg">No forms submitted yet</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {forms.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {f.parent_name}
              </h2>

              <p className="text-gray-700"><strong>Child:</strong> {f.child_name}</p>
              <p className="text-gray-700"><strong>Phone:</strong> {f.phone}</p>
              <p className="text-gray-700"><strong>Program:</strong> {f.program}</p>
              <p className="text-gray-700"><strong>Schedule:</strong> {f.schedule}</p>

              {f.pdf_url && (
                <a
                  href={f.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow hover:scale-105 transition"
                >
                  View PDF
                </a>
              )}

              <button
                onClick={() => deleteForm(f)}
                className=" cursor-pointer  ml-3 mt-4 px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        
      </div>
    </>
  );
}

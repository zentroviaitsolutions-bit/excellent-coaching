'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import AdminBackButton from "@/app/components/AdminBackButton";


export default function ContactMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_forms")
      .select("*")
      .order("created_at", { ascending: false });

    setMessages(data || []);
  };

  const deleteMessage = async (id) => {
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("contact_forms")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else {
      setMessages(messages.filter((m) => m.id !== id));
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <AdminBackButton />
        <h1 className="text-4xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Contact Messages
        </h1>

        <div className="max-w-6xl mx-auto space-y-6">
          {messages.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl shadow-lg relative">
              
              <button
                onClick={() => deleteMessage(m.id)}
                className="absolute top-4 right-4 px-4 py-1 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                Delete
              </button>

              <p><b>Name:</b> {m.parent_name}</p>
              <p><b>Email:</b> {m.email}</p>
              <p><b>Phone:</b> {m.phone}</p>
              <p><b>Child Age:</b> {m.child_age}</p>
              <p><b>Program:</b> {m.program}</p>
              <p><b>Message:</b> {m.message}</p>

              <p className="text-sm text-gray-400 mt-2">
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

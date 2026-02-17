"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/admin");

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setRedirectTo(sp.get("redirect") || "/admin");
    } catch {
      setRedirectTo("/admin");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email aur password dono required hain.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back(); // go to previous page
    } else {
      router.push("/"); // fallback to home
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 relative">

      {/* 🔙 Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-full hover:shadow-lg transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-4xl text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

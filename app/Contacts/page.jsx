"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const benefits = [
  "Free trial session for new students",
  "Flexible scheduling options",
  "100% satisfaction guarantee",
  "Small class sizes (max 6 kids)",
  "Regular progress reports",
];

// ✅ UPDATE THESE (no spaces)
const WHATSAPP_NUMBER_E164 = "918899911392"; // 91 + number (NO + sign)
const EMAIL_TO = "mohdizharjafri@gmail.com";
const ADDRESS_TEXT =
  "Mohl Islam Nagar, Baheri, Bareilly, Uttar Pradesh, India";

// ✅ Exact pin (BEST): put your coordinates here for true “exact pin” opening.
// If you don’t know, leave null and it will open by address search.
const LOCATION_COORDS = {
  lat: null, // example: 28.3642
  lng: null, // example: 79.5076
};

export default function Contacts() {
  const [form, setForm] = useState({
    parent_name: "",
    email: "",
    phone: "",
    child_age: "",
    program: "",
    message: "",
  });

  // ✅ Click tracking counts (shows how many people clicked each)
  const [clickCounts, setClickCounts] = useState({
    whatsapp: 0,
    email: 0,
    map: 0,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ WhatsApp / Email / Maps links
  const links = useMemo(() => {
    const whatsappText = encodeURIComponent(
      "Hi! I want to know about classes & free trial session."
    );
    const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${whatsappText}`;

    const emailSubject = encodeURIComponent("Inquiry: Trial Class for My Child");
    const emailBody = encodeURIComponent(
      "Hello,\n\nI’m interested in the program for my child. Please share details about timings, fees, and the free trial.\n\nThanks!"
    );
    const emailHref = `mailto:${EMAIL_TO}?subject=${emailSubject}&body=${emailBody}`;

    // ✅ Exact pin if coords exist, otherwise open maps by address
    const mapHref =
      LOCATION_COORDS.lat != null && LOCATION_COORDS.lng != null
        ? `https://www.google.com/maps?q=${LOCATION_COORDS.lat},${LOCATION_COORDS.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            ADDRESS_TEXT
          )}`;

    return { whatsappHref, emailHref, mapHref };
  }, []);

  // ✅ Save click in Supabase
  const trackClick = async (type) => {
    try {
      // Create a table: contact_clicks (id uuid, type text, page text, created_at timestamptz default now())
      await supabase.from("contact_clicks").insert([
        {
          type,
          page: "contacts",
        },
      ]);
    } catch (e) {
      // If table not created yet, clicks still work; you just won’t see counts.
      console.warn("Click track failed:", e?.message || e);
    }
  };

  // ✅ Fetch click counts
  const fetchCounts = async () => {
    try {
      const types = ["whatsapp", "email", "map"];
      const results = await Promise.all(
        types.map(async (t) => {
          const { count, error } = await supabase
            .from("contact_clicks")
            .select("*", { count: "exact", head: true })
            .eq("type", t);

          if (error) throw error;
          return [t, count || 0];
        })
      );

      const obj = Object.fromEntries(results);
      setClickCounts({
        whatsapp: obj.whatsapp ?? 0,
        email: obj.email ?? 0,
        map: obj.map ?? 0,
      });
    } catch (e) {
      console.warn("Count fetch failed:", e?.message || e);
    }
  };

  useEffect(() => {
    fetchCounts();
    // optional refresh interval:
    // const t = setInterval(fetchCounts, 15000);
    // return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("contact_forms").insert([form]);

    if (error) alert(error.message);
    else {
      alert("Message sent successfully!");
      setForm({
        parent_name: "",
        email: "",
        phone: "",
        child_age: "",
        program: "",
        message: "",
      });
    }
  };

  // ✅ Contact cards (now clickable + animated + tracked)
  const contactInfo = useMemo(
    () => [
      {
        key: "whatsapp",
        title: "WhatsApp Us",
        value: "(+91) 8899911392",
        href: links.whatsappHref,
        gradient: "from-green-400 to-green-600",
        Icon: Phone,
        openNew: true,
      },
      {
        key: "email",
        title: "Email Us",
        value: EMAIL_TO,
        href: links.emailHref,
        gradient: "from-purple-400 to-purple-600",
        Icon: Mail,
        openNew: false,
      },
      {
        key: "map",
        title: "Visit Us",
        value: ADDRESS_TEXT,
        href: links.mapHref,
        gradient: "from-pink-400 to-pink-600",
        Icon: MapPin,
        openNew: true,
      },
    ],
    [links]
  );

  return (
    <section
      id="contacts"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-purple-50/50 to-pink-50/50"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-200 to-pink-200 text-purple-700 rounded-full mb-6">
            📧 Get In Touch 📧
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Let's Start Your Child's Journey!
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-2xl text-gray-900 mb-6">Send us a message</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="parent_name"
                value={form.parent_name}
                onChange={handleChange}
                placeholder="Parent's Name"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />
              <input
                name="child_age"
                type="number"
                value={form.child_age}
                onChange={handleChange}
                placeholder="Child's Age"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />

              <select
                name="program"
                value={form.program}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              >
                <option value="">Select Program</option>
                <option>Reading & Writing</option>
                <option>Math Mastery</option>
                <option>Creative Arts</option>
                <option>Music & Rhythm</option>
                <option>Science Explorer</option>
                <option>Coding Kids</option>
                <option>All in One</option>
              </select>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Message"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none"
              />

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition"
              >
                <Send className="w-5 h-5" /> Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((item, i) => (
              <motion.a
                key={item.key}
                href={item.href}
                target={item.openNew ? "_blank" : undefined}
                rel={item.openNew ? "noopener noreferrer" : undefined}
                onClick={() => {
                  trackClick(item.key);
                  // refresh visible counts shortly after click
                  setTimeout(fetchCounts, 600);
                }}
                className="bg-white rounded-3xl p-6 shadow-lg flex items-center gap-6 cursor-pointer group"
                whileHover={{ x: 12 }}
                whileTap={{ scale: 0.98 }} // ✅ “tap” animation
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                  whileTap={{ scale: 0.9, rotate: -6 }} // ✅ small icon tap animation
                  whileHover={{ rotate: 3 }}
                >
                  <item.Icon className="w-8 h-8 text-white" />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-gray-900 font-semibold">
                      {item.title}
                    </h4>

                    {/* ✅ show click counts */}
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {item.key === "whatsapp" && clickCounts.whatsapp}
                      {item.key === "email" && clickCounts.email}
                      {item.key === "map" && clickCounts.map} clicks
                    </span>
                  </div>

                  <p className="text-gray-600 group-hover:underline">
                    {item.value}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Tap to open {item.key === "map" ? "Maps" : item.key}
                  </p>
                </div>
              </motion.a>
            ))}

            {/* (Optional) Benefits list - you had it above; adding here for completeness */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h4 className="text-gray-900 font-semibold mb-4">
                Why parents choose us
              </h4>
              <ul className="space-y-3">
                {benefits.map((b, idx) => (
                  <li key={idx} className="text-gray-600 flex items-start gap-2">
                    <span className="mt-1 w-2 h-2 rounded-full bg-purple-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Small note for exact pin */}
            {(LOCATION_COORDS.lat == null || LOCATION_COORDS.lng == null) && (
              <p className="text-xs text-gray-500">
                Note: For an exact pin location, set{" "}
                <span className="font-mono">LOCATION_COORDS.lat/lng</span> at
                the top of this file.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


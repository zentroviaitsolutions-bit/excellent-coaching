"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AnnouncementBanner() {
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("announcement, maintenance_mode")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setAnnouncement(data.announcement || "");
        setMaintenance(!!data.maintenance_mode);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return null;

  // ✅ Maintenance ON -> banner show (public pages)
  if (maintenance) {
    return (
      <div className="w-full bg-red-600 text-white text-sm py-2 px-4 text-center">
        ⚠ Website is under maintenance. Please check back soon.
      </div>
    );
  }

  // ✅ Announcement (optional)
  if (!announcement) return null;

  return (
    <div className="w-full bg-gray-900 text-white text-sm py-2 px-4 text-center">
      {announcement}
    </div>
  );
}

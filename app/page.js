"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import HeroSection from "./components/HeroSection";
import WhyChooseUs from "./components/WhyChooseUs";
import Navbar from "./components/Navbar";
import Explore from "./components/Explore";
import OurTeam from "./components/OurTeam";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import Contact from "./Contacts/page";
import Gallery from "./components/Gallery";

// ✅ Track page views in Supabase
const VIEWS_TABLE = "page_views";

function getSessionId() {
  if (typeof window === "undefined") return null;

  let sid = localStorage.getItem("ec_session_id");
  if (!sid) {
    sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("ec_session_id", sid);
  }
  return sid;
}

export default function Page() {
  const pathname = usePathname();

  useEffect(() => {
    const sid = getSessionId();
    if (!sid) return;

    // ✅ insert page view
    supabase.from(VIEWS_TABLE).insert([
      {
        path: pathname || "/",
        session_id: sid,
      },
    ]);
  }, [pathname]);

  return (
    <>
      <Navbar />

      <main className="bg-[#EFF5FF]">
        {/* HERO */}
        <header id="home">
          <HeroSection />
        </header>

        {/* ABOUT / WHY CHOOSE US */}
        <section id="about" aria-label="Why Choose Excellent Coaching in Baheri">
          <WhyChooseUs />
        </section>

        {/* PROGRAMS */}
        <section id="programs" aria-label="Coaching Programs for Kids">
          <Explore />
        </section>

        {/* COACHES */}
        <section id="coaches" aria-label="Experienced Teachers at Excellent Coaching">
          <OurTeam />
        </section>

        {/* GALLERY */}
        <section id="gallery" aria-label="Student Activities and Classroom Gallery">
          <Gallery />
        </section>

        {/* TESTIMONIALS */}
        <section
          id="testimonials"
          aria-label="Parent Testimonials About Excellent Coaching"
        >
          <Testimonials />
        </section>

        {/* CONTACT */}
        <section id="contacts" aria-label="Contact Excellent Coaching Baheri">
          <Contact />
        </section>
      </main>

      <Footer />
    </>
  );
}

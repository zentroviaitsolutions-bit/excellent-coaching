'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Linkedin, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function CoachesSection({ isPage = false }) {
  const router = useRouter();
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const fetchCoaches = async () => {
      const { data } = await supabase.from("coaches").select("*");
      setCoaches(data || []);
    };
    fetchCoaches();
  }, []);

  return (
    <section id="coaches" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading only on homepage */}
        {!isPage && (
          <div className="text-center mb-16">
            <h2 className="text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Meet Our Expert Coaches
            </h2>
          </div>
        )}


{/* image */}
     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {coaches.map((coach) => (
    <div key={coach.id} className="bg-white rounded-3xl shadow-lg overflow-hidden transition hover:shadow-2xl">

      {/* Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={coach.image_url || "/placeholder.jpg"}
          alt={coach.name}
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        </div>
      </div>

      {/* KEEP YOUR TEXT CONTENT BELOW SAME */}



              <div className="p-6">
                <h3 className="text-2xl">{coach.name}</h3>
                <p className="text-purple-600">{coach.subject}</p>
                <p className="text-sm text-gray-600">{coach.experience}</p>
                <p className="text-gray-700 text-sm">{coach.description}</p>
              </div>
            </div>
          ))}
        </div>

        {coaches.length === 0 && (
          <p className="text-center mt-10 text-gray-500">No coaches added yet</p>
        )}

        {/* BUTTON LOGIC */}
        <div className="text-center mt-16">

          {/* Homepage Button */}
          {!isPage && (
            <button
              onClick={() => router.push("/coaches")}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
            >
              Meet our Coaches →
            </button>
          )}

          {/* Coaches Page Button */}
          {isPage && (
            <button
              onClick={() => router.push("/Formtrial")}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
            >
              Start Your Free Trial →
            </button>
          )}

        </div>
      </div>
    </section>
  );
}

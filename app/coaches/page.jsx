'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Linkedin, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabaseClient";

export default function CoachesSection() {
  const router = useRouter();
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const fetchCoaches = async () => {
      const { data, error } = await supabase.from("coaches").select("*");
      if (error) console.log(error);
      else setCoaches(data || []);
    };
    fetchCoaches();
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-20">
        <section id="coaches" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16">
              <h1 className="text-5xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Meet Our Expert Coaches
              </h1>
            </div>

            {/* CENTERED GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden w-full max-w-sm"
                >
                  <div className="relative h-72">
                    <img
                      src={coach.image_url || "/placeholder.jpg"}
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>

                  <div className="p-6 text-center">
                    <h3 className="text-2xl text-gray-900">{coach.name}</h3>
                    <p className="text-purple-600 mb-2">{coach.subject}</p>
                    <p className="text-sm text-gray-600 mb-2">{coach.experience}</p>
                    <p className="text-gray-700 text-sm mb-3">{coach.description}</p>
                    <p className="text-xs text-gray-500">{coach.qualification}</p>

                    <div className="flex justify-center gap-3 mt-4">
                      <button className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <Mail className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white">
                        <Linkedin className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {coaches.length === 0 && (
              <p className="text-center mt-10 text-gray-500">No coaches added yet</p>
            )}

            {/* BUTTONS */}
            <div className="text-center mt-16 space-y-4">

              {/* <button
                onClick={() => router.push("/coaches")}
                className="px-10 py-4 bg-white border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-50 transition"
              >
                View All Coaches
              </button> */}
              

              <br />

              <button
                onClick={() => router.push("/Formtrial")}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
              >
                Start Your Free Trial →
              </button>

            </div>

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}


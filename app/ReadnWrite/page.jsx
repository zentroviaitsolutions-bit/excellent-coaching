'use client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import React from 'react'
import { Star, Menu, BookOpen, Clock, Users, Award, CircleCheckBig, Heart } from 'lucide-react'
import { useRouter } from "next/navigation";
export default function ProgramPage() {

    const router = useRouter();
  return (

    <>
    
     <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">

      {/* NAVBAR */}
     <Navbar/>

      {/* CONTENT */}
      <div className="pt-20">
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">

            {/* HERO */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                    Ages 5-12
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Reading & Writing
                </h1>

                <p className="text-xl text-gray-700 mb-8">
                  Build strong literacy skills through engaging stories and creative writing
                </p>

                <div className="flex gap-4">


                  <button
                      onClick={() => router.push("/english-game")}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:scale-105 transition cursor-pointer"
                    >
                      🎮 Play Learning Game
                    </button>
                  {/* <button
                  
                   onClick={() => router.push("/Contacts")}
                  className="px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-full">
                    Contact Us
                  </button> */}
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1549737221-bef65e2604a6"
                  alt="Reading"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-20" />
              </div>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { Icon: Clock, label: 'Duration', value: '8-12 weeks' },
                { Icon: Users, label: 'Class Size', value: 'Max 6 students' },
                { Icon: Award, label: 'Certificate', value: 'Upon completion' },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-6 shadow-lg text-center"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl text-white" />
                  <div className="text-gray-600">{label}</div>
                  <div className="text-xl text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {/* LEARNING LIST */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
              <h2 className="text-3xl md:text-4xl mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                What Your Child Will Learn
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Phonics and word recognition',
                  'Reading comprehension strategies',
                  'Creative writing and storytelling',
                  'Grammar and sentence structure',
                  'Vocabulary building',
                  'Critical thinking through literature',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CircleCheckBig className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 p-1 rounded-full text-white" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h3 className="text-2xl text-gray-900 mb-6">Ready to get started?</h3>
              <button 
              onClick={() => router.push("/Formtrial")}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg">
                Enroll in Reading & Writing →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
    <Footer/>

    </div>
    </>
   
  )
}

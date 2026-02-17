'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Code,
  Clock,
  Users,
  Award,
  CircleCheckBig,
} from 'lucide-react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CodingKids() {
  const router = useRouter()

  const learnings = [
    'Visual programming (Scratch)',
    'Game development',
    'Web development basics (HTML/CSS)',
    'JavaScript fundamentals',
    'Logic and algorithms',
    'Project-based learning',
  ]

  const benefits = [
    'Computational thinking',
    'Problem-solving skills',
    'Creativity in technology',
    'Future-ready skills',
  ]

  return (

    <>
      <div className="pt-20">
      <Navbar />

      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* HERO */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                  Ages 8–15
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Coding Kids
              </h1>

              <p className="text-xl text-gray-700 mb-8">
                Learn programming basics through games and fun coding challenges
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                      onClick={() => router.push("/coding-game")}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:scale-105 transition cursor-pointer"
                    >
                      🎮 Play Learning Game
                    </button>

                {/* <button
                  onClick={() => router.push('/Contacts')}
                  className="px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-full hover:bg-purple-50"
                >
                  Contact Us
                </button> */}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1719498828499-48b0086e5c21"
                alt="Coding Kids"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-20" />
            </div>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Stat icon={Clock} label="Duration" value="8–12 weeks" />
            <Stat icon={Users} label="Class Size" value="Max 6 students" />
            <Stat icon={Award} label="Certificate" value="Upon completion" />
          </div>

          {/* LEARNING */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
            <h2 className="text-3xl md:text-4xl mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              What Your Child Will Learn
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {learnings.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CircleCheckBig className="w-6 h-6 mt-0.5 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-full p-1" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BENEFITS */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl md:text-4xl mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Program Benefits
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg flex items-start gap-3"
                >
                  <Award className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-xl p-1.5" />
                  <span className="text-gray-800 text-lg">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl text-gray-900 mb-6">Ready to get started?</h3>
            <button
              onClick={() => router.push('/Formtrial')}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg text-lg"
            >
              Enroll in Coding Kids →
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
    </>
  
  )
}

/* Reusable Stat Component */
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-indigo-600 p-2 rounded-xl text-white" />
      <div className="text-gray-600 mb-2">{label}</div>
      <div className="text-xl text-gray-900">{value}</div>
    </div>
  )
}

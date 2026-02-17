

'use client'

import React from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'

const Explore = () => {
  const router = useRouter()

  const programs = [
    {
      title: 'Reading & Writing',
      age: 'Ages 5-12',
      desc: 'Build strong literacy skills through engaging stories and creative writing exercises',
      img: 'https://images.unsplash.com/photo-1549737221-bef65e2604a6?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-blue-400 to-blue-600',
      path: '/ReadnWrite',
    },
    {
      title: 'Math Mastery',
      age: 'Ages 6-14',
      desc: 'Make math fun with interactive problem-solving and real-world applications',
      img: 'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-purple-400 to-purple-600',
      path: '/Mathmastery',
    },
    {
      title: 'Creative Arts',
      age: 'Ages 4-12',
      desc: 'Unleash creativity through drawing, painting, and hands-on art projects',
      img: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-pink-400 to-pink-600',
      path: '/CreativeArts',
    },
    {
      title: 'Music & Rhythm',
      age: 'Ages 5-13',
      desc: 'Discover musical talents with instruments, singing, and music theory',
      img: 'https://images.unsplash.com/photo-1759844939950-7d8d9e7978fe?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-orange-400 to-orange-600',
      path: '/MusicnRhythm',
    },
    {
      title: 'Science Explorer',
      age: 'Ages 7-14',
      desc: 'Hands-on experiments and exciting discoveries in the world of science',
      img: 'https://images.unsplash.com/photo-1609422644211-a85c36ee36a7?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-green-400 to-green-600',
      path: '/Science',
    },
    {
      title: 'Coding Kids',
      age: 'Ages 8-15',
      desc: 'Learn programming basics through games and fun coding challenges',
      img: 'https://images.unsplash.com/photo-1719498828499-48b0086e5c21?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-indigo-400 to-indigo-600',
      path: '/Coding',
    },
  ]

  return (

    <>
    <Navbar/>
      <section
      id="programs"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgb(147, 51, 234) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-700 rounded-full mb-6">
            🎯 Our Programs 🎯
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Explore Our Coaching Programs
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Every child is unique, and so are our programs. Choose what excites
            your child the most!
          </p>
        </div>

        {/* Grid */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="group relative"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-40`}
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm">
                      {item.age}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{item.desc}</p>

                  <button
                    onClick={() => router.push(item.path)}
                    className={`w-full py-3 bg-gradient-to-r ${item.gradient} text-white rounded-full transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                  >
                    Learn More →
                  </button>
                </div>

                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
 
    </>
   
   
 
   
  )
}

export default Explore

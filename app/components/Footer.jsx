'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react'

const float = {
  animate: { y: [0, -20, 0], rotate: [0, 15, -15, 0] },
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
}

const Footer = () => {
  const [email, setEmail] = useState("")

  const handleSubscribe = () => {
    if (!email) {
      alert("Please enter your email first 😊")
      return
    }

    alert("Thanks for subscribing! Follow us on social media for updates 🎉")

    window.open("https://instagram.com/excellentcoaching", "_blank")
    window.open("https://youtube.com/@excellentcoaching", "_blank")
    window.open("https://facebook.com/excellentcoaching", "_blank")
  }

  const floatingIcons = [
    { Icon: Star, left: '65%', top: '82%' },
    { Icon: Heart, left: '12%', top: '99%' },
    { Icon: Star, left: '26%', top: '12%' },
    { Icon: Heart, left: '15%', top: '33%' },
    { Icon: Star, left: '82%', top: '3%' },
    { Icon: Heart, left: '14%', top: '36%' },
    { Icon: Star, left: '21%', top: '30%' },
    { Icon: Heart, left: '34%', top: '99%' },
    { Icon: Star, left: '64%', top: '67%' },
    { Icon: Heart, left: '89%', top: '19%' },
    { Icon: Star, left: '89%', top: '96%' },
    { Icon: Heart, left: '6%', top: '75%' },
    { Icon: Star, left: '13%', top: '60%' },
    { Icon: Heart, left: '8%', top: '11%' },
    { Icon: Star, left: '93%', top: '51%' },
  ]

  return (
    <footer className='bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white relative overflow-hidden'>

      {/* Floating icons */}
      <div className='absolute inset-0 pointer-events-none opacity-20'>
        {floatingIcons.map(({ Icon, left, top }, i) => (
          <motion.div key={i} className='absolute' style={{ left, top }} {...float}>
            <Icon className='w-6 h-6 fill-white text-white' />
          </motion.div>
        ))}
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10'>

        {/* TOP GRID */}
        <div className='grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12'>

          {/* Brand */}
          <div className='lg:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <img src="/logo.jpeg" alt="Excellent Coaching Logo" className="w-12 h-12 object-contain" />
              <span className='text-3xl font-semibold'>Excellent Coaching</span>
            </div>

            <p className='text-purple-200 mb-6 max-w-sm'>
              Empowering children to reach their full potential through engaging, personalized coaching programs.
            </p>

            {/* Social Icons */}
            <div className='flex gap-3'>
              {[
                { Icon: Facebook, link: "https://www.facebook.com/moizhar.jafri" },
                { Icon: Instagram, link:"https://www.instagram.com/maths_tricks92/" },
                // { Icon: Twitter, link: "https://twitter.com/excellentcoach" },
                { Icon: Youtube, link: "https://www.youtube.com/@MyYoutubeSir" },
              ].map(({ Icon, link }, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all'
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            {
              title: 'Programs',
              links: [
                { name: 'Reading & Writing', href: '/#programs' },
                { name: 'Math Mastery', href: '/#programs' },
                { name: 'Creative Arts', href: '/#programs' },
                { name: 'Music & Rhythm', href: '/#programs' },
                { name: 'Science Explorer', href: '/#programs' },
                { name: 'Coding Kids', href: '/#programs' },
              ],
            },
            {
              title: 'Company',
              links: [
                { name: 'About Us', href: '/#about' },
                { name: 'Our Coaches', href: '/#coaches' },
                { name: 'Testimonials', href: '/#testimonials' },
                { name: 'Blog', href: '#' },
                { name: 'Careers', href: '/career' },
              ],
            },
            {
              title: 'Support',
              links: [
                { name: 'Contact Us', href: '/#contacts' },
                { name: 'FAQ', href: '/#' },
                { name: 'Privacy Policy', href: '/#' },
                { name: 'Terms of Service', href: '/#' },
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className='text-xl mb-4'>{col.title}</h4>
              <ul className='space-y-2'>
                {col.links.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.href} className='text-purple-200 hover:text-yellow-400 transition-colors'>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div> {/* ✅ GRID CLOSED */}

        {/* Newsletter */}
        <div className='bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-12'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div>
              <h4 className='text-2xl mb-2'>Join Our Newsletter! 📬</h4>
              <p className='text-purple-200'>
                Get tips, updates, and special offers for your child’s learning journey.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                className='flex-1 px-6 py-3 rounded-full bg-white/90 text-gray-900 outline-none'
              />
              <button
                onClick={handleSubscribe}
                className='px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full hover:scale-105 transition'
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className='pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-purple-200 text-center md:text-left'>
            © {new Date().getFullYear()} Excellent Coaching. All rights reserved.
          </p>

          <div className='flex gap-6 text-purple-200'>
            <a href='/privacy' className='hover:text-yellow-400'>Privacy</a>
            <a href='/terms' className='hover:text-yellow-400'>Terms</a>
            <a href='/cookies' className='hover:text-yellow-400'>Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer

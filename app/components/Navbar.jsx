'use client'

import React, { useState } from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter, usePathname } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Programs', id: 'programs' },
    { name: 'Coaches', id: 'coaches' },
    { name: 'Gallery', id: 'gallery' }, // scroll section
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'Contact', id: 'contacts' },
    { name: 'AI Teacher', id: 'aiteacher', isPage: true }, // 🔥 PAGE LINK
  ]

  const handleNavClick = (link) => {
    setIsOpen(false)

    // ✅ AI Teacher page
    if (link.isPage && link.id === "aiteacher") {
      router.push('/aiteacher')
      return
    }

    // ✅ If already on homepage → scroll
    if (pathname === '/') {
      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
    }
    // ✅ If on another page → go home then scroll
    else {
      router.push(`/#${link.id}`)
    }
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          
          {/* Logo */}
          <div
            className='flex items-center space-x-3 cursor-pointer'
            onClick={() => router.push('/')}
          >
            <img
              src="/logo.jpeg"
              alt="Excellent Coaching Logo"
              className="w-12 h-12 object-contain"
            />
            <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Excellent Coaching
            </span>
          </div>

          {/* Desktop Nav */}
          <motion.ul className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link, idx) => (
              <motion.li
                key={idx}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(link)}
                className='cursor-pointer text-gray-700 hover:text-purple-600 font-medium transition-colors'
              >
                {link.name}
              </motion.li>
            ))}

            <motion.button
              className='px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md'
              onClick={() => router.push('/Formtrial')}
            >
              Get Started
            </motion.button>
          </motion.ul>

          {/* Mobile Button */}
          <div className='md:hidden'>
            <button onClick={() => setIsOpen(!isOpen)} className='text-gray-700 p-2'>
              <Menu className='w-6 h-6' />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div className='md:hidden bg-white border-t border-gray-100'>
          <div className='p-4 space-y-4 flex flex-col'>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className='text-left text-gray-700 hover:text-purple-600 font-medium py-2'
              >
                {link.name}
              </button>
            ))}

            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/Formtrial')
              }}
              className='w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md'
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar

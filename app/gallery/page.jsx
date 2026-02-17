'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import Gallery from '@/app/components/Gallery'
import { ArrowLeft } from 'lucide-react'

export default function GalleryPage() {
  const router = useRouter()

  return (
    <>
      <Navbar />

      <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">

        {/* Header */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Memories Gallery
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beautiful moments, learning experiences, and joyful activities from our coaching journey.
          </p>
        </div>

        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-2 bg-white shadow-md rounded-full hover:shadow-lg hover:scale-105 transition text-purple-600 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>

        {/* Gallery */}
       <Gallery isPage />

      </div>

      <Footer />
    </>
  )
}


'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Testimonials() {
  const [data, setData] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchTestimonials()

    const channel = supabase
      .channel('live-testimonials')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        fetchTestimonials
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('id', { ascending: false })

    setData(data || [])
  }

  return (
    <section id="testimonials" className="py-24 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-purple-600">💬 Parent Testimonials</h2>

        <button
          onClick={() => router.push('/share-testimonial')}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          ➕ Add Your Testimonial
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {data.map(t => (
          <div key={t.id} className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="mb-3">{"⭐".repeat(t.rating)}</div>
            <p className="italic mb-4">“{t.message}”</p>
            <div className="flex items-center gap-4">
              <img src={t.image_url || '/placeholder.jpg'} className="w-14 h-14 rounded-full object-cover"/>
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


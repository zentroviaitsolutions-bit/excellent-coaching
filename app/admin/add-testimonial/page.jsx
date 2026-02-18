'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from "@/app/components/AdminBackButton";


export default function AddTestimonialAdmin() {
  const [form, setForm] = useState({
    name: '',
    role: '',
    message: '',
    rating: 5,
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let image_url = ''

    // Upload image if selected
    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      const { error: uploadError } = await supabase.storage
        .from('testimonials-images')
        .upload(fileName, image)

      if (uploadError) {
        alert(uploadError.message)
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from('testimonials-images')
        .getPublicUrl(fileName)

      image_url = data.publicUrl
    }

    // 🔥 ADMIN POSTS ARE ALWAYS APPROVED
    const { error } = await supabase.from('testimonials').insert([
      { ...form, image_url, approved: true }
    ])

    if (error) alert(error.message)
    else alert('Testimonial published instantly 🎉')

    setForm({ name:'', role:'', message:'', rating:5 })
    setImage(null)
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">

         <AdminBackButton />

        <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
          <h2 className="text-3xl mb-6 text-center font-bold text-purple-600">
            Sorry this service is not available yet 
          </h2>
          

          {/* <form onSubmit={handleSubmit} className="space-y-5">
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded-xl"
              required
            />

            <input
              placeholder="Role"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full p-3 border rounded-xl"
              required
            />

            <textarea
              placeholder="Message"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full p-3 border rounded-xl"
              required
            />

            <select
              value={form.rating}
              onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
              className="w-full p-3 border rounded-xl"
            >
              {[5,4,3,2,1].map(n => <option key={n}>{n}</option>)}
            </select>

            <input type="file" onChange={e => setImage(e.target.files[0])} />

            <button
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
            >
              {loading ? 'Publishing...' : 'Publish Testimonial'}
            </button>
          </form> */}
        </div>
      </div>

      
    </>
  )
}



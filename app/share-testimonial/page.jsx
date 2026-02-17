'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ShareTestimonial() {
  const [form, setForm] = useState({ name:'', role:'', message:'', rating:5 })
  const [image, setImage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    let image_url = ''
    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      await supabase.storage.from('testimonials-images').upload(fileName, image)
      const { data } = supabase.storage.from('testimonials-images').getPublicUrl(fileName)
      image_url = data.publicUrl
    }

    await supabase.from('testimonials').insert([
      { ...form, image_url, approved:false }
    ])

    alert("Submitted! update it shortly ❤️")
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl space-y-4 w-full max-w-xl">
        <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-3 border rounded-xl"/>
        <input placeholder="Role" onChange={e=>setForm({...form,role:e.target.value})} className="w-full p-3 border rounded-xl"/>
        <textarea placeholder="Message" onChange={e=>setForm({...form,message:e.target.value})} className="w-full p-3 border rounded-xl"/>
        <select onChange={e=>setForm({...form,rating:Number(e.target.value)})} className="w-full p-3 border rounded-xl">
          {[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}
        </select>
        <input type="file" onChange={e=>setImage(e.target.files[0])}/>
        <button className="w-full py-3 bg-purple-600 text-white rounded-xl cursor-pointer">Submit</button>
      </form>
    </div>
  )
}


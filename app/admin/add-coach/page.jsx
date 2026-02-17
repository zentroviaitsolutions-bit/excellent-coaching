'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from "@/app/components/AdminBackButton";



export default function AddCoach() {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    qualification: '',
    experience: '',
    description: ''
  })

  const [imageFile, setImageFile] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = ''

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`

      const { error: uploadError } = await supabase
        .storage
        .from('coach-images')
        .upload(fileName, imageFile)

      if (uploadError) return alert(uploadError.message)

      const { data } = supabase
        .storage
        .from('coach-images')
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('coaches').insert([{
      ...form,
      image_url: imageUrl
    }])

    if (error) alert(error.message)
    else {
      alert('Coach Added!')
      setForm({ name: '', subject: '', qualification: '', experience: '', description: '' })
      setImageFile(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 flex justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4">

          

        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-2xl">
         <AdminBackButton />
         
          <h2 className="text-4xl text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add New Coach
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input name="name" placeholder="Coach Name" onChange={handleChange} required className="input mr-4" />
            <input name="subject" placeholder="Subject" onChange={handleChange} className="input" />
            <input name="qualification" placeholder="Qualification" onChange={handleChange} className="input mr-4 " />
            <input name="experience" placeholder="Experience" onChange={handleChange} className="input" />
            <textarea name="description" placeholder="Description" onChange={handleChange} className="input" />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full"
            />

            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition duration-300">
  Add Coach
</button>

          </form>
        </div>
      </div>
    </>
  )
}


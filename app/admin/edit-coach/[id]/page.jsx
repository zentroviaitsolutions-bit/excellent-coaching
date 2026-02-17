'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from "../../components/AdminBackButton";


export default function EditCoach() {
  const { id } = useParams()
  const router = useRouter()

  const [coach, setCoach] = useState({
    name: '',
    subject: '',
    experience: '',
    image_url: '',
  })

  const [newImage, setNewImage] = useState(null)

  // 🔥 Load coach data
  useEffect(() => {
    const fetchCoach = async () => {
      const { data } = await supabase.from('coaches').select('*').eq('id', id).single()
      if (data) setCoach(data)
    }
    fetchCoach()
  }, [id])

  // 🔥 Handle input change
  const handleChange = (e) => {
    setCoach({ ...coach, [e.target.name]: e.target.value })
  }

  // 🔥 Upload new image
  const uploadImage = async () => {
    if (!newImage) return coach.image_url

    const fileName = `${Date.now()}-${newImage.name}`

    const { error } = await supabase.storage
      .from('coach-images')
      .upload(fileName, newImage)

    if (error) {
      alert(error.message)
      return coach.image_url
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/coach-images/${fileName}`
  }

  // 🔥 Update coach
  const handleUpdate = async (e) => {
    e.preventDefault()

    const imageUrl = await uploadImage()

    const { error } = await supabase
      .from('coaches')
      .update({
        name: coach.name,
        subject: coach.subject,
        experience: coach.experience,
        image_url: imageUrl,
      })
      .eq('id', id)

    if (error) alert(error.message)
    else {
      alert('Coach Updated!')
      router.push('/admin/manage-coaches')
    }
  }

  return (
    <>
      <Navbar />

      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex justify-center">

          <AdminBackButton />

        <form
          onSubmit={handleUpdate}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-xl"
        >
          <h1 className="text-3xl mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Coach
          </h1>

          <input
            type="text"
            name="name"
            value={coach.name}
            onChange={handleChange}
            placeholder="Coach Name"
            className="w-full p-3 border rounded-xl mb-4"
          />

          <input
            type="text"
            name="subject"
            value={coach.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full p-3 border rounded-xl mb-4"
          />

          <input
            type="text"
            name="experience"
            value={coach.experience}
            onChange={handleChange}
            placeholder="Experience"
            className="w-full p-3 border rounded-xl mb-4"
          />

          <input
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
            className="w-full p-3 border rounded-xl mb-4"
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
          >
            Update Coach
          </button>
        </form>
      </div>
    </>
  )
}

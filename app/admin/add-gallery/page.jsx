'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from '@/app/components/AdminBackButton'


export default function AddGallery() {
  const [title, setTitle] = useState('')
  const [eventName, setEventName] = useState('')
  const [type, setType] = useState('image')
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    let mediaUrl = ''

    if (type === 'image') {
      if (!file) return alert('Select image')

      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase
        .storage
        .from('gallery-media')
        .upload(fileName, file)

      if (uploadError) return alert(uploadError.message)

      const { data } = supabase.storage.from('gallery-media').getPublicUrl(fileName)
      mediaUrl = data.publicUrl
    }

    if (type === 'video') {
      if (!videoUrl) return alert('Enter YouTube link')
      mediaUrl = videoUrl
    }

    const { error } = await supabase.from('gallery').insert([{
      title,
      event_name: eventName,
      media_url: mediaUrl,
      type
    }])

    if (error) alert(error.message)
    else {
      alert('Gallery item added!')
      setTitle('')
      setEventName('')
      setFile(null)
      setVideoUrl('')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 flex justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4">
   
        

        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-2xl">

        <AdminBackButton />

          <h2 className="text-4xl text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add Gallery Item
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

           <input
  placeholder="Title"
  value={title}
  onChange={e => setTitle(e.target.value)}
  className="input mb-4 mr-4"
/>

<input
  placeholder="Event Name"
  value={eventName}
  onChange={e => setEventName(e.target.value)}
  className="input"
/>


            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300">
              <option value="image">Image</option>
              <option value="video">YouTube Video</option>
            </select>

            {type === 'image' && (
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            )}

            {type === 'video' && (
              <input placeholder="Paste YouTube Link" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="input" />
            )}

            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition duration-300">
  Add
</button>

          </form>
        </div>
      </div>
    </>
  )
}

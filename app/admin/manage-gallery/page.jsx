'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from "../../components/AdminBackButton";


export default function ManageGallery() {
  const [items, setItems] = useState([])

  const fetchItems = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const deleteItem = async (item) => {
    if (!confirm('Delete this gallery item?')) return

    // Remove image from storage
    if (item.type === 'image' && item.media_url) {
      const path = item.media_url.split('/gallery-media/')[1]
      if (path) {
        await supabase.storage.from('gallery-media').remove([path])
      }
    }

    // Remove DB row
    await supabase.from('gallery').delete().eq('id', item.id)
    fetchItems()
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <AdminBackButton />
        <h1 className="text-4xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Manage Gallery
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">

              {item.type === 'image' ? (
                <img src={item.media_url} className="w-full h-56 object-cover" />
              ) : (
                <div className="h-56 flex items-center justify-center bg-black text-white">
                  Video Item
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xl">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.event_name}</p>

                <button
                  onClick={() => deleteItem(item)}
                  className="mt-4 w-full py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Delete Item
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

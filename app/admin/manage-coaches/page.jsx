'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import { useRouter } from 'next/navigation'   // ✅ ADDED
import AdminBackButton from "../../components/AdminBackButton";


export default function ManageCoaches() {
  const [coaches, setCoaches] = useState([])
  const router = useRouter()   // ✅ ADDED

  const fetchCoaches = async () => {
    const { data } = await supabase.from('coaches').select('*')
    setCoaches(data || [])
  }

  useEffect(() => {
    fetchCoaches()
  }, [])

  const deleteCoach = async (coach) => {
    if (!confirm('Delete this coach?')) return

    // Delete image from storage if exists
    if (coach.image_url) {
      const path = coach.image_url.split('/coach-images/')[1]
      if (path) {
        await supabase.storage.from('coach-images').remove([path])
      }
    }

    // Delete from database
    const { error } = await supabase.from('coaches').delete().eq('id', coach.id)

    if (error) alert(error.message)
    else {
      alert('Coach deleted!')
      fetchCoaches()
    }
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">

        <AdminBackButton />

        <h1 className="text-4xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Manage Coaches
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {coaches.map(coach => (
            <div key={coach.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition">

              <img
                src={coach.image_url || '/placeholder.jpg'}
                className="w-full h-56 object-cover"
                alt={coach.name}
              />

              <div className="p-6">
                <h3 className="text-2xl text-gray-900">{coach.name}</h3>
                <p className="text-purple-600">{coach.subject}</p>
                <p className="text-sm text-gray-600">{coach.experience}</p>

                {/* DELETE */}
                <button
                  onClick={() => deleteCoach(coach)}
                  className="mt-4 w-full py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Delete Coach
                </button>

                {/* EDIT */}
                <button
                  onClick={() => router.push(`/admin/edit-coach/${coach.id}`)}
                  className="mt-2 w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  Edit Coach
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

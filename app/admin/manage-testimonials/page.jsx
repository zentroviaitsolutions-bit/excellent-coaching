'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/components/Navbar'
import AdminBackButton from '@/app/components/AdminBackButton'

export default function ManageTestimonials() {
  const [data, setData] = useState([])
  const [editing, setEditing] = useState(null)

  const fetchData = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('id', { ascending: false })

    setData(data || [])
  }

  useEffect(() => { fetchData() }, [])

  const approveItem = async (id) => {
    await supabase.from('testimonials').update({ approved: true }).eq('id', id)
    fetchData()
  }

  const deleteItem = async (id) => {
    if (!confirm("Delete this testimonial?")) return
    await supabase.from('testimonials').delete().eq('id', id)
    fetchData()
  }

  const saveEdit = async () => {
    await supabase
      .from('testimonials')
      .update({
        name: editing.name,
        role: editing.role,
        message: editing.message,
        rating: editing.rating,
      })
      .eq('id', editing.id)

    setEditing(null)
    fetchData()
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <AdminBackButton />
        <h1 className="text-4xl text-center mb-12">Manage Testimonials</h1>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {data.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-lg">

              {editing?.id === item.id ? (
                <>
                  <input
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full p-2 border rounded mb-2  "
                  />
                  <input
                    value={editing.role}
                    onChange={e => setEditing({ ...editing, role: e.target.value })}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <textarea
                    value={editing.message}
                    onChange={e => setEditing({ ...editing, message: e.target.value })}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="number"
                    value={editing.rating}
                    onChange={e => setEditing({ ...editing, rating: e.target.value })}
                    className="w-full p-2 border rounded mb-2 "
                  />

                  <button onClick={saveEdit} className="px-4 py-2 bg-blue-500 text-white rounded-xl mr-2 cursor-pointer">Save</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-400 text-white rounded-xl cursor-pointer">Cancel</button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.role}</p>
                  <p className="mt-2">{item.message}</p>
                  <p>⭐ {item.rating}/5</p>

                  <p className={`mt-2 font-semibold ${item.approved ? "text-green-600" : "text-orange-500"}`}>
                    {item.approved ? "Approved" : "Pending"}
                  </p>

                  {!item.approved && (
                    <button onClick={() => approveItem(item.id)} className="mt-2 mr-2 px-4 py-2 bg-green-500 text-white rounded-xl cursor-pointer">
                      Approve
                    </button>
                  )}

                  <button onClick={() => setEditing(item)} className="mt-2 mr-2 px-4 py-2 bg-blue-500 text-white rounded-xl cursor-pointer">
                    Edit
                  </button>

                  <button onClick={() => deleteItem(item.id)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl cursor-pointer">
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}


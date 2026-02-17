'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../components/Navbar'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    fetchLeaders()

    // 🔥 REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_leaderboard' },
        () => fetchLeaders()   // refresh when score inserted
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLeaders = async () => {
    const { data } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(70)

    setLeaders(data || [])
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 pt-24 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-4xl text-center mb-8">🏆 Players</h1>

          {leaders.map((s, i) => (
            <div key={s.id} className="flex justify-between p-4 border-b animate-fadeIn">
              <div>#{i+1} {s.name}</div>
              <div>Class {s.class}</div>
              <div className="font-bold text-purple-600">{s.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

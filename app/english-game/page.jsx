'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

/* ---------------- Helpers ---------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const normName = (s) => (s || '').trim().toLowerCase()

// ✅ normalize sentence to avoid "right but showing wrong" (spaces/punctuation/case)
const normalizeSentence = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^\w\s']/g, '') // remove punctuation (keep apostrophe)
    .replace(/\s+/g, ' ')
    .trim()

// ✅ Local YYYY-MM-DD (prevents UTC date bug)
const getLocalISODate = (date = new Date()) => {
  const d = new Date(date)
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0]
}

// ✅ Monday of current week in LOCAL date (YYYY-MM-DD)
const getMondayLocal = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return getLocalISODate(monday)
}

export default function EnglishGame() {
  const router = useRouter()

  const correctSound = useRef(null)
  const wrongSound = useRef(null)

  const [step, setStep] = useState('start') // start | game | result

  // ✅ Typing-master style name selection
  const [nameInput, setNameInput] = useState('')
  const [cls, setCls] = useState(1)
  const [players, setPlayers] = useState([]) // names this week

  // game state
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState([])

  const [score, setScore] = useState(0)
  const scoreRef = useRef(0) // ✅ fixes async score bug

  const [timeLeft, setTimeLeft] = useState(20)
  const [loading, setLoading] = useState(false)

  const [leaders, setLeaders] = useState([])
  const [champions, setChampions] = useState([])

  const [isPortrait, setIsPortrait] = useState(false)

  // week keys
  const weekStart = useMemo(() => getMondayLocal(), [])
  const today = useMemo(() => getLocalISODate(), [])

  /* ---------------- Orientation ---------------- */
  useEffect(() => {
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth)
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  /* ---------------- Audio + initial fetch ---------------- */
  useEffect(() => {
    const safeAudio = (src) => {
      const a = new Audio(src)
      a.play = (() => {
        const o = a.play.bind(a)
        return () => o().catch(() => {})
      })()
      return a
    }
    correctSound.current = safeAudio('/sounds/correct.mp3')
    wrongSound.current = safeAudio('/sounds/wrong.mp3')

    fetchPlayers()
    fetchLeaders()
    fetchChampions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    if (step !== 'game') return
    if (timeLeft === 0) {
      nextQuestion()
      return
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, step])

  /* ---------------- DB fetchers ---------------- */
  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('name')
      .eq('game', 'english')
      .eq('week_start', weekStart)
      .order('name', { ascending: true })
      .limit(500)

    if (error) {
      console.log('fetchPlayers error:', error)
      setPlayers([])
      return
    }

    const unique = Array.from(new Set((data || []).map((r) => r.name).filter(Boolean)))
    setPlayers(unique)
  }

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('game', 'english')
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .limit(200)

    if (error) {
      console.log('fetchLeaders error:', error)
      setLeaders([])
      return
    }

    setLeaders(data || [])
  }

  const fetchChampions = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('game', 'english')
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .limit(3)

    if (error) {
      console.log('fetchChampions error:', error)
      setChampions([])
      return
    }

    setChampions(data || [])
  }

  /* ---------------- Name selection list ---------------- */
  const pickPlayer = (p) => setNameInput(p)

  const filteredPlayers = useMemo(() => {
    const q = normName(nameInput)
    if (!q) return players.slice(0, 30)
    return players.filter((p) => p.includes(q)).slice(0, 30)
  }, [players, nameInput])

  /* ---------------- Start game ---------------- */
  const startGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)

    if (!cleanName) return alert('Type your name or select from list')
    if (!cleanCls || cleanCls < 1 || cleanCls > 9) return alert('Class should be 1-9')

    // ✅ daily lock check BEFORE generating
    const { data: rows, error: selErr } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', 'english')
      .eq('week_start', weekStart)
      .limit(1)

    if (selErr) {
      console.log('start daily check error:', selErr)
      alert(`DB error: ${selErr.message}`)
      return
    }

    const existing = rows?.[0]
    if (existing?.last_played === today) {
      alert('You already played today! Come tomorrow 🌞')
      setStep('result')
      return
    }

    try {
      setLoading(true)

      setScore(0)
      scoreRef.current = 0
      setCurrent(0)
      setSelected([])
      setTimeLeft(20)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: cleanName, classLevel: cleanCls }),
      })

      const data = await res.json()
      if (!res.ok || !Array.isArray(data)) throw new Error('AI generate failed')

      const qs = data
        .map((q) => ({
          answer: q.answer,
          words: shuffle(q.words || []),
        }))
        .filter((q) => q.answer && Array.isArray(q.words) && q.words.length)

      if (!qs.length) throw new Error('No questions')

      setQuestions(qs)
      setStep('game')
    } catch (e) {
      console.log('startGame error:', e)
      alert('AI failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Game actions ---------------- */
  const addWord = (w) => !selected.includes(w) && setSelected((prev) => [...prev, w])
  const removeWord = (i) => setSelected((prev) => prev.filter((_, idx) => idx !== i))

  const nextQuestion = () => {
    setSelected([])
    setTimeLeft(30)
    if (current + 1 < questions.length) setCurrent((c) => c + 1)
    else finishGame()
  }

  // ✅ FIXED answer checker (no false wrong)
  const checkAnswer = () => {
    const q = questions[current]

    const user = normalizeSentence(selected.join(' '))
    const ans = normalizeSentence(q.answer)

    const correct = user === ans

    if (correct) {
      correctSound.current?.play()
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      wrongSound.current?.play()
      // optional debug:
      // console.log('WRONG -> user:', user, 'answer:', ans, 'rawAns:', q.answer)
    }

    nextQuestion()
  }

  /* ---------------- Save weekly score (daily lock) ---------------- */
  const finishGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)
    const finalScore = Number(scoreRef.current || 0)

    const { data, error: selErr } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', 'english')
      .eq('week_start', weekStart)
      .limit(1)

    if (selErr) {
      console.log('finish select error:', selErr)
      alert(`DB error: ${selErr.message}`)
      setStep('result')
      return
    }

    const existing = data?.[0]

    if (existing?.last_played === today) {
      alert('You already played today! Come tomorrow 🌞')
      setStep('result')
      return
    }

    if (existing) {
      const newScore = Number(existing.score || 0) + finalScore

      const { error: updErr } = await supabase
        .from('weekly_leaderboard')
        .update({ score: newScore, last_played: today })
        .eq('id', existing.id)

      if (updErr) {
        console.log('update error:', updErr)
        alert(`Update failed: ${updErr.message}`)
      }
    } else {
      const { error: insErr } = await supabase.from('weekly_leaderboard').insert([
        {
          name: cleanName,
          class: cleanCls,
          score: finalScore,
          last_played: today,
          week_start: weekStart,
          game: 'english',
        },
      ])

      if (insErr) {
        console.log('insert error:', insErr)
        alert(`Insert failed: ${insErr.message}`)
      }
    }

    await fetchPlayers()
    await fetchLeaders()
    await fetchChampions()

    setStep('result')
  }

  /* ---------------- Screens ---------------- */
  if (step === 'start') {
    return (
      <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover flex items-center justify-center p-6 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-5 left-5 bg-yellow-500 text-black px-4 py-2 rounded-xl shadow-lg"
        >
          🏠 Home
        </button>

        <button
          onClick={() => router.push('/leaderboard')}
          className="absolute top-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg"
        >
          🏆 Leaderboard
        </button>

        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
          {/* Start panel */}
          <div className="bg-white/95 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-extrabold mb-2">🌳 Forest Sentence Game</h2>
            <p className="text-sm text-gray-600 mb-5">
              Select your name like Typing Master. If not found, type new name and start.
              <br />
              <b>One play per day</b> and weekly score adds automatically.
            </p>

            <label className="text-sm font-semibold">Name</label>
            <input
              className="w-full p-3 mt-1 mb-3 border rounded-xl"
              placeholder="Search name (e.g. Dolly)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />

            <label className="text-sm font-semibold">Class (1-9)</label>
            <input
              className="w-full p-3 mt-1 mb-5 border rounded-xl"
              type="number"
              min={1}
              max={9}
              value={cls}
              onChange={(e) => setCls(parseInt(e.target.value || '1', 10))}
            />

            <button
              className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-xl w-full font-bold"
              onClick={startGame}
              disabled={loading}
            >
              {loading ? 'Generating Questions...' : 'Start'}
            </button>

            <div className="mt-4 text-xs text-gray-600">
              Week Start: <b>{weekStart}</b> | Today: <b>{today}</b>
            </div>
          </div>

          {/* Player list + Champions preview */}
          <div className="bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white">
            <h3 className="text-xl font-bold mb-2">👥 Players (This Week)</h3>
            <p className="text-sm text-white/80 mb-4">Click your name to select.</p>

            <div className="max-h-[320px] overflow-y-auto pr-2">
              {filteredPlayers.length === 0 ? (
                <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl">
                  No name found. Type a new name and start.
                </div>
              ) : (
                filteredPlayers.map((p) => (
                  <button
                    key={p}
                    onClick={() => pickPlayer(p)}
                    className="w-full text-left bg-black/30 hover:bg-black/40 transition p-3 rounded-xl mb-2"
                  >
                    {p}
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 bg-black/30 rounded-2xl p-4">
              <div className="font-bold mb-2">🥇 This Week Champions</div>
              {champions.length === 0 ? (
                <div className="text-sm text-white/80">No champions yet</div>
              ) : (
                champions.map((c, i) => (
                  <div key={c.id} className="text-sm">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name} ({c.score})
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover flex items-center justify-center p-6">
        <div className="bg-white/95 p-10 rounded-3xl shadow-xl text-center w-full max-w-lg">
          <h2 className="text-3xl font-extrabold mb-2">✅ Finished!</h2>
          <p className="text-lg mb-4">
            Score Today: <b>{score}</b> / {questions.length}
          </p>

          <div className="text-sm text-gray-600 mb-6">
            Weekly score is updated automatically. Come tomorrow to play again 🌞
          </div>

          <div className="flex gap-3 justify-center">
            <button className="bg-gray-800 text-white px-5 py-3 rounded-xl" onClick={() => setStep('start')}>
              Back
            </button>
            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl" onClick={() => router.push('/leaderboard')}>
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="relative">
      {isPortrait && (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center text-center p-6 z-50">
          <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
          <h2 className="text-2xl font-bold mb-2">Rotate Your Device</h2>
          <p>This game works best in landscape mode.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-screen bg-[url('/gamebg.png')] bg-cover p-6">
        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🏆 Leaderboard</h3>
          <div className="text-xs text-white/70 text-center mb-3">Week: {weekStart}</div>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {leaders.length === 0 ? (
              <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No scores yet</div>
            ) : (
              leaders.map((l, i) => (
                <div
                  key={l.id}
                  className="bg-black/30 p-2 rounded-xl mb-2 flex justify-between gap-2 text-sm items-center"
                >
                  <span>
                    {i + 1}. {l.name}
                  </span>
                  <span className="text-white/80">
                    ({l.class}) {l.score}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Game */}
        <div className="lg:col-span-2 bg-white/95 rounded-2xl p-6 shadow text-center">
          <h2 className="text-xl font-bold mb-2">Arrange the Sentence</h2>
          <p className="mb-4">⏱ {timeLeft}s</p>

          <div className="mb-4 flex flex-wrap justify-center">
            {q.words.map((w, i) => (
              <button
                key={i}
                onClick={() => addWord(w)}
                className="m-2 px-3 py-2 bg-amber-600 text-white rounded-xl"
              >
                {w}
              </button>
            ))}
          </div>

          <div className="mb-4 min-h-[60px] flex flex-wrap justify-center gap-2 p-2 border rounded-xl">
            {selected.map((w, i) => (
              <span
                key={i}
                onClick={() => removeWord(i)}
                className="px-2 py-1 bg-green-600 text-white rounded-xl break-words cursor-pointer"
              >
                {w}
              </span>
            ))}
          </div>

          <button onClick={checkAnswer} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
            Submit
          </button>

          <div className="mt-4 text-sm text-gray-700">
            Score Today: <b>{score}</b>
          </div>
        </div>

        {/* Champions */}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🥇 Weekly Champions</h3>
          <div className="text-xs text-white/70 text-center mb-3">Top 3</div>

          {champions.length === 0 ? (
            <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No champions yet</div>
          ) : (
            champions.map((c, i) => (
              <div key={c.id} className="bg-black/30 p-3 rounded-xl mb-2 text-sm">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name}
                <div className="text-white/70">Score: {c.score}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}







// this code is   for stop the weekly cleanup cron job in supabase,
//  which is responsible for clearing the weekly leaderboard data every week. 
//  By unscheduling it, you can prevent the automatic deletion of the leaderboard data,
//   allowing you to keep the records intact for a longer period of time.


// select cron.unschedule('weekly-score-cleanup');






'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

/* ------------------------ HELPERS ------------------------ */
const normName = (s) => (s || '').trim().toLowerCase()
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

const getLocalISODate = (date = new Date()) => {
  const d = new Date(date)
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0]
}

const getMondayLocal = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return getLocalISODate(monday)
}

const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = (arr) => arr[randInt(0, arr.length - 1)]

/* ------------------------ CODE ENGINE ------------------------ */
const codePuzzlesByClass = (cls) => {
  const c = Number(cls)

  // 1–3: sequence
  if (c <= 3) {
    return [
      {
        title: 'Print Hello',
        correct: ['print("Hello")'],
      },
      {
        title: 'Print two lines',
        correct: ['print("Hi")', 'print("Bye")'],
      },
      {
        title: 'Make a simple message',
        correct: ['msg = "Good Morning"', 'print(msg)'],
      },
    ]
  }

  // 4–6: loops
  if (c <= 6) {
    return [
      {
        title: 'Print 1 to 3',
        correct: ['for i in range(1, 4):', '  print(i)'],
      },
      {
        title: 'Print Hello 3 times',
        correct: ['for i in range(3):', '  print("Hello")'],
      },
      {
        title: 'Sum of 1..3',
        correct: ['sum = 0', 'for i in range(1, 4):', '  sum = sum + i', 'print(sum)'],
      },
    ]
  }

  // 7–9: if + functions
  return [
    {
      title: 'If age >= 18 print Adult else Kid',
      correct: ['age = 18', 'if age >= 18:', '  print("Adult")', 'else:', '  print("Kid")'],
    },
    {
      title: 'Function add(a,b) then print add(2,3)',
      correct: ['def add(a, b):', '  return a + b', 'print(add(2, 3))'],
    },
    {
      title: 'Check even or odd',
      correct: ['n = 10', 'if n % 2 == 0:', '  print("Even")', 'else:', '  print("Odd")'],
    },
  ]
}

const makeCodeQuestions = (cls, count) => {
  const base = codePuzzlesByClass(cls)
  const qs = []
  for (let i = 0; i < count; i++) {
    const p = pick(base)
    qs.push({
      id: `${Date.now()}_${i}`,
      title: p.title,
      correctBlocks: p.correct,
      blocks: shuffle([...p.correct]),
    })
  }
  return qs
}

/* ------------------------ TEACHER SETTINGS ------------------------ */
const SETTINGS_KEY = 'code_kids_teacher_settings_v1'
const defaultTeacherSettings = () => ({
  questionCount: 8,
  timePerQuestion: 35,
  basePoints: 10,
  negativePoints: 0,
  bonusStepSeconds: 5,
  bonusPerStep: 1,
})

const loadTeacherSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultTeacherSettings()
    const parsed = JSON.parse(raw)
    return { ...defaultTeacherSettings(), ...parsed }
  } catch {
    return defaultTeacherSettings()
  }
}
const saveTeacherSettings = (s) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {}
}

/* ------------------------ COMPONENT ------------------------ */
export default function CodeKidsArrange() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherMode = searchParams.get('teacher') === '1'

  const game = 'code_kids'

  const [step, setStep] = useState('start')
  const [nameInput, setNameInput] = useState('')
  const [cls, setCls] = useState(1)

  const [players, setPlayers] = useState([])
  const [leaders, setLeaders] = useState([])
  const [champions, setChampions] = useState([])

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState([])

  const [timeLeft, setTimeLeft] = useState(35)
  const [loading, setLoading] = useState(false)

  const [points, setPoints] = useState(0)
  const pointsRef = useRef(0)

  const [attempted, setAttempted] = useState(0)
  const attemptedRef = useRef(0)

  const [correct, setCorrect] = useState(0)
  const correctRef = useRef(0)

  const totalTimeMsRef = useRef(0)
  const questionStartMsRef = useRef(Date.now())

  const [mistakes, setMistakes] = useState([])
  const [settings, setSettings] = useState(defaultTeacherSettings())

  const weekStart = useMemo(() => getMondayLocal(), [])
  const today = useMemo(() => getLocalISODate(), [])

  useEffect(() => {
    const s = loadTeacherSettings()
    const safe = {
      ...s,
      questionCount: clamp(Number(s.questionCount || 8), 5, 20),
      timePerQuestion: clamp(Number(s.timePerQuestion || 35), 15, 120),
      basePoints: clamp(Number(s.basePoints ?? 10), 1, 100),
      negativePoints: clamp(Number(s.negativePoints ?? 0), 0, 50),
      bonusStepSeconds: clamp(Number(s.bonusStepSeconds ?? 5), 1, 20),
      bonusPerStep: clamp(Number(s.bonusPerStep ?? 1), 0, 20),
    }
    setSettings(safe)
    setTimeLeft(safe.timePerQuestion)
  }, [])

  useEffect(() => {
    fetchPlayers()
    fetchLeaders()
    fetchChampions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart])

  useEffect(() => {
    if (step !== 'game') return
    if (timeLeft === 0) {
      submitAnswer(true)
      return
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, step])

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('name')
      .eq('game', game)
      .eq('week_start', weekStart)
      .order('name', { ascending: true })
      .limit(500)

    if (error) return setPlayers([])
    setPlayers(Array.from(new Set((data || []).map((r) => r.name).filter(Boolean))))
  }

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('game', game)
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .order('correct', { ascending: false })
      .order('attempted', { ascending: false })
      .order('total_time_ms', { ascending: true })
      .limit(200)

    if (error) return setLeaders([])
    setLeaders(data || [])
  }

  const fetchChampions = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('game', game)
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .order('correct', { ascending: false })
      .order('attempted', { ascending: false })
      .order('total_time_ms', { ascending: true })
      .limit(3)

    if (error) return setChampions([])
    setChampions(data || [])
  }

  const filteredPlayers = useMemo(() => {
    const q = normName(nameInput)
    if (!q) return players.slice(0, 30)
    return players.filter((p) => p.includes(q)).slice(0, 30)
  }, [players, nameInput])

  const calcPointsForCorrect = (timeLeftNow) => {
    const base = settings.basePoints ?? 10
    const stepSec = settings.bonusStepSeconds ?? 5
    const per = settings.bonusPerStep ?? 1
    const bonus = Math.floor((timeLeftNow || 0) / stepSec) * per
    return base + bonus
  }

  const addBlock = (b) => {
    if (!selected.includes(b)) setSelected((prev) => [...prev, b])
  }
  const removeBlock = (idx) => setSelected((prev) => prev.filter((_, i) => i !== idx))

  const nextQuestion = () => {
    setSelected([])
    setTimeLeft(settings.timePerQuestion || 35)
    questionStartMsRef.current = Date.now()

    if (current + 1 < questions.length) setCurrent((c) => c + 1)
    else finishGame()
  }

  const submitAnswer = (timeout = false) => {
    const q = questions[current]
    const your = timeout ? '(timeout)' : selected.join('\n')

    const elapsed = Date.now() - questionStartMsRef.current
    totalTimeMsRef.current += Math.max(0, elapsed)

    attemptedRef.current += 1
    setAttempted(attemptedRef.current)

    const isCorrect = !timeout && selected.join('|') === q.correctBlocks.join('|')

    if (isCorrect) {
      correctRef.current += 1
      setCorrect(correctRef.current)
      pointsRef.current += calcPointsForCorrect(timeLeft)
      setPoints(pointsRef.current)
    } else {
      pointsRef.current -= Number(settings.negativePoints || 0)
      setPoints(pointsRef.current)
      setMistakes((prev) => [...prev, { title: q.title, your, ans: q.correctBlocks.join('\n') }])
    }

    nextQuestion()
  }

  const startGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)

    if (!cleanName) return alert('Type your name or select from list')
    if (!cleanCls || cleanCls < 1 || cleanCls > 9) return alert('Class should be 1-9')

    const { data: rows, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', game)
      .eq('week_start', weekStart)
      .limit(1)

    if (error) return alert(`DB error: ${error.message}`)

    const existing = rows?.[0]
    if (existing?.last_played === today) {
      alert('You already played today! Come tomorrow 🌞')
      setStep('result')
      return
    }

    setLoading(true)
    try {
      setCurrent(0)
      setSelected([])
      pointsRef.current = 0
      setPoints(0)
      attemptedRef.current = 0
      setAttempted(0)
      correctRef.current = 0
      setCorrect(0)
      totalTimeMsRef.current = 0
      questionStartMsRef.current = Date.now()
      setMistakes([])

      const count = clamp(Number(settings.questionCount || 8), 5, 20)
      setTimeLeft(settings.timePerQuestion || 35)

      setQuestions(makeCodeQuestions(cleanCls, count))
      setStep('game')
    } finally {
      setLoading(false)
    }
  }

  const finishGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)

    const finalScore = Number(pointsRef.current || 0)
    const finalAttempted = Number(attemptedRef.current || 0)
    const finalCorrect = Number(correctRef.current || 0)
    const finalTime = Number(totalTimeMsRef.current || 0)

    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', game)
      .eq('week_start', weekStart)
      .limit(1)

    if (error) return alert(`DB error: ${error.message}`)

    const existing = data?.[0]
    if (existing?.last_played === today) {
      alert('You already played today! Come tomorrow 🌞')
      setStep('result')
      return
    }

    if (existing) {
      const { error: updErr } = await supabase
        .from('weekly_leaderboard')
        .update({
          score: Number(existing.score || 0) + finalScore,
          attempted: Number(existing.attempted || 0) + finalAttempted,
          correct: Number(existing.correct || 0) + finalCorrect,
          total_time_ms: Number(existing.total_time_ms || 0) + finalTime,
          last_played: today,
        })
        .eq('id', existing.id)

      if (updErr) alert(`Update failed: ${updErr.message}`)
    } else {
      const { error: insErr } = await supabase.from('weekly_leaderboard').insert([
        {
          name: cleanName,
          class: cleanCls,
          game,
          week_start: weekStart,
          last_played: today,
          score: finalScore,
          attempted: finalAttempted,
          correct: finalCorrect,
          total_time_ms: finalTime,
        },
      ])
      if (insErr) alert(`Insert failed: ${insErr.message}`)
    }

    await fetchPlayers()
    await fetchLeaders()
    await fetchChampions()
    setStep('result')
  }

  const saveTeacher = () => {
    const safe = {
      ...settings,
      questionCount: clamp(Number(settings.questionCount || 8), 5, 20),
      timePerQuestion: clamp(Number(settings.timePerQuestion || 35), 15, 120),
      basePoints: clamp(Number(settings.basePoints ?? 10), 1, 100),
      negativePoints: clamp(Number(settings.negativePoints ?? 0), 0, 50),
      bonusStepSeconds: clamp(Number(settings.bonusStepSeconds ?? 5), 1, 20),
      bonusPerStep: clamp(Number(settings.bonusPerStep ?? 1), 0, 20),
    }
    setSettings(safe)
    saveTeacherSettings(safe)
    alert('Teacher settings saved ✅')
  }

  const resetTeacher = () => {
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch {}
    const s = defaultTeacherSettings()
    setSettings(s)
    alert('Teacher settings reset ✅')
  }

  const q = questions[current]

  if (step === 'start') {
    return (
      <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover flex items-center justify-center p-6 relative">
        <button onClick={() => router.push('/')} className="absolute top-5 left-5 bg-yellow-500 text-black px-4 py-2 rounded-xl shadow-lg">
          🏠 Home
        </button>

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
          <div className="bg-white/95 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-extrabold mb-2">💻 Arrange the Code (Kids)</h2>
            <p className="text-sm text-gray-600 mb-5">Arrange blocks to form correct code.</p>

            <label className="text-sm font-semibold">Name</label>
            <input className="w-full p-3 mt-1 mb-3 border rounded-xl" placeholder="Search name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />

            <label className="text-sm font-semibold">Class (1-9)</label>
            <input className="w-full p-3 mt-1 mb-4 border rounded-xl" type="number" min={1} max={9} value={cls} onChange={(e) => setCls(parseInt(e.target.value || '1', 10))} />

            <button className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-xl w-full font-bold" onClick={startGame} disabled={loading}>
              {loading ? 'Starting...' : 'Start'}
            </button>

            <div className="mt-4 text-xs text-gray-600">
              Week Start: <b>{weekStart}</b> | Today: <b>{today}</b>
            </div>

            {teacherMode && (
              <div className="mt-6 border-t pt-5">
                <h3 className="font-extrabold text-lg mb-3">👩‍🏫 Teacher Control</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold">Questions / day (5-20)</label>
                    <input className="w-full p-2 border rounded-lg" type="number" min={5} max={20} value={settings.questionCount} onChange={(e) => setSettings((p) => ({ ...p, questionCount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Time / Q (15-120)</label>
                    <input className="w-full p-2 border rounded-lg" type="number" min={15} max={120} value={settings.timePerQuestion} onChange={(e) => setSettings((p) => ({ ...p, timePerQuestion: e.target.value }))} />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={saveTeacher} className="bg-black text-white px-4 py-2 rounded-xl">Save</button>
                  <button onClick={resetTeacher} className="bg-gray-200 text-black px-4 py-2 rounded-xl">Reset</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white">
            <h3 className="text-xl font-bold mb-2">👥 Players (This Week)</h3>
            <p className="text-sm text-white/80 mb-4">Click name to select.</p>

            <div className="max-h-[320px] overflow-y-auto pr-2">
              {(filteredPlayers.length === 0) ? (
                <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl">No name found. Type new name and start.</div>
              ) : (
                filteredPlayers.map((p) => (
                  <button key={p} onClick={() => setNameInput(p)} className="w-full text-left bg-black/30 hover:bg-black/40 transition p-3 rounded-xl mb-2">
                    {p}
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 bg-black/30 rounded-2xl p-4">
              <div className="font-bold mb-2">🥇 Weekly Champions</div>
              {champions.length === 0 ? (
                <div className="text-sm text-white/80">No champions yet</div>
              ) : (
                <div className="space-y-2">
                  {champions.map((c, i) => {
                    const acc = c.attempted ? Math.round((c.correct / c.attempted) * 100) : 0
                    const avg = c.attempted ? (c.total_time_ms / c.attempted / 1000).toFixed(1) : '0.0'
                    return (
                      <div key={c.id} className="text-sm">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name} — {c.score} pts — {acc}% — {avg}s
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    )
  }

  if (step === 'result') {
    const acc = attempted ? Math.round((correct / attempted) * 100) : 0
    const avg = attempted ? (totalTimeMsRef.current / attempted / 1000).toFixed(1) : '0.0'

    return (
      <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover flex items-center justify-center p-6">
        <div className="bg-white/95 p-10 rounded-3xl shadow-xl text-center w-full max-w-2xl">
          <h2 className="text-3xl font-extrabold mb-2">✅ Finished!</h2>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="text-xs text-gray-600">Points Today</div>
              <div className="text-3xl font-extrabold">{points}</div>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="text-xs text-gray-600">Accuracy</div>
              <div className="text-3xl font-extrabold">{acc}%</div>
            </div>
          </div>

          <div className="mt-6 text-left">
            <div className="font-extrabold mb-2">📝 Mistake Review</div>
            {mistakes.length === 0 ? (
              <div className="text-sm text-gray-700 bg-green-50 border border-green-200 p-3 rounded-xl">Perfect! No mistakes 🎉</div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2">
                {mistakes.map((m, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="font-bold">{m.title}</div>
                    <pre className="text-xs bg-white p-2 rounded-lg mt-2 whitespace-pre-wrap">{m.your}</pre>
                    <div className="text-sm mt-1">
                      Correct:
                      <pre className="text-xs bg-white p-2 rounded-lg mt-2 whitespace-pre-wrap">{m.ans}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <button className="bg-gray-800 text-white px-5 py-3 rounded-xl" onClick={() => setStep('start')}>Back</button>
            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl" onClick={() => router.push('/leaderboard')}>View Leaderboard</button>
          </div>

          <div className="text-xs text-gray-600 mt-4">One play per day. Weekly score adds.</div>
          <div className="text-xs text-gray-600">Avg time/Q: <b>{avg}s</b></div>
        </div>
      </div>
    )
  }

  // GAME
  return (
    <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🏆 Leaderboard</h3>
          <div className="text-xs text-white/70 text-center mb-3">Week: {weekStart}</div>

          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {leaders.length === 0 ? (
              <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No scores yet</div>
            ) : (
              leaders.map((l, i) => (
                <div key={l.id} className="bg-black/30 p-2 rounded-xl mb-2 text-sm">
                  <div className="flex justify-between">
                    <span>{i + 1}. {l.name}</span>
                    <span className="font-bold">{l.score} pts</span>
                  </div>
                  <div className="text-white/70 text-xs">Class {l.class}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/95 rounded-2xl p-6 shadow text-center">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold">💻 Arrange the Code</div>
            <div className="font-extrabold">⏱ {timeLeft}s</div>
          </div>

          <div className="text-xs text-gray-500 mb-2">Q {current + 1}/{questions.length}</div>
          <div className="text-xl md:text-2xl font-extrabold mb-4">{q?.title}</div>

          <div className="mb-4 flex flex-wrap justify-center">
            {q?.blocks?.map((b, i) => (
              <button
                key={`${q.id}_${i}`}
                onClick={() => addBlock(b)}
                className="m-2 px-3 py-2 bg-amber-600 text-white rounded-xl font-mono text-sm"
              >
                {b}
              </button>
            ))}
          </div>

          <div className="mb-4 min-h-[90px] flex flex-col items-stretch gap-2 p-3 border rounded-xl text-left">
            {selected.map((b, i) => (
              <div
                key={`${i}_${b}`}
                onClick={() => removeBlock(i)}
                className="px-3 py-2 bg-green-600 text-white rounded-xl cursor-pointer font-mono text-sm"
                title="Click to remove"
              >
                {i + 1}. {b}
              </div>
            ))}
          </div>

          <button onClick={() => submitAnswer(false)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
            Submit
          </button>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Points</div>
              <div className="font-extrabold text-xl">{points}</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Correct</div>
              <div className="font-extrabold text-xl">{correct}</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Attempted</div>
              <div className="font-extrabold text-xl">{attempted}</div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🥇 Weekly Champions</h3>
          <div className="text-xs text-white/70 text-center mb-3">Top 3</div>

          {champions.length === 0 ? (
            <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No champions yet</div>
          ) : (
            champions.map((c, i) => (
              <div key={c.id} className="bg-black/30 p-3 rounded-xl mb-2 text-sm">
                <div className="font-bold">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name}
                </div>
                <div className="text-white/70 text-xs">{c.score} pts</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

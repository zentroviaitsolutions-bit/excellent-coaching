'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

/* ------------------------ DATE + NORMALIZE ------------------------ */
const normName = (s) => (s || '').trim().toLowerCase()

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
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

/* ------------------------ TOPICS + SYLLABUS ------------------------ */
const syllabusByClass = (cls) => {
  const c = Number(cls)
  if (c <= 2) return ['add', 'sub']
  if (c <= 3) return ['add', 'sub', 'mul']
  if (c <= 5) return ['add', 'sub', 'mul', 'div']
  if (c <= 6) return ['add', 'sub', 'mul', 'div', 'frac', 'dec']
  if (c <= 7) return ['add', 'sub', 'mul', 'div', 'frac', 'dec', 'pct', 'geom']
  return ['add', 'sub', 'mul', 'div', 'frac', 'dec', 'pct', 'geom', 'alg']
}

const topicLabels = {
  add: 'Addition',
  sub: 'Subtraction',
  mul: 'Multiplication',
  div: 'Division',
  frac: 'Fractions',
  dec: 'Decimals',
  pct: 'Percent',
  geom: 'Geometry',
  alg: 'Algebra',
}

/* ------------------------ QUESTION GENERATORS ------------------------ */
const makeAdd = (cls, difficulty) => {
  const c = Number(cls)
  let max = c <= 2 ? 20 : c <= 5 ? 200 : 999
  max = Math.floor(max * (1 + 0.25 * (difficulty - 1)))
  const a = randInt(0, max)
  const b = randInt(0, max)
  const ans = a + b
  return { q: `${a} + ${b} = ?`, answer: String(ans) }
}

const makeSub = (cls, difficulty) => {
  const c = Number(cls)
  let max = c <= 2 ? 20 : c <= 5 ? 200 : 999
  max = Math.floor(max * (1 + 0.25 * (difficulty - 1)))
  let a = randInt(0, max)
  let b = randInt(0, max)
  if (b > a) ;[a, b] = [b, a]
  const ans = a - b
  return { q: `${a} − ${b} = ?`, answer: String(ans) }
}

const makeMul = (cls, difficulty) => {
  const c = Number(cls)
  let maxA = c <= 3 ? 12 : c <= 5 ? 20 : 35
  maxA = Math.floor(maxA * (1 + 0.2 * (difficulty - 1)))
  const a = randInt(2, maxA)
  const b = randInt(2, maxA)
  const ans = a * b
  return { q: `${a} × ${b} = ?`, answer: String(ans) }
}

const makeDiv = (cls, difficulty) => {
  const c = Number(cls)
  let maxB = c <= 5 ? 12 : 25
  maxB = Math.floor(maxB * (1 + 0.2 * (difficulty - 1)))
  const b = randInt(2, maxB)
  const ans = randInt(2, maxB)
  const a = b * ans
  return { q: `${a} ÷ ${b} = ?`, answer: String(ans) }
}

const makeFrac = (cls, difficulty) => {
  const denom = randInt(2, clamp(6 + difficulty, 2, 15))
  const a = randInt(1, denom - 1)
  const b = randInt(1, denom - 1)
  const num = a + b
  return { q: `${a}/${denom} + ${b}/${denom} = ? (as fraction)`, answer: `${num}/${denom}` }
}

const makeDec = (cls, difficulty) => {
  const places = Number(cls) <= 6 ? 1 : 2
  const scale = places === 1 ? 10 : 100
  const max = clamp(50 + difficulty * 20, 50, 500)
  const a = randInt(0, max * scale) / scale
  const b = randInt(0, max * scale) / scale
  const op = Math.random() < 0.5 ? '+' : '-'
  const ans = op === '+' ? a + b : Math.max(0, a - b)

  const fmt = (x) =>
    x
      .toFixed(places)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*[1-9])0+$/, '$1')

  return { q: `${fmt(a)} ${op} ${fmt(b)} = ?`, answer: fmt(ans) }
}

const makePct = (cls, difficulty) => {
  const pct = [5, 10, 12, 15, 20, 25, 50][randInt(0, 6)]
  const base = randInt(20, clamp(200 + difficulty * 50, 50, 1000))
  const ans = (pct / 100) * base
  return { q: `${pct}% of ${base} = ?`, answer: String(ans) }
}

const makeGeom = (cls, difficulty) => {
  const a = randInt(2, clamp(15 + difficulty * 3, 10, 60))
  const b = randInt(2, clamp(15 + difficulty * 3, 10, 60))
  const mode = Math.random() < 0.5 ? 'area' : 'perimeter'
  if (mode === 'area') return { q: `Area of rectangle: ${a} × ${b} = ?`, answer: String(a * b) }
  return { q: `Perimeter of rectangle (L=${a}, W=${b}) = ?`, answer: String(2 * (a + b)) }
}

const makeAlg = (cls, difficulty) => {
  const type = Math.random() < 0.5 ? 'linear1' : 'linear2'
  if (type === 'linear1') {
    const x = randInt(1, clamp(10 + difficulty * 5, 10, 50))
    const a = randInt(1, clamp(20 + difficulty * 5, 20, 80))
    const b = x + a
    return { q: `Solve: x + ${a} = ${b}`, answer: String(x) }
  } else {
    const x = randInt(1, clamp(10 + difficulty * 4, 10, 40))
    const a = randInt(2, clamp(12 + difficulty * 2, 8, 30))
    const b = a * x
    return { q: `Solve: ${a}x = ${b}`, answer: String(x) }
  }
}

const topicGenerators = {
  add: makeAdd,
  sub: makeSub,
  mul: makeMul,
  div: makeDiv,
  frac: makeFrac,
  dec: makeDec,
  pct: makePct,
  geom: makeGeom,
  alg: makeAlg,
}

/* ------------------------ SAFE OPTIONS (NO FREEZE) ------------------------ */
const buildOptions = (answerStr) => {
  const ans = String(answerStr ?? '')
  const opts = new Set([ans])

  const isFrac = ans.includes('/')
  const isNum = !isFrac && !Number.isNaN(Number(ans))

  let tries = 0
  while (opts.size < 4 && tries < 200) {
    tries++

    if (isFrac) {
      const parts = ans.split('/')
      const n = parseInt(parts[0], 10)
      const d = parseInt(parts[1], 10)

      const nn = clamp((Number.isFinite(n) ? n : 1) + randInt(-2, 2), 1, 50)
      const dd = clamp((Number.isFinite(d) ? d : 2) + randInt(-2, 2), 2, 50)

      const w = `${nn}/${dd}`
      if (w !== ans) opts.add(w)
    } else if (isNum) {
      const n = Number(ans)
      const delta = randInt(-10, 10)
      const wNum = Math.max(0, n + delta)
      const w = String(Math.round(wNum * 100) / 100)
      if (w !== ans) opts.add(w)
    } else {
      opts.add(ans + '_' + randInt(1, 999))
    }
  }

  while (opts.size < 4) {
    opts.add(String(randInt(0, 999)))
  }

  return shuffle(Array.from(opts))
}

/* ------------------------ TEACHER SETTINGS ------------------------ */
const SETTINGS_KEY = 'maths_teacher_settings_v1'

const defaultTeacherSettings = (cls) => ({
  questionCount: 10,
  timePerQuestion: 30,

  basePoints: 10,
  negativePoints: 5,
  bonusStepSeconds: 5,
  bonusPerStep: 1,

  startDifficulty: 1,
  maxDifficulty: 6,
  streakToIncrease: 3,
  wrongToDecrease: 1,

  enabledTopics: syllabusByClass(cls),
})

const loadTeacherSettings = (cls) => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultTeacherSettings(cls)
    const parsed = JSON.parse(raw)
    return { ...defaultTeacherSettings(cls), ...parsed }
  } catch {
    return defaultTeacherSettings(cls)
  }
}

const saveTeacherSettings = (s) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {}
}

/* ------------------------ COMPONENT ------------------------ */
export default function MathsGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherMode = searchParams.get('teacher') === '1'

  const [step, setStep] = useState('start') // start | game | result
  const [nameInput, setNameInput] = useState('')
  const [cls, setCls] = useState(1)

  const [players, setPlayers] = useState([])
  const [leaders, setLeaders] = useState([])
  const [champions, setChampions] = useState([])

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [loading, setLoading] = useState(false)

  const [points, setPoints] = useState(0)
  const pointsRef = useRef(0)

  const [attempted, setAttempted] = useState(0)
  const attemptedRef = useRef(0)

  const [correct, setCorrect] = useState(0)
  const correctRef = useRef(0)

  const totalTimeMsRef = useRef(0)
  const questionStartMsRef = useRef(Date.now())

  const [difficulty, setDifficulty] = useState(1)
  const streakRef = useRef(0)

  const [mistakes, setMistakes] = useState([])
  const [settings, setSettings] = useState(defaultTeacherSettings(1))
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const [isPortrait, setIsPortrait] = useState(false)

  const weekStart = useMemo(() => getMondayLocal(), [])
  const today = useMemo(() => getLocalISODate(), [])

  /* ---------------- orientation ---------------- */
  useEffect(() => {
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth)
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  /* ---------------- load settings safely ---------------- */
  useEffect(() => {
    const s = loadTeacherSettings(cls)
    // ✅ clamp important fields to avoid freeze
    const safe = {
      ...s,
      questionCount: clamp(Number(s.questionCount || 10), 5, 30),
      timePerQuestion: clamp(Number(s.timePerQuestion || 30), 10, 90),
      basePoints: clamp(Number(s.basePoints ?? 10), 1, 100),
      negativePoints: clamp(Number(s.negativePoints ?? 5), 0, 50),
      bonusStepSeconds: clamp(Number(s.bonusStepSeconds ?? 5), 1, 15),
      bonusPerStep: clamp(Number(s.bonusPerStep ?? 1), 0, 20),
      startDifficulty: clamp(Number(s.startDifficulty ?? 1), 1, 12),
      maxDifficulty: clamp(Number(s.maxDifficulty ?? 6), 1, 12),
      streakToIncrease: clamp(Number(s.streakToIncrease ?? 3), 1, 10),
      wrongToDecrease: clamp(Number(s.wrongToDecrease ?? 1), 1, 5),
      enabledTopics: (s.enabledTopics?.length ? s.enabledTopics : syllabusByClass(cls)).filter((t) => topicGenerators[t]),
    }
    setSettings(safe)
    setSettingsLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    setSettings((prev) => ({
      ...prev,
      enabledTopics: prev.enabledTopics?.length ? prev.enabledTopics : syllabusByClass(cls),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cls])

  /* ---------------- init boards ---------------- */
  useEffect(() => {
    fetchPlayers()
    fetchLeaders()
    fetchChampions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart])

  /* ---------------- timer ---------------- */
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

  /* ---------------- DB: players + leaderboard + champions ---------------- */
  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('name')
      .eq('game', 'maths')
      .eq('week_start', weekStart)
      .order('name', { ascending: true })
      .limit(500)

    if (error) {
      console.log('fetchPlayers error:', error)
      setPlayers([])
      return
    }
    setPlayers(Array.from(new Set((data || []).map((r) => r.name).filter(Boolean))))
  }

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('game', 'maths')
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .order('correct', { ascending: false })
      .order('attempted', { ascending: false })
      .order('total_time_ms', { ascending: true })
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
      .eq('game', 'maths')
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .order('correct', { ascending: false })
      .order('attempted', { ascending: false })
      .order('total_time_ms', { ascending: true })
      .limit(3)

    if (error) {
      console.log('fetchChampions error:', error)
      setChampions([])
      return
    }
    setChampions(data || [])
  }

  /* ---------------- Name list ---------------- */
  const pickPlayer = (p) => setNameInput(p)

  const filteredPlayers = useMemo(() => {
    const q = normName(nameInput)
    if (!q) return players.slice(0, 30)
    return players.filter((p) => p.includes(q)).slice(0, 30)
  }, [players, nameInput])

  /* ---------------- Build questions ---------------- */
  const generateQuestions = (classLevel, count, enabledTopics, startDiff) => {
    const c = Number(classLevel)
    const topics = enabledTopics?.length ? enabledTopics : syllabusByClass(c)

    const qs = []
    for (let i = 0; i < count; i++) {
      const topic = topics[randInt(0, topics.length - 1)]
      const gen = topicGenerators[topic] || makeAdd
      const payload = gen(c, startDiff)
      const options = buildOptions(payload.answer)
      qs.push({
        id: `${Date.now()}_${i}_${topic}`,
        topic,
        difficulty: startDiff,
        q: payload.q,
        options,
        answer: payload.answer,
      })
    }
    return qs
  }

  /* ---------------- Start game (daily lock) ---------------- */
  const startGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)

    if (!cleanName) return alert('Type your name or select from list')
    if (!cleanCls || cleanCls < 1 || cleanCls > 9) return alert('Class should be 1-9')

    const { data: rows, error: selErr } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', 'maths')
      .eq('week_start', weekStart)
      .limit(1)

    if (selErr) {
      console.log('daily check error:', selErr)
      alert(`DB error: ${selErr.message}`)
      return
    }

    const existing = rows?.[0]
    if (existing?.last_played === today) {
      alert('You already played today! Come tomorrow 🌞')
      setStep('result')
      return
    }

    setLoading(true)
    try {
      setCurrent(0)
      setSelectedOption(null)

      pointsRef.current = 0
      setPoints(0)

      attemptedRef.current = 0
      setAttempted(0)

      correctRef.current = 0
      setCorrect(0)

      totalTimeMsRef.current = 0
      questionStartMsRef.current = Date.now()

      setMistakes([])
      streakRef.current = 0

      const maxD = settings.maxDifficulty || 6
      const startDiff = clamp(settings.startDifficulty || 1, 1, maxD)
      setDifficulty(startDiff)

      setTimeLeft(settings.timePerQuestion || 30)

      const count = clamp(Number(settings.questionCount || 10), 5, 30)
      const topics = (settings.enabledTopics?.length ? settings.enabledTopics : syllabusByClass(cleanCls)).filter(
        (t) => topicGenerators[t]
      )
      const qs = generateQuestions(cleanCls, count, topics, startDiff)
      setQuestions(qs)
      setStep('game')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- scoring + difficulty ---------------- */
  const applyDifficultyChange = (wasCorrect) => {
    const maxD = settings.maxDifficulty || 6

    if (wasCorrect) {
      streakRef.current += 1
      if (streakRef.current >= (settings.streakToIncrease || 3)) {
        streakRef.current = 0
        setDifficulty((d) => clamp(d + 1, 1, maxD))
      }
    } else {
      streakRef.current = 0
      if ((settings.wrongToDecrease || 1) >= 1) {
        setDifficulty((d) => clamp(d - 1, 1, maxD))
      }
    }
  }

  const calcPointsForCorrect = (timeLeftNow) => {
    const base = settings.basePoints ?? 10
    const step = settings.bonusStepSeconds ?? 5
    const per = settings.bonusPerStep ?? 1
    const bonus = Math.floor((timeLeftNow || 0) / step) * per
    return base + bonus
  }

  const calcNegativeForWrong = () => settings.negativePoints ?? 0

  const nextQuestion = () => {
    setSelectedOption(null)
    setTimeLeft(settings.timePerQuestion || 30)
    questionStartMsRef.current = Date.now()

    if (current + 1 < questions.length) setCurrent((c) => c + 1)
    else finishGame()
  }

  const submitAnswer = (timeout = false) => {
    const q = questions[current]
    const your = timeout ? '(timeout)' : selectedOption

    const elapsedMs = Date.now() - questionStartMsRef.current
    totalTimeMsRef.current += Math.max(0, elapsedMs)

    attemptedRef.current += 1
    setAttempted(attemptedRef.current)

    const isCorrect =
      !timeout && selectedOption != null && String(selectedOption) === String(q.answer)

    if (isCorrect) {
      correctRef.current += 1
      setCorrect(correctRef.current)

      const addPts = calcPointsForCorrect(timeLeft)
      pointsRef.current += addPts
      setPoints(pointsRef.current)
    } else {
      const neg = calcNegativeForWrong()
      pointsRef.current -= neg
      setPoints(pointsRef.current)

      setMistakes((prev) => [
        ...prev,
        { q: q.q, topic: q.topic, your: String(your ?? ''), ans: String(q.answer) },
      ])
    }

    applyDifficultyChange(isCorrect)

    // Adaptive next question (regenerate next slot safely)
    if (current + 1 < questions.length) {
      const cleanCls = Number(cls)
      const topics = (settings.enabledTopics?.length ? settings.enabledTopics : syllabusByClass(cleanCls)).filter(
        (t) => topicGenerators[t]
      )
      const nextDiff = clamp(difficulty, 1, settings.maxDifficulty || 6)
      const topic = topics.length ? topics[randInt(0, topics.length - 1)] : 'add'
      const gen = topicGenerators[topic] || makeAdd
      const payload = gen(cleanCls, nextDiff)
      const options = buildOptions(payload.answer)

      setQuestions((prev) => {
        const copy = [...prev]
        copy[current + 1] = {
          id: `${Date.now()}_${current + 1}_${topic}`,
          topic,
          difficulty: nextDiff,
          q: payload.q,
          options,
          answer: payload.answer,
        }
        return copy
      })
    }

    nextQuestion()
  }

  /* ---------------- Finish: save weekly add + daily lock ---------------- */
  const finishGame = async () => {
    const cleanName = normName(nameInput)
    const cleanCls = Number(cls)

    const game = 'maths'
    const finalPoints = Number(pointsRef.current || 0)
    const finalAttempted = Number(attemptedRef.current || 0)
    const finalCorrect = Number(correctRef.current || 0)
    const finalTotalTimeMs = Number(totalTimeMsRef.current || 0)

    const { data, error: selErr } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('name', cleanName)
      .eq('class', cleanCls)
      .eq('game', game)
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
      const newScore = Number(existing.score || 0) + finalPoints
      const newAttempted = Number(existing.attempted || 0) + finalAttempted
      const newCorrect = Number(existing.correct || 0) + finalCorrect
      const newTotalTime = Number(existing.total_time_ms || 0) + finalTotalTimeMs

      const { error: updErr } = await supabase
        .from('weekly_leaderboard')
        .update({
          score: newScore,
          attempted: newAttempted,
          correct: newCorrect,
          total_time_ms: newTotalTime,
          last_played: today,
        })
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
          game,
          week_start: weekStart,
          last_played: today,
          score: finalPoints,
          attempted: finalAttempted,
          correct: finalCorrect,
          total_time_ms: finalTotalTimeMs,
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

  /* ---------------- Teacher panel helpers ---------------- */
  const toggleTopic = (topic) => {
    setSettings((prev) => {
      const set = new Set(prev.enabledTopics || [])
      if (set.has(topic)) set.delete(topic)
      else set.add(topic)
      return { ...prev, enabledTopics: Array.from(set) }
    })
  }

  const saveTeacher = () => {
    const safe = {
      ...settings,
      questionCount: clamp(Number(settings.questionCount || 10), 5, 30),
      timePerQuestion: clamp(Number(settings.timePerQuestion || 30), 10, 90),
      basePoints: clamp(Number(settings.basePoints ?? 10), 1, 100),
      negativePoints: clamp(Number(settings.negativePoints ?? 5), 0, 50),
      bonusStepSeconds: clamp(Number(settings.bonusStepSeconds ?? 5), 1, 15),
      bonusPerStep: clamp(Number(settings.bonusPerStep ?? 1), 0, 20),
      startDifficulty: clamp(Number(settings.startDifficulty ?? 1), 1, 12),
      maxDifficulty: clamp(Number(settings.maxDifficulty ?? 6), 1, 12),
      streakToIncrease: clamp(Number(settings.streakToIncrease ?? 3), 1, 10),
      wrongToDecrease: clamp(Number(settings.wrongToDecrease ?? 1), 1, 5),
      enabledTopics: (settings.enabledTopics?.length ? settings.enabledTopics : syllabusByClass(cls)).filter(
        (t) => topicGenerators[t]
      ),
    }
    setSettings(safe)
    saveTeacherSettings(safe)
    alert('Teacher settings saved ✅')
  }

  const resetTeacher = () => {
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch {}
    const s = defaultTeacherSettings(cls)
    setSettings(s)
    alert('Teacher settings reset ✅ (reload recommended)')
  }

  /* ---------------- Derived UI stats ---------------- */
  const accuracyPct = attempted ? Math.round((correct / attempted) * 100) : 0
  const avgSec = attempted ? (totalTimeMsRef.current / attempted / 1000).toFixed(1) : '0.0'
  const q = questions[current]

  /* ---------------- UI ---------------- */
  if (step === 'start') {
    return (
      <div className="min-h-screen bg-[url('/gamebg.png')] bg-cover flex items-center justify-center p-6 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-5 left-5 bg-yellow-500 text-black px-4 py-2 rounded-xl shadow-lg"
        >
          🏠 Home
        </button>

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
          {/* Start */}
          <div className="bg-white/95 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-extrabold mb-2">🧮 Maths Game</h2>
            <p className="text-sm text-gray-600 mb-5">
              Select your name like Typing Master. If not found, type new name and start.
              <br />
              <b>One play per day</b>. Weekly points accumulate.
            </p>

            <label className="text-sm font-semibold">Name</label>
            <input
              className="w-full p-3 mt-1 mb-3 border rounded-xl"
              placeholder="Search name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />

            <label className="text-sm font-semibold">Class (1-9)</label>
            <input
              className="w-full p-3 mt-1 mb-4 border rounded-xl"
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
                    <label className="text-xs font-bold">Questions / day (5-30)</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={5}
                      max={30}
                      value={settings.questionCount}
                      onChange={(e) => setSettings((p) => ({ ...p, questionCount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Time / Q (10-90)</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={10}
                      max={90}
                      value={settings.timePerQuestion}
                      onChange={(e) => setSettings((p) => ({ ...p, timePerQuestion: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold">Base points</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={1}
                      max={100}
                      value={settings.basePoints}
                      onChange={(e) => setSettings((p) => ({ ...p, basePoints: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Negative (wrong)</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={0}
                      max={50}
                      value={settings.negativePoints}
                      onChange={(e) => setSettings((p) => ({ ...p, negativePoints: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold">Bonus step (sec)</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={1}
                      max={15}
                      value={settings.bonusStepSeconds}
                      onChange={(e) => setSettings((p) => ({ ...p, bonusStepSeconds: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Bonus per step</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={0}
                      max={20}
                      value={settings.bonusPerStep}
                      onChange={(e) => setSettings((p) => ({ ...p, bonusPerStep: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold">Start difficulty</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={1}
                      max={12}
                      value={settings.startDifficulty}
                      onChange={(e) => setSettings((p) => ({ ...p, startDifficulty: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Max difficulty</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="number"
                      min={1}
                      max={12}
                      value={settings.maxDifficulty}
                      onChange={(e) => setSettings((p) => ({ ...p, maxDifficulty: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-bold mb-2">Topics</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(topicLabels).map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.enabledTopics || []).includes(t)}
                          onChange={() => toggleTopic(t)}
                        />
                        {topicLabels[t]}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={saveTeacher} className="bg-black text-white px-4 py-2 rounded-xl">
                    Save
                  </button>
                  <button onClick={resetTeacher} className="bg-gray-200 text-black px-4 py-2 rounded-xl">
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Players + champions */}
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
              <div className="font-bold mb-2">🥇 Weekly Champions</div>
              {champions.length === 0 ? (
                <div className="text-sm text-white/80">No champions yet</div>
              ) : (
                champions.map((c, i) => {
                  const acc = c.attempted ? Math.round((c.correct / c.attempted) * 100) : 0
                  const avg = c.attempted ? (c.total_time_ms / c.attempted / 1000).toFixed(1) : '0.0'
                  return (
                    <div key={c.id} className="text-sm">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name} — {c.score} pts — {acc}% — {avg}s
                    </div>
                  )
                })
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
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="text-xs text-gray-600">Correct / Attempted</div>
              <div className="text-2xl font-extrabold">
                {correct} / {attempted}
              </div>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="text-xs text-gray-600">Avg time / Q</div>
              <div className="text-2xl font-extrabold">{avg}s</div>
            </div>
          </div>

          <div className="mt-6 text-left">
            <div className="font-extrabold mb-2">📝 Mistake Review</div>
            {mistakes.length === 0 ? (
              <div className="text-sm text-gray-700 bg-green-50 border border-green-200 p-3 rounded-xl">
                Perfect! No mistakes 🎉
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2">
                {mistakes.map((m, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Topic: <b>{topicLabels[m.topic] || m.topic}</b>
                    </div>
                    <div className="font-bold">{m.q}</div>
                    <div className="text-sm mt-1">
                      Your answer: <b>{m.your}</b> &nbsp; | &nbsp; Correct: <b>{m.ans}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <button className="bg-gray-800 text-white px-5 py-3 rounded-xl" onClick={() => setStep('start')}>
              Back
            </button>
            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl" onClick={() => router.push('/leaderboard')}>
              View Leaderboard
            </button>
          </div>

          <div className="text-xs text-gray-600 mt-4">
            One play per day. Weekly points accumulate. Come tomorrow 🌞
          </div>
        </div>
      </div>
    )
  }

  // GAME
  return (
    <div className="relative min-h-screen bg-[url('/gamebg.png')] bg-cover p-6">
      {isPortrait && (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center text-center p-6 z-50">
          <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
          <h2 className="text-2xl font-bold mb-2">Rotate Your Device</h2>
          <p>This game works best in landscape mode.</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🏆 Leaderboard</h3>
          <div className="text-xs text-white/70 text-center mb-3">Week: {weekStart}</div>

          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {leaders.length === 0 ? (
              <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No scores yet</div>
            ) : (
              leaders.map((l, i) => {
                const acc = l.attempted ? Math.round((l.correct / l.attempted) * 100) : 0
                const avg = l.attempted ? (l.total_time_ms / l.attempted / 1000).toFixed(1) : '0.0'
                return (
                  <div key={l.id} className="bg-black/30 p-2 rounded-xl mb-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {i + 1}. {l.name}
                      </span>
                      <span className="text-white/90 font-bold">{l.score} pts</span>
                    </div>
                    <div className="text-white/70 text-xs">
                      Class {l.class} • {acc}% • {avg}s
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Game */}
        <div className="lg:col-span-2 bg-white/95 rounded-2xl p-6 shadow text-center">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold">
              Topic: <span className="text-slate-700">{topicLabels[q?.topic] || q?.topic}</span>
            </div>
            <div className="font-extrabold">⏱ {timeLeft}s</div>
          </div>

          <div className="text-xs text-gray-500 mb-2">
            Q {current + 1}/{questions.length} • Difficulty: {difficulty}
          </div>

          <div className="text-3xl font-extrabold mb-5">{q?.q}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q?.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`p-4 rounded-xl border font-bold transition ${
                  selectedOption === opt ? 'bg-green-600 text-white' : 'bg-white hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => submitAnswer(false)}
            className="mt-5 bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-3 rounded-xl font-bold"
          >
            Submit
          </button>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Points</div>
              <div className="font-extrabold text-xl">{points}</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Accuracy</div>
              <div className="font-extrabold text-xl">{accuracyPct}%</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">Avg time/Q</div>
              <div className="font-extrabold text-xl">{avgSec}s</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            Bonus: +{settings.bonusPerStep} per {settings.bonusStepSeconds}s left • Negative: −{settings.negativePoints} on wrong
          </div>
        </div>

        {/* Champions */}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
          <h3 className="font-bold text-center mb-2">🥇 Weekly Champions</h3>
          <div className="text-xs text-white/70 text-center mb-3">Top 3</div>

          {champions.length === 0 ? (
            <div className="text-sm text-white/80 bg-black/30 p-3 rounded-xl text-center">No champions yet</div>
          ) : (
            champions.map((c, i) => {
              const acc = c.attempted ? Math.round((c.correct / c.attempted) * 100) : 0
              const avg = c.attempted ? (c.total_time_ms / c.attempted / 1000).toFixed(1) : '0.0'
              return (
                <div key={c.id} className="bg-black/30 p-3 rounded-xl mb-2 text-sm">
                  <div className="font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {c.name}
                  </div>
                  <div className="text-white/70 text-xs">
                    {c.score} pts • {acc}% • {avg}s
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}


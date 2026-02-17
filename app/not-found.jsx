'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Button } from '@heroui/react'

const NotFoundScene = dynamic(
  () => import('./components/NotFoundScene').then((m) => m.NotFoundScene),
  { ssr: false }
)

export default function NotFound() {
  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 text-slate-900'>
      {/* 3D background */}
      <NotFoundScene />

      {/* soft pastel gradient overlay (very transparent) */}
      <div className='pointer-events-none absolute inset-0 -z-5 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),_transparent_60%)]' />

      {/* glass card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='relative z-10 mx-4 w-full max-w-xl'
      >
        {/* subtle glow border */}
        <motion.div
          className='absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-orange-400/40 via-fuchsia-400/30 to-sky-400/40 opacity-80 blur-xl'
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className='relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 px-6 py-8 shadow-xl backdrop-blur-2xl sm:px-8 sm:py-10'>
          <div className='pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent' />

          <div className='flex flex-col items-center gap-5 sm:gap-6'>
            {/* 404 mark */}
            <motion.div
              className='relative inline-flex items-center justify-center'
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className='absolute inset-0 rounded-full border border-orange-300/60'
                style={{ padding: '0.4rem' }}
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className='absolute -inset-6 rounded-full bg-gradient-to-r from-orange-300/35 via-fuchsia-300/30 to-sky-300/35 blur-2xl'
                animate={{ opacity: [0.3, 0.7, 0.4, 0.3] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.span
                className='relative z-10 bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl md:text-8xl'
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                404
              </motion.span>
            </motion.div>

            {/* text */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className='space-y-3 text-center'
            >
              <h1 className='text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl'>
                Lost between manga dimensions
              </h1>
              <p className='mx-auto max-w-md text-sm text-slate-600 sm:text-base'>
                You just turned to a blank page. The chapter you’re looking for
                doesn’t exist, or it hasn’t been drawn yet.
              </p>
            </motion.div>

            {/* buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className='mt-2 flex flex-wrap items-center justify-center gap-3'
            >
              <Button
                asChild
                className='group relative overflow-hidden border border-orange-400/70 bg-gradient-to-r from-orange-400 to-amber-400 text-slate-900 shadow-md shadow-orange-300/40'
              >
                <Link href='/'>
                  <span className='relative z-10'>Return home</span>
                  <motion.span
                    className='pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-white/50 via-transparent to-white/50'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                </Link>
              </Button>

              <Button
                variant='outline'
                asChild
                className='border-slate-300 bg-white/70 text-slate-800 backdrop-blur-xl hover:bg-white'
              >
                <Link href='/browse'>Browse manga</Link>
              </Button>

              <Button
                variant='ghost'
                asChild
                className='text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              >
                <Link href='/search'>Search by title</Link>
              </Button>
            </motion.div>

            <motion.p
              className='mt-1 text-xs text-slate-500'
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ delay: 0.35 }}
            >
              Error code:{' '}
              <span className='font-mono text-orange-500'>404-R3F-PANEL</span>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

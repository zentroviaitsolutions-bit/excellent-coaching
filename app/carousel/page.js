'use client'
import React, { useEffect, useRef, useState } from 'react'
import { easeOut, motion, useAnimate } from 'motion/react'
import { Button } from '@heroui/react'
import { ButtonGroup } from '@heroui/react'

const data = [
  {
    title: 'Reading & Writing',
    age: 'Ages 5-12',
    desc: 'Build strong literacy skills through engaging stories and creative writing exercises',
    img: 'https://images.unsplash.com/photo-1549737221-bef65e2604a6',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Math Mastery',
    age: 'Ages 6-14',
    desc: 'Make math fun with interactive problem-solving and real-world applications',
    img: 'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    title: 'Creative Arts',
    age: 'Ages 4-12',
    desc: 'Unleash creativity through drawing, painting, and hands-on art projects',
    img: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c',
    gradient: 'from-pink-400 to-pink-600',
  },
  {
    title: 'Music & Rhythm',
    age: 'Ages 5-13',
    desc: 'Discover musical talents with instruments, singing, and music theory',
    img: 'https://images.unsplash.com/photo-1759844939950-7d8d9e7978fe',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    title: 'Science Explorer',
    age: 'Ages 7-14',
    desc: 'Hands-on experiments and exciting discoveries in the world of science',
    img: 'https://images.unsplash.com/photo-1609422644211-a85c36ee36a7',
    gradient: 'from-green-400 to-green-600',
  },
  {
    title: 'Coding Kids',
    age: 'Ages 8-15',
    desc: 'Learn programming basics through games and fun coding challenges',
    img: 'https://images.unsplash.com/photo-1719498828499-48b0086e5c21',
    gradient: 'from-indigo-400 to-indigo-600',
  },
]

const Page = () => {
  const itemRefs = useRef([])
  const [widths, setWidths] = useState([])
  const [index, setIndex] = useState(0)
  const [x, setX] = useState(0)
  const [scope, animate] = useAnimate()

  // console.log('widths', widths)

  useEffect(() => {
    if (!itemRefs.current.length) return
    const observer = new ResizeObserver((enteries) => {
      const newWidths = itemRefs.current.map(
        (el) => el?.getBoundingClientRect().width || 0
      )
      setWidths(newWidths)
    })
    itemRefs.current.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleNav = (dir) => {
    const gap = 16
    if (!widths.length) return
    let nextIndex = index
    if (dir === 'next') nextIndex += 1
    if (dir === 'prev') nextIndex -= 1

    //edge cases
    if (nextIndex < 0) nextIndex = 0
    if (nextIndex >= widths.length) {
      nextIndex = widths.length - 1
    }

    // how much to move
    let moveX = 0
    for (let i = 0; i < nextIndex; i++) {
      moveX -= widths[i] + gap
    }

    animate(
      scope.current,
      { x: moveX },
      // { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      {
        type: 'spring',
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      }
    )

    setX(moveX)
    setIndex(nextIndex)
  }

  return (
    <div className='mt-32 max-w-[1200px] m-auto'>
      <motion.div
        ref={scope}
        className='flex flex-nowrap gap-4 w-full overflow-hidden'
      >
        {data
          .concat(data)
          .concat(data)
          .map((item, idx) => {
            return (
              <motion.div
                ref={(el) => (itemRefs.current[idx] = el)}
                className='shrink-0'
                key={idx}
                onClick={() => handleNav('next')}
              >
                <motion.img
                  src={'https://picsum.photos/200'}
                  alt={item.title}
                  className='h-[180px] w-auto object-cover rounded-lg'
                />
                <h1>{idx}</h1>
              </motion.div>
            )
          })}
      </motion.div>

      {/* Debug */}
      <pre>{JSON.stringify(widths, null, 2)}</pre>

      {/* Nav Buttons */}
      <Button onClick={() => handleNav('prev')}>Prev</Button>
      <Button onClick={() => handleNav('next')}>Next</Button>
    </div>
  )
}

export default Page

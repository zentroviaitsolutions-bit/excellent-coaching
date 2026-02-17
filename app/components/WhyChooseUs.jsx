import React from 'react'
import { motion } from 'motion/react'
import { Target, Users, Award, Smile } from 'lucide-react'

const WhyChooseUs = () => {
  // 1. Define the data array
  const features = [
    {
      title: 'Goal-Oriented',
      desc: 'We set clear, achievable goals for every child',
      icon: Target,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Expert Coaches',
      desc: 'Certified professionals who love working with kids',
      icon: Users,
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Proven Results',
      desc: '95% of our students improve within 3 months',
      icon: Award,
      color: 'from-pink-400 to-pink-600',
    },
    {
      title: 'Fun Learning',
      desc: 'Engaging methods that make learning enjoyable',
      icon: Smile,
      color: 'from-orange-400 to-orange-600',
    },
  ]

  // 2. Define Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.7 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const statsContainer = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.3 },
    },
  }

  const statsVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      id='about'
      className='py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden'
    >
      {/* Background Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl rotate-[96deg]' />
        <div className='absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl rotate-[-221deg]' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold'>
            Why Choose Excellent Coaching?
          </h2>
          <p className='text-xl text-gray-700 max-w-3xl mx-auto'>
            We're not just coaches—we're partners in your child's journey to
            success.
          </p>
        </div>

        {/* 3. Feature Grid with Loop */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{
                rotate: 2,
                scale: 1.05,
                transition: {
                  duration: 0.5,
                  ease: 'easeInOut',
                },
              }}
              whileTap={{
                rotate: 2,
                scale: 1.05,
                transition: {
                  duration: 0.5,
                  ease: 'easeInOut',
                },
              }}
              className='relative group'
            >
              <div className='bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-50'>
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <item.icon className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-2xl font-semibold text-gray-900 mb-3'>
                  {item.title}
                </h3>
                <p className='text-gray-600'>{item.desc}</p>

                {/* Hover Overlay */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          variants={statsContainer}
          className='mt-20 grid grid-cols-2 md:grid-cols-4 gap-8'
        >
          {[
            { label: 'Happy Students', value: '50+' },
            { label: 'Expert Coaches', value: '4+' },
            { label: 'Programs', value: '5+' },
            { label: 'Success Rate', value: '95%' },
          ].map((stat, idx) => (
            <motion.div
              variants={statsVariants}
              key={idx}
              className='text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6'
            >
              <div className='text-4xl md:text-5xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
                {stat.value}
              </div>
              <div className='text-gray-700 font-medium'>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default WhyChooseUs

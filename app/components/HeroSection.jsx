// 'use client'

// import React, { useEffect } from "react";
// import { motion } from "framer-motion";
// import { Sparkles, Heart, Rocket } from "lucide-react";
// import { useRouter } from "next/navigation";

// // ================= animations =================

// const float = (duration = 10) => ({
//   animate: {
//     y: [0, -40, 30, 0],
//     scale: [1, 1.08, 0.96, 1],
//   },
//   transition: {
//     duration,
//     repeat: Infinity,
//     repeatType: "reverse",
//     ease: "easeInOut",
//   },
// });

// const iconFloat = {
//   animate: { rotate: [20, -20, 20], y: [0, -15, 0] },
//   transition: { duration: 3, repeat: Infinity, ease: "linear" },
// };

// const blobs = [
//   { w: 136, h: 104, left: "98%", top: "40%", duration: 22 },
//   { w: 146, h: 390, left: "30%", top: "23%", duration: 15 },
//   { w: 242, h: 383, left: "31%", top: "13%", duration: 10 },
//   { w: 239, h: 283, left: "5%", top: "99%", duration: 6 },
//   { w: 150, h: 267, left: "64%", top: "7%", duration: 8 },
// ];

// const buttonHover = {
//   whileHover: { scale: 1.05, y: -2 },
//   whileTap: { scale: 0.97 },
//   transition: { type: "spring", stiffness: 300, damping: 15 },
// };

// // =================================================

// const Herosection = () => {
//   const router = useRouter();

//   return (
//     <section
//       id="home"
//       className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
//     >
//       {/* blobs */}
//       <div className="absolute inset-0 overflow-hidden">
//         {blobs.map((b, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full bg-gradient-to-br from-purple-300/30 to-pink-300/30"
//             style={{
//               width: b.w,
//               height: b.h,
//               left: b.left,
//               top: b.top,
//             }}
//             {...float(b.duration)}
//           />
//         ))}
//       </div>

//       {/* content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid md:grid-cols-2 gap-12 items-center">
//           {/* text */}
//           <div className="text-center md:text-left">
//             <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-700 rounded-full mb-4">
//               ✨ Where Learning Meets Fun! ✨
//             </span>

//             <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent font-bold">
//               Unlock Your Child's Potential!
//             </h1>

//             <p className="text-xl text-gray-700 mb-8 max-w-xl mx-auto md:mx-0">
//               Expert coaching programs designed to help kids excel academically,
//               build confidence, and discover their passions.
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//               {/* ✅ FIXED: go to formtrial page */}
//               <motion.button
//                 onClick={() => router.push("/Formtrial")}
//                 {...buttonHover}
//                 className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
//               >
//                 Start Free Trial
//               </motion.button>

//               <motion.button
//                 onClick={() => router.push("/LearnMore")}
//                 {...buttonHover}
//                 className="px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-full hover:bg-purple-50 transition-colors duration-300"
//               >
//                 Learn More
//               </motion.button>
//             </div>
//           </div>

//           {/* image */}
//           <div className="relative">
//             <motion.div
//               animate={{ y: [0, -20, 0] }}
//               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//               className="relative rounded-3xl overflow-hidden shadow-2xl"
//             >
//               <img
//                 src="https://images.unsplash.com/photo-1565373086464-c8af0d586c0c"
//                 alt="Happy children learning"
//                 className="w-full h-auto object-cover"
//               />
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
//             </motion.div>

//             <motion.div
//               {...iconFloat}
//               className="absolute top-[20%] -right-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-400"
//             >
//               <Sparkles className="w-8 h-8" />
//             </motion.div>

//             <motion.div
//               {...iconFloat}
//               className="absolute top-[45%] -left-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-pink-400"
//             >
//               <Heart className="w-8 h-8" />
//             </motion.div>

//             <motion.div
//               {...iconFloat}
//               className="absolute top-[70%] -right-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-400"
//             >
//               <Rocket className="w-8 h-8" />
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Herosection;



'use client'

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

const float = (duration = 10) => ({
  animate: { y: [0, -40, 30, 0], scale: [1, 1.08, 0.96, 1] },
  transition: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
});

const iconFloat = {
  animate: { rotate: [20, -20, 20], y: [0, -15, 0] },
  transition: { duration: 3, repeat: Infinity, ease: "linear" },
};

const blobs = [
  { w: 136, h: 104, left: "98%", top: "40%", duration: 22 },
  { w: 146, h: 390, left: "30%", top: "23%", duration: 15 },
  { w: 242, h: 383, left: "31%", top: "13%", duration: 10 },
  { w: 239, h: 283, left: "5%", top: "99%", duration: 6 },
  { w: 150, h: 267, left: "64%", top: "7%", duration: 8 },
];

const buttonHover = {
  whileHover: { scale: 1.05, y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 300, damping: 15 },
};

const Herosection = () => {
  const router = useRouter();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        {blobs.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-purple-300/30 to-pink-300/30"
            style={{ width: b.w, height: b.h, left: b.left, top: b.top }}
            {...float(b.duration)}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* TEXT CONTENT */}
          <div className="text-center md:text-left">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-700 rounded-full mb-4">
              ✨ Where Learning Meets Fun! ✨
            </span>

            {/* 🔥 MAIN SEO HEADING */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent font-bold">
              Best Coaching Centre for Kids in Baheri
            </h1>

            {/* SUB HEADING */}
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
              Unlock Your Child's Potential with Expert Teachers & Personalized Learning
            </h2>

            {/* SEO PARAGRAPH */}
            <p className="text-xl text-gray-700 mb-8 max-w-xl mx-auto md:mx-0">
              Excellent Coaching is a leading kids coaching center in Baheri offering maths tuition, English coaching, small batch learning, and confidence-building programs for academic success.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.button
                onClick={() => router.push("/Formtrial")}
                {...buttonHover}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                Start Free Trial
              </motion.button>

              <motion.button
                onClick={() => router.push("/LearnMore")}
                {...buttonHover}
                className="px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-full hover:bg-purple-50 transition-colors duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </div>

          {/* IMAGE */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1565373086464-c8af0d586c0c"
                alt="Kids studying in coaching center classroom in Bareilly"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            </motion.div>

            <motion.div {...iconFloat} className="absolute top-[20%] -right-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-400">
              <Sparkles className="w-8 h-8" />
            </motion.div>

            <motion.div {...iconFloat} className="absolute top-[45%] -left-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-pink-400">
              <Heart className="w-8 h-8" />
            </motion.div>

            <motion.div {...iconFloat} className="absolute top-[70%] -right-[10%] w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-400">
              <Rocket className="w-8 h-8" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Herosection;

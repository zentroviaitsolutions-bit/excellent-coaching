'use client'

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { Target, Users, Award, Smile ,Heart,Star,Rocket,Book, Router} from "lucide-react";

const values = [
  {
    title: "Passion for Kids",
    desc: "We genuinely care about each child's success and happiness",
    Icon: Heart,
    bg: "from-pink-400 to-pink-600",
  },
  {
    title: "Excellence",
    desc: "We maintain the highest standards in everything we do",
    Icon: Star,
    bg: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Innovation",
    desc: "We use cutting-edge teaching methods and technology",
    Icon: Rocket,
    bg: "from-blue-400 to-blue-600",
  },
  {
    title: "Continuous Learning",
    desc: "Our coaches are always learning and improving",
    Icon: Book,
    bg: "from-purple-400 to-purple-600",
  },
];
const features = [
  {
    title: "Goal-Oriented",
    desc: "We set clear, achievable goals for every child",
    Icon: Target,
    bg: "from-blue-400 to-blue-600",
    rotate: false,
  },
  {
    title: "Expert Coaches",
    desc: "Certified professionals who love working with kids",
    Icon: Users,
    bg: "from-purple-400 to-purple-600",
    rotate: false,
  },
  {
    title: "Proven Results",
    desc: "95% of our students improve within 3 months",
    Icon: Award,
    bg: "from-pink-400 to-pink-600",
    rotate: true,
  },
  {
    title: "Fun Learning",
    desc: "Engaging methods that make learning enjoyable",
    Icon: Smile,
    bg: "from-orange-400 to-orange-600",
    rotate: false,
  },
];

export default function AboutSection() {
  const router = useRouter();
  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
   <Navbar />
 <div className="pt-20">
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"
              style={{ transform: "rotate(71.55deg)" }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                About Excellent Coaching
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                We're more than just a coaching service—we're a community dedicated
                to helping children discover their potential and develop a lifelong
                love for learning.
              </p>
            </div>

            {/* Story */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
              <h2 className="text-3xl md:text-4xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 text-lg">
                <p>
                 Excellent coaching  was founded in 2020 with a simple mission: make learning fun, accessible, and effective for every child. Our founder, a former teacher and parent, saw firsthand how traditional one-size-fits-all education wasn't meeting the unique needs of individual children.
                </p>
                <p>
                  Today, we've helped over 500 children across various subjects and age groups. Our team of 50+ expert coaches brings together years of experience, genuine passion for teaching, and innovative methods that keep kids engaged and excited about learning.
                </p>
                <p>
                 Every child is different, and we celebrate that diversity. Whether your child needs help catching up, wants to get ahead, or is looking to explore a new interest, we're here to support their journey with personalized attention and proven teaching strategies.
                </p>
              </div>
            </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {features.map(({ title, desc, Icon, bg, rotate }, i) => (
        <div key={i} className="relative group">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
            
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center mb-6 shadow-lg`}
              style={rotate ? { transform: "rotate(-4.5deg)" } : undefined}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600">{desc}</p>
          </div>
        </div>
      ))}
    </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {[
                ["50+", "Happy Students"],
                ["4+", "Expert Coaches"],
                ["5+", "Programs"],
                ["95%", "Success Rate"],
              ].map(([num, label], i) => (
                <div
                  key={i}
                  className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6"
                >
                  <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {num}
                  </div>
                  <div className="text-gray-700">{label}</div>
                </div>
              ))}
            </div>
          <div className="mb-16">
      <h2 className="text-3xl md:text-4xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Our Core Values
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {values.map(({ title, desc, Icon, bg }, i) => (
          <div
            key={i}
            className="
              bg-white rounded-3xl p-6 shadow-lg
              flex items-start gap-4
              transition-all duration-300
              hover:-translate-y-2 hover:shadow-2xl
              group
            "
          >
            <div
              className={`
                w-14 h-14 rounded-2xl bg-gradient-to-br ${bg}
                flex items-center justify-center flex-shrink-0
                transition-transform duration-300
                group-hover:rotate-6
              `}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>

            <div>
              <h3 className="text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
            {/* CTA */}
            <div className="text-center">
              <button
               onClick={() => router.push("/Formtrial")}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg text-lg"
                tabIndex={0}
              >
                Join Our Community Today! →
              </button>
            </div>
          </div>
        </section>
      </div>

    </div>
   

     
      <Footer/>
    </>
  );
}

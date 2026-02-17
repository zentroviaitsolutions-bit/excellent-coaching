import React from 'react';
import { 
  Target, Users, Award, Smile, Heart, Star, Rocket, Book 
} from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blurred blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"
          style={{ transform: 'rotate(149.922deg)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            About KidsCoach
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            We're more than just a coaching service—we're a community dedicated to helping children discover their potential and develop a lifelong love for learning.
          </p>
        </div>

        {/* Our Story card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
          <h2 className="text-3xl md:text-4xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              Excellent Coaching was founded in 2020 with a simple mission: make learning fun, accessible, and effective for every child. Our founder, a former teacher and parent, saw firsthand how traditional one-size-fits-all education wasn't meeting the unique needs of individual children.
            </p>
            <p>
              Today, we've helped over 500 children across various subjects and age groups. Our team of 50+ expert coaches brings together years of experience, genuine passion for teaching, and innovative methods that keep kids engaged and excited about learning.
            </p>
            <p>
              Every child is different, and we celebrate that diversity. Whether your child needs help catching up, wants to get ahead, or is looking to explore a new interest, we're here to support their journey with personalized attention and proven teaching strategies.
            </p>
          </div>
        </div>

        {/* Core Strengths / Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="relative group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3 font-semibold">Goal-Oriented</h3>
              <p className="text-gray-600">We set clear, achievable goals for every child</p>
            </div>
          </div>

          <div className="relative group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3 font-semibold">Expert Coaches</h3>
              <p className="text-gray-600">Certified professionals who love working with kids</p>
            </div>
          </div>

          <div className="relative group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-6 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3 font-semibold">Proven Results</h3>
              <p className="text-gray-600">95% of our students improve within 3 months</p>
            </div>
          </div>

          <div className="relative group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6 shadow-lg">
                <Smile className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3 font-semibold">Fun Learning</h3>
              <p className="text-gray-600">Engaging methods that make learning enjoyable</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 shadow-lg flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-gray-900 mb-2 font-semibold">Passion for Kids</h3>
                <p className="text-gray-600">We genuinely care about each child's success and happiness</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-gray-900 mb-2 font-semibold">Excellence</h3>
                <p className="text-gray-600">We maintain the highest standards in everything we do</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-gray-900 mb-2 font-semibold">Innovation</h3>
                <p className="text-gray-600">We use cutting-edge teaching methods and technology</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Book className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-gray-900 mb-2 font-semibold">Continuous Learning</h3>
                <p className="text-gray-600">Our coaches are always learning and improving</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 font-bold">
              500+
            </div>
            <div className="text-gray-700">Happy Students</div>
          </div>

          <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 font-bold">
              50+
            </div>
            <div className="text-gray-700">Expert Coaches</div>
          </div>

          <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 font-bold">
              10+
            </div>
            <div className="text-gray-700">Programs</div>
          </div>

          <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 font-bold">
              95%
            </div>
            <div className="text-gray-700">Success Rate</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg text-lg font-semibold hover:shadow-xl hover:brightness-105 transition-all">
            Join Our Community Today! →
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
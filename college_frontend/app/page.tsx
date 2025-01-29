"use client"

import { useEffect, useState } from "react"
import Header from "./components/Header"
import { MapPin, Clock, BookOpen, ArrowUp } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Lottie from "react-lottie-player"
import teachingAnimation from "./assets/teaching-animation.json" // Import the Lottie file

export default function Home() {
  const controls = useAnimation()
  const [ref, inView] = useInView()
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2 mb-8 md:mb-0"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find Your Perfect College: Simplified Counseling for JEE Aspirants
              </h1>
              <p className="text-xl mb-8">
                Make informed decisions about your future with our personalized college recommendations.
              </p>
            </motion.div>
            <div className="md:w-1/2 flex justify-center items-center">
              {}
              <Lottie
                animationData={teachingAnimation}
                play
                loop
                className="w-65 h-65"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
            <motion.div
              ref={ref}
              animate={controls}
              initial="hidden"
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 50 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <MapPin size={48} className="text-blue-600 mb-4" />,
                  title: "Personalized College Recommendations",
                  description: "Get tailored suggestions based on your preferences and JEE score.",
                },
                {
                  icon: <Clock size={48} className="text-blue-600 mb-4" />,
                  title: "Save Time with Filters",
                  description: "Quickly narrow down your options using our efficient filtering system.",
                },
                {
                  icon: <BookOpen size={48} className="text-blue-600 mb-4" />,
                  title: "Make Informed Decisions",
                  description: "Access comprehensive information to choose the best college for your future.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center"
                >
                  {benefit.icon}
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
        </div>
      </footer>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </div>
  )
}

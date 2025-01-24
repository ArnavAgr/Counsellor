"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../components/Header"

export default function FilterPage() {
  const [location, setLocation] = useState("")
  const [fees, setFees] = useState("")
  const [distance, setDistance] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/results?location=${location}&fees=${fees}&distance=${distance}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Find Your Ideal College</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="location" className="block mb-2 font-semibold text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city or state"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="fees" className="block mb-2 font-semibold text-gray-700">
              Fees Range
            </label>
            <select
              id="fees"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select fees range</option>
              <option value="low">Low (&#60; 1 Lakh)</option>
              <option value="medium">Medium (1–3 Lakhs)</option>
              <option value="high">High (&#62; 3 Lakhs)</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="distance" className="block mb-2 font-semibold text-gray-700">
              Distance
            </label>
            <select
              id="distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select distance range</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
              <option value="50">Within 50 km</option>
              <option value="state">Entire State</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Show Results
          </button>
        </form>
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


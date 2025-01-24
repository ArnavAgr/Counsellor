import Header from "../components/Header"
import Link from "next/link"
import { Star, MapPin, DollarSign } from "lucide-react"

// Mock data for demonstration purposes
const mockResults = [
  { id: 1, name: "IIT Delhi", fees: "High", distance: "15 km", rating: 4.9 },
  { id: 2, name: "NIT Trichy", fees: "Medium", distance: "30 km", rating: 4.7 },
  { id: 3, name: "BITS Pilani", fees: "High", distance: "5 km", rating: 4.8 },
  { id: 4, name: "VIT Vellore", fees: "Medium", distance: "25 km", rating: 4.5 },
  { id: 5, name: "SRM University", fees: "Low", distance: "10 km", rating: 4.3 },
]

export default function ResultsPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { location, fees, distance } = searchParams

  // In a real application, you would use these parameters to fetch results from an API
  console.log("Search params:", { location, fees, distance })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Colleges Matching Your Criteria</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockResults.map((college) => (
            <div key={college.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{college.name}</h2>
              <div className="flex items-center mb-2">
                <DollarSign size={16} className="text-gray-600 mr-2" />
                <span className="text-gray-600">Fees: {college.fees}</span>
              </div>
              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-600 mr-2" />
                <span className="text-gray-600">Distance: {college.distance}</span>
              </div>
              <div className="flex items-center mb-4">
                <Star size={16} className="text-yellow-400 mr-2" />
                <span className="text-gray-600">Rating: {college.rating}</span>
              </div>
              <Link
                href="#"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 inline-block"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300">
            Load More
          </button>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


"use client" // Ensures this page is rendered only on the client

import { useEffect, useState, useCallback } from "react" // Add useCallback
import { useRouter } from "next/navigation"
import { getCities, getBranches, rankColleges, getStates } from "../services/api.js" // Update to reference api.js
import Header from "../components/Header"

interface City {
  id: string // Add id to interface
  name: string
  latitude: number
  longitude: number
}

interface Branch {
  name: string
}

interface Result {
  institute: string
  branch: string
  closing_rank: number
  composite_score: number
  fees?: number
  distance?: number
  nirf_ranking?: number
}

export default function FilterPage() {
  const [cities, setCities] = useState<City[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [maxFees, setMaxFees] = useState<number>(300000)
  const [maxDistance, setMaxDistance] = useState<number>(5000)
  const [selectedBranchName, setSelectedBranchName] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInstitutionTypes, setSelectedInstitutionTypes] = useState<string[]>(["NIT"]) // Change to array of strings
  const [selectedCategory, setSelectedCategory] = useState<string>("OPEN")
  const [selectedGender, setSelectedGender] = useState<string>("Gender-Neutral")
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useCustomWeights, setUseCustomWeights] = useState<boolean>(false)
  const [weights, setWeights] = useState({
    rank: 0.7,
    fees: 0.3,
    distance: 0.2,
    nirf: 0.4
  })
  const [states, setStates] = useState<string[]>([])
  const [selectedHomeState, setSelectedHomeState] = useState<string>("")
  const [results] = useState<Result[]>([]) // Remove setResults as it's not used
  const router = useRouter()

  // Ensure this component runs only on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function fetchCities() {
      try {
        const citiesData = await getCities()
        console.log("Fetched cities:", citiesData) // Add this for debugging
        const sortedCities = Array.isArray(citiesData) ? citiesData.sort((a, b) => a.name.localeCompare(b.name)) : []
        setCities(sortedCities)
      } catch (error) {
        console.error("Error fetching cities:", error)
        setCities([])
      }
    }
    fetchCities()
  }, []) // Remove selectedInstitutionType dependency since cities are same for both

  // Move fetchBranches into useCallback
  const fetchBranches = useCallback(async () => {
    try {
      const branchesData = await getBranches(selectedInstitutionTypes)
      console.log("Fetched branches:", branchesData) // Debug log
      setBranches(Array.isArray(branchesData) ? branchesData : [])
    } catch (error) {
      console.error("Error fetching branches:", error)
      setBranches([])
    }
  }, [selectedInstitutionTypes]) // Add dependency

  // Update the fetchStates function to use the API service
  const fetchStates = async () => {
    try {
      const statesData = await getStates();
      console.log("Fetched states:", statesData); // Debug log
      setStates(Array.isArray(statesData) ? statesData : []);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    }
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    setShowDropdown(false); // Hide dropdown after selection
  };

  // Update useEffect to use memoized fetchBranches
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  useEffect(() => {
    if (selectedInstitutionTypes.includes('NIT') || selectedInstitutionTypes.includes('NIT+IIIT')) {
      fetchStates()
    } else {
      setStates([])
      setSelectedHomeState("")
    }
  }, [selectedInstitutionTypes])

  // Add requirement flag for home state
  const requiresHomeState = selectedInstitutionTypes.includes('NIT') || selectedInstitutionTypes.includes('NIT+IIIT');

  const handleInstitutionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSelectedInstitutionTypes([value]) // Only allow one selection
    // Reset home state when changing institution type
    if (!['NIT', 'NIT+IIIT'].includes(value)) {
      setSelectedHomeState("");
    }
  }

  const handleRankColleges = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Add validation for home state
    if (requiresHomeState && !selectedHomeState) {
      setError("Home state must be selected for NIT/NIT+IIIT")
      return
    }
    if (selectedOptions.includes("Distance") && selectedCityName === null) {
      setError("City must be selected if Distance is chosen")
      return
    }

    setIsLoading(true)
    setError(null)

    const relevantWeights = {
      rank: weights.rank,
      ...(selectedOptions.includes('Fees') ? { fees: weights.fees } : {}),
      ...(selectedOptions.includes('Distance') ? { distance: weights.distance } : {}),
      ...(selectedOptions.includes('NIRF') ? { nirf: weights.nirf } : {})
    }

    // Update the handleRankColleges data to include home_state
    const data = {
      institution_types: selectedInstitutionTypes,
      city: selectedCityName,
      options: selectedOptions,
      branch_name: selectedBranchName,
      category: selectedCategory,
      gender: selectedGender,
      useCustomWeights,
      home_state: selectedHomeState || undefined,  // Include home state in request
      weights: useCustomWeights ? relevantWeights : undefined,
      ...(selectedOptions.includes('Fees') && { max_fees: maxFees }),
      ...(selectedOptions.includes('Distance') && { max_distance: maxDistance })
    }

    try {
      const response = await rankColleges(data)
      if (response.error) {
        setError(response.error)
        return
      }
      router.push(`/results?filters=${encodeURIComponent(JSON.stringify(data))}`)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError("Request timed out. Please try again.")
      } else {
        setError(error instanceof Error ? error.message : "An error occurred")
      }
      console.error("Error fetching results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) return null // Prevents hydration issues

  // Add a helper function at the component level
  const handleWeightChange = (field: keyof typeof weights, value: string) => {
    const numValue = parseFloat(value)
    // Only update if it's a valid number, otherwise set to 0
    setWeights(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Find Your Ideal College</h1>
        <form
          onSubmit={handleRankColleges}
          className="w-full bg-white p-8 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Select Institution Type</label>
            <div className="flex flex-col space-y-2">
              {["IIT", "NIT", "IIIT", "NIT+IIIT"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    value={type}
                    checked={selectedInstitutionTypes.includes(type)}
                    onChange={handleInstitutionTypeChange}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          {requiresHomeState && (
            <div className="mb-4">
              <label htmlFor="homeState" className="block mb-2 font-semibold text-gray-700">
                Select Home State
              </label>
              <select
                id="homeState"
                value={selectedHomeState}
                onChange={(e) => setSelectedHomeState(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={requiresHomeState}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
  {}
  <div className="relative">
    <label htmlFor="city" className="block mb-2 font-semibold text-gray-700">
      Select City
    </label>
    <input
      type="text"
      value={selectedCityName || ""}
      onChange={(e) => {
        setSelectedCityName(e.target.value);
        setShowDropdown(true); 
      }}
      onFocus={() => setShowDropdown(true)}
      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      placeholder="Search city..."
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {showDropdown && (
      <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
        {cities
          .filter((city) => city.name.toLowerCase().includes(selectedCityName?.toLowerCase() || ""))
          .map((city) => (
            <li
              key={city.id}
              onMouseDown={() => handleCitySelect(city.name)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              {city.name}
            </li>
          ))}
      </ul>
    )}
  </div>

  {/* Category Selection */}
  <div>
    <label htmlFor="category" className="block mb-2 font-semibold text-gray-700">
      Select Category
    </label>
    <select
      id="category"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    >
      <option value="OPEN">OPEN</option>
      <option value="OPEN (PwD)">OPEN (PwD)</option>
      <option value="EWS">EWS</option>
      <option value="EWS (PwD)">EWS (PwD)</option>
      <option value="OBC-NCL">OBC-NCL</option>
      <option value="OBC-NCL (PwD)">OBC-NCL (PwD)</option>
      <option value="SC">SC</option>
      <option value="SC (PwD)">SC (PwD)</option>
      <option value="ST">ST</option>
      <option value="ST (PwD)">ST (PwD)</option>
    </select>
  </div>
</div>

          <div className="mb-4">
            <label htmlFor="gender" className="block mb-2 font-semibold text-gray-700">
              Select Gender
            </label>
            <select
              id="gender"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
              required
            >
              <option value="Gender-Neutral">Gender-Neutral</option>
              <option value="Female-only (including Supernumerary)">Female-only (including Supernumerary)</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="maxFees" className="block mb-2 font-semibold text-gray-700">
              Max Fees
            </label>
            <input
              type="range"
              min="0"
              max="300000"
              step="1000"
              value={maxFees}
              onChange={(e) => setMaxFees(Number(e.target.value))}
              className="w-full"
            />
            <span>₹{maxFees.toLocaleString("en-IN")}</span>
          </div>
          <div className="mb-4">
            <label htmlFor="maxDistance" className="block mb-2 font-semibold text-gray-700">
              Max Distance
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="10"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full"
            />
            <span>{maxDistance} km</span>
          </div>
          <div className="mb-4">
            <label htmlFor="branch" className="block mb-2 font-semibold text-gray-700">
              Select Branch
            </label>
            <select
              onChange={(e) => setSelectedBranchName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              <option value="" key="default-branch">
                Select Branch
              </option>
              {branches && branches.length > 0 ? (
                branches.map((branch: Branch) => (
                  <option key={`branch-${branch.name}`} value={branch.name}>
                    {branch.name}
                  </option>
                ))
              ) : (
                <option value="" key="loading-branch">
                  Loading branches...
                </option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Options</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Fees"
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedOptions((prev) =>
                      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value],
                    )
                  }}
                />
                <span className="ml-2">Fees</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Distance"
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedOptions((prev) =>
                      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value],
                    )
                  }}
                />
                <span className="ml-2">Distance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="NIRF"
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedOptions((prev) =>
                      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value],
                    )
                  }}
                />
                <span className="ml-2">NIRF Ranking</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
  <label className="block mb-2 font-semibold text-gray-700">Weightage Options</label>
  <div className="space-y-4">
    <div className="flex items-center">
      <input
        type="radio"
        id="predefinedWeights"
        name="weightOption"
        checked={!useCustomWeights}
        onChange={() => setUseCustomWeights(false)}
        className="mr-2"
      />
      <label htmlFor="predefinedWeights">Use Predefined Weights</label>
    </div>
    <div className="flex items-center">
      <input
        type="radio"
        id="customWeights"
        name="weightOption"
        checked={useCustomWeights}
        onChange={() => setUseCustomWeights(true)}
        className="mr-2"
      />
      <label htmlFor="customWeights">Use Custom Weights</label>
    </div>
    {useCustomWeights && (
      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-4">
          Note: The sum of all weights must equal 1.<br></br>
          Current sum: {
            (weights.rank +
             (selectedOptions.includes('Fees') ? weights.fees : 0) +
             (selectedOptions.includes('Distance') ? weights.distance : 0) +
             (selectedOptions.includes('NIRF') ? weights.nirf : 0)
            ).toFixed(2)
          }
        </p>
        <div>
          <label htmlFor="rankWeight" className="block mb-1">Rank Weight (Required)</label>
          <input
            type="number"
            id="rankWeight"
            value={weights.rank.toString()}
            onChange={(e) => handleWeightChange('rank', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            step="0.1"
            min="0"
            max="1"
            required
          />
        </div>
        {selectedOptions.includes('Fees') && (
          <div>
            <label htmlFor="feesWeight" className="block mb-1">Fees Weight</label>
            <input
              type="number"
              id="feesWeight"
              value={weights.fees.toString()}
              onChange={(e) => handleWeightChange('fees', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
        )}
        {selectedOptions.includes('Distance') && (
          <div>
            <label htmlFor="distanceWeight" className="block mb-1">Distance Weight</label>
            <input
              type="number"
              id="distanceWeight"
              value={weights.distance.toString()}
              onChange={(e) => handleWeightChange('distance', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
        )}
        {selectedOptions.includes('NIRF') && (
          <div>
            <label htmlFor="nirfWeight" className="block mb-1">NIRF Weight</label>
            <input
              type="number"
              id="nirfWeight"
              value={weights.nirf.toString()}
              onChange={(e) => handleWeightChange('nirf', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
        )}
      </div>
    )}
  </div>
</div>
          <button
            type="submit"
            className="col-span-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Rank Colleges"}
          </button>
          {error && <div className="col-span-full mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        </form>
        <div className="mt-8 overflow-x-auto">
          {results.length > 0 && (
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr>
                  <th className="border p-2">Institute</th>
                  <th className="border p-2">Branch</th>
                  <th className="border p-2">Closing Rank</th>
                  {selectedOptions.includes("Distance") && <th className="border p-2">Distance (km)</th>}
                  {selectedOptions.includes("Fees") && <th className="border p-2">Fees</th>}
                  {selectedOptions.includes("NIRF") && <th className="border p-2">NIRF Ranking</th>}
                  <th className="border p-2">Composite Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result: Result) => ( // Add type annotation for result parameter
                  <tr key={`${result.institute}-${result.branch}`}>
                    <td className="border p-2">{result.institute}</td>
                    <td className="border p-2">{result.branch}</td>
                    <td className="border p-2">{result.closing_rank}</td>
                    {selectedOptions.includes("Distance") && <td className="border p-2">{result.distance}</td>}
                    {selectedOptions.includes("Fees") && <td className="border p-2">{result.fees}</td>}
                    {selectedOptions.includes("NIRF") && <td className="border p-2">{result.nirf_ranking}</td>}
                    <td className="border p-2">{result.composite_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

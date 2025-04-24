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
  highest_package?: number;
  average_package?: number;
  placement_percentage?: number;
}

export default function FilterPage() {
  const [cities, setCities] = useState<City[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [maxFees] = useState<number>(300000) // Remove setter if not used
  const [maxDistance] = useState<number>(5000) // Remove setter if not used
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
    nirf: 0.4,
    highest_package: 0.3,
    average_package: 0.3,
    placement_percentage: 0.3
  })
  const [states, setStates] = useState<string[]>([])
  const [selectedHomeState, setSelectedHomeState] = useState<string>("")
  const [results] = useState<Result[]>([]) // Remove setResults as it's not used
  const [displayOptions, setDisplayOptions] = useState<string[]>([]);
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

  // Update the useEffect for fetching states to include GFTI
  useEffect(() => {
    if (selectedInstitutionTypes.some(type => ['NIT', 'GFTI', 'NIT+IIIT'].includes(type))) {
      fetchStates()
    } else {
      setStates([])
      setSelectedHomeState("")
    }
  }, [selectedInstitutionTypes])

  // Update the requirement flag for home state to include GFTI
  const requiresHomeState = selectedInstitutionTypes.some(type => 
    ['NIT', 'GFTI', 'NIT+IIIT'].includes(type)
  );

  // Update the handler to work with direct value instead of event
  const handleInstitutionTypeChange = (type: string) => {
    setSelectedInstitutionTypes([type]) // Only allow one selection
    // Reset home state when changing institution type to non-home state requiring type
    if (!['NIT', 'GFTI', 'NIT+IIIT'].includes(type)) {
      setSelectedHomeState("");
    }
  }

  const handleRankColleges = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Add validation for Distance in both ranking and display options
    if ((selectedOptions.includes("Distance") || displayOptions.includes("Distance")) && !selectedCityName) {
      setError("Please select a city to view distance information")
      return
    }

    // Update validation for home state to include GFTI
    if (requiresHomeState && !selectedHomeState) {
      setError("Home state must be selected for NIT/GFTI/NIT+IIIT")
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
      ...(selectedOptions.includes('NIRF') ? { nirf: weights.nirf } : {}),
      ...(selectedOptions.includes('Highest_Package') ? { highest_package: weights.highest_package } : {}),
      ...(selectedOptions.includes('Average_Package') ? { average_package: weights.average_package } : {}),
      ...(selectedOptions.includes('Placement_Percentage') ? { placement_percentage: weights.placement_percentage } : {})
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
      ...(selectedOptions.includes('Distance') && { max_distance: maxDistance }),
      displayOptions,  // Add displayOptions to the request data
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

  // Replace the old handleDisplayOptionChange with this simpler version
  const handleDisplayOptionChange = (value: string) => {
    setDisplayOptions(prev =>
      prev.includes(value) 
        ? prev.filter(option => option !== value)
        : [...prev, value]
    );
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-8 text-center">Find Your Ideal College</h1>
        
        <form
          onSubmit={handleRankColleges}
          className="w-full bg-white p-8 rounded-lg shadow-md"
        >
          {/* Main form container with improved layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="text-l font-semibold mb-4 pb-2 border-b border-gray-200">Institution & Location</h2>
                
                {/* Institution Type Section */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Institution Type<span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["IIT", "NIT", "IIIT", "GFTI", "NIT+IIIT"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInstitutionTypeChange(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedInstitutionTypes.includes(type)
                            ? "bg-blue-600 text-white shadow-md transform scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Home State Section - Conditionally rendered */}
                {requiresHomeState && (
                  <div className="mb-6">
                    <label htmlFor="homeState" className="text-sm block mb-2 font-semibold text-gray-700">
                      Select Home State<span className="text-red-500">*</span>
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

                {/* City Selection */}
                <div className="mb-6">
                  <label htmlFor="city" className="text-sm block mb-2 font-semibold text-gray-700">
                    Select City
                  </label>
                  <div className="relative">
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
                </div>
              </div>

              {/* Personal Criteria Section */}
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="text-l font-semibold mb-4 pb-2 border-b border-gray-200">Personal Criteria</h2>
                
                {/* Category Selection */}
                <div className="mb-6">
                  <label htmlFor="category" className="block mb-2 font-semibold text-gray-700 text-sm">
                    Select Category<span className="text-red-500">*</span>
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

                {/* Gender Selection */}
                <div className="mb-6">
                  <label htmlFor="gender" className="block mb-2 font-semibold text-gray-700 text-sm">
                    Select Gender<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Gender-Neutral">Gender-Neutral</option>
                    <option value="Female-only (including Supernumerary)">Female-only (including Supernumerary)</option>
                  </select>
                </div>

                {/* Branch Selection */}
                <div className="mb-6">
                  <label htmlFor="branch" className="text-sm block mb-2 font-semibold text-gray-700">
                    Select Branch
                  </label>
                  <select
                    id="branch"
                    onChange={(e) => setSelectedBranchName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>
            </div>
            
            {/* Middle Column - Options */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="text-l font-semibold mb-4 pb-2 border-b border-gray-200">Ranking & Display Options</h2>
                
                {/* Ranking Options */}
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">Ranking Options</label>
                  <p className="text-xs text-gray-600 mb-3">These options will be used in calculating the composite score</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "Fees", label: "Fees" },
                      { value: "Distance", label: "Distance" },
                      { value: "NIRF", label: "NIRF Ranking" },
                      { value: "Highest_Package", label: "Highest Package" },
                      { value: "Average_Package", label: "Average Package" },
                      { value: "Placement_Percentage", label: "Placement Percentage" }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center p-2 rounded hover:bg-gray-100 border border-gray-100">
                        <input
                          type="checkbox"
                          value={value}
                          checked={selectedOptions.includes(value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedOptions(prev =>
                              prev.includes(value) 
                                ? prev.filter(option => option !== value)
                                : [...prev, value]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Display Options */}
                <div className="mb-6">
                  <label className="text-sm block mb-2 font-semibold text-gray-700">Display Options</label>
                  <p className="text-xs text-gray-600 mb-3">
                    These options will only affect what columns are shown in results.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "Fees", label: "Fees" },
                      { value: "Distance", label: "Distance", requiresCity: true },
                      { value: "NIRF", label: "NIRF Ranking" },
                      { value: "Highest_Package", label: "Highest Package" },
                      { value: "Average_Package", label: "Average Package" },
                      { value: "Placement_Percentage", label: "Placement Percentage" }
                    ].map(({ value, label, requiresCity }) => (
                      <label key={value} className="flex items-center p-2 rounded hover:bg-gray-100 border border-gray-100">
                        <input
                          type="checkbox"
                          value={value}
                          checked={displayOptions.includes(value)}
                          onChange={(e) => handleDisplayOptionChange(e.target.value)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700">
                          {label}
                          {requiresCity && (
                            <span className="text-xs text-gray-500 ml-2"></span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Weightage */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="text-l font-semibold mb-4 pb-2 border-b border-gray-200">Weightage Options</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="predefinedWeights"
                      name="weightOption"
                      checked={!useCustomWeights}
                      onChange={() => setUseCustomWeights(false)}
                      className="mr-2"
                    />
                    <label htmlFor="predefinedWeights" className="text-sm">Use Predefined Weights</label>
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
                    <label htmlFor="customWeights" className="text-sm">Use Custom Weights</label>
                  </div>
                  
                  {useCustomWeights && (
                    <div className="space-y-4 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">
                        Note: The sum of all weights must equal 1.<br></br>
                        Current sum: {
                          (weights.rank +
                          (selectedOptions.includes('Fees') ? weights.fees : 0) +
                          (selectedOptions.includes('Distance') ? weights.distance : 0) +
                          (selectedOptions.includes('NIRF') ? weights.nirf : 0) +
                          (selectedOptions.includes('Highest_Package') ? weights.highest_package : 0) +
                          (selectedOptions.includes('Average_Package') ? weights.average_package : 0) +
                          (selectedOptions.includes('Placement_Percentage') ? weights.placement_percentage : 0)
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
                      
                      {/* Dynamically show weight inputs based on selected options */}
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
                      
                      {selectedOptions.includes('Highest_Package') && (
                        <div>
                          <label htmlFor="highestPackageWeight" className="block mb-1">Highest Package Weight</label>
                          <input
                            type="number"
                            id="highestPackageWeight"
                            value={weights.highest_package.toString()}
                            onChange={(e) => handleWeightChange('highest_package', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            step="0.1"
                            min="0"
                            max="1"
                          />
                        </div>
                      )}
                      
                      {selectedOptions.includes('Average_Package') && (
                        <div>
                          <label htmlFor="averagePackageWeight" className="block mb-1">Average Package Weight</label>
                          <input
                            type="number"
                            id="averagePackageWeight"
                            value={weights.average_package.toString()}
                            onChange={(e) => handleWeightChange('average_package', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            step="0.1"
                            min="0"
                            max="1"
                          />
                        </div>
                      )}
                      
                      {selectedOptions.includes('Placement_Percentage') && (
                        <div>
                          <label htmlFor="placementPercentageWeight" className="block mb-1">Placement Percentage Weight</label>
                          <input
                            type="number"
                            id="placementPercentageWeight"
                            value={weights.placement_percentage.toString()}
                            onChange={(e) => handleWeightChange('placement_percentage', e.target.value)}
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
            </div>
            
            {/* Submit Button - Full Width */}
            <div className="lg:col-span-12">
              {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Rank Colleges"}
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-8 overflow-x-auto">
          {results.length > 0 && (
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr>
                  <th className="border p-2">Institute</th>
                  <th className="border p-2">Branch</th>
                  <th className="border p-2">Closing Rank</th>
                  {selectedOptions.includes("Distance") && <th className="border p-0 text-xs">Distance (km)</th>}
                  {selectedOptions.includes("Fees") && <th className="border p-0 text-xs">Fees</th>}
                  {selectedOptions.includes("NIRF") && <th className="border p-0 text-xs">NIRF Ranking</th>}
                  {selectedOptions.includes("Highest_Package") && <th className="border p-0 text-xs">Highest Package</th>}
                  {selectedOptions.includes("Average_Package") && <th className="border p-0 text-xs">Average Package</th>}
                  {selectedOptions.includes("Placement_Percentage") && <th className="border p-0 text-xs">Placement Percentage</th>}
                  <th className="border p-2">Composite Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result: Result) => (
                  <tr key={`${result.institute}-${result.branch}`}>
                    <td className="border p-2">{result.institute}</td>
                    <td className="border p-2">{result.branch}</td>
                    <td className="border p-2">{result.closing_rank}</td>
                    {selectedOptions.includes("Distance") && <td className="border p-2">{result.distance}</td>}
                    {selectedOptions.includes("Fees") && <td className="border p-2">{result.fees}</td>}
                    {selectedOptions.includes("NIRF") && <td className="border p-2">{result.nirf_ranking}</td>}
                    {selectedOptions.includes("Highest_Package") && <td className="border p-2">{result.highest_package}</td>}
                    {selectedOptions.includes("Average_Package") && <td className="border p-2">{result.average_package}</td>}
                    {selectedOptions.includes("Placement_Percentage") && <td className="border p-2">{result.placement_percentage}</td>}
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
          <p>&copy; 2025 JEE College Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

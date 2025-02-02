"use client"; // Ensures this page is rendered only on the client

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCities, getBranches, rankColleges } from "../services/api";
import Header from "../components/Header";

interface City {
  id: number;
  name: string;
  // Additional fields if needed
}

interface Branch {
  name: string;
}

interface Result {
  institute: string;
  branch: string;
  closing_rank: number;
  composite_score: number;
  fees?: number;
  distance?: number;
}

export default function FilterPage() {
  // Data lists
  const [cities, setCities] = useState<City[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Selected values and search queries
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState<string>("");
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);
  
  const [branchSearchQuery, setBranchSearchQuery] = useState<string>("");
  const [selectedBranchName, setSelectedBranchName] = useState<string>("");
  const [showBranchSuggestions, setShowBranchSuggestions] = useState<boolean>(false);
  
  // Use checkboxes for Institution Type (multiple allowed)
  const [selectedInstitutionTypes, setSelectedInstitutionTypes] = useState<string[]>(["NIT"]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("OPEN");
  const [selectedGender, setSelectedGender] = useState<string>("Gender-Neutral");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [maxFees, setMaxFees] = useState<number>(300000);
  const [maxDistance, setMaxDistance] = useState<number>(5000);
  
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Ensure this component runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch cities on mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const citiesData = await getCities();
        console.log("Fetched cities:", citiesData);
        const citiesArray = Array.isArray(citiesData)
          ? citiesData
          : citiesData?.cities || [];
        // Sort cities alphabetically
        setCities(citiesArray.sort((a: City, b: City) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
    }
    fetchCities();
  }, []);

  // Fetch branches when institution types change
  useEffect(() => {
    async function fetchBranches() {
      try {
        let allBranches: Branch[] = [];
        for (const instType of selectedInstitutionTypes) {
          const branchesData = await getBranches(instType);
          const branchesArray = Array.isArray(branchesData)
            ? branchesData
            : branchesData?.branches || [];
          allBranches = [...allBranches, ...branchesArray];
        }
        // Remove duplicate branches (by name)
        const uniqueBranches = Array.from(new Map(allBranches.map((b) => [b.name, b])).values());
        setBranches(uniqueBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      }
    }
    fetchBranches();
  }, [selectedInstitutionTypes]);

  // Filter suggestions for cities based on search query
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Filter suggestions for branches based on search query
  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const handleRankColleges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCityId === null) {
      setError("Please select a city.");
      return;
    }
    setIsLoading(true);
    setError(null);
    // IMPORTANT: Using the key "max_distance" instead of "distance"
    const data = {
      institution_types: selectedInstitutionTypes, // send as array
      city: citySearchQuery, // active search text used as the city
      options: selectedOptions,
      max_fees: maxFees,
      max_distance: maxDistance, // key: max_distance
      branch_name: selectedBranchName,
      category: selectedCategory,
      gender: selectedGender,
    };
    try {
      const response = await rankColleges(data);
      if (response.error) {
        setError(response.error);
        return;
      }
      router.push(`/results?filters=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (error) {
      console.error("Error fetching results:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null; // Prevent hydration issues

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6">Find Your Ideal College</h1>
          <form onSubmit={handleRankColleges} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institution Type Checkboxes */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Institution Type</label>
              <div className="flex space-x-4">
                {["NIT", "IIIT", "IIT"].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      value={type}
                      checked={selectedInstitutionTypes.includes(type)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedInstitutionTypes((prev) => [...prev, value]);
                        } else {
                          setSelectedInstitutionTypes((prev) => prev.filter((item) => item !== value));
                        }
                        // Reset branch selection when institution types change
                        setSelectedBranchName("");
                      }}
                      className="mr-1"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
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

            {/* Gender */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="Gender-Neutral">Gender-Neutral</option>
                <option value="Female-only (including Supernumerary)">
                  Female-only (including Supernumerary)
                </option>
              </select>
            </div>

            {/* Active Search for City */}
            <div className="relative">
              <label className="font-semibold mb-1">City</label>
              <input
                type="text"
                placeholder="Type to search city..."
                value={citySearchQuery}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                className="w-full px-3 py-2 border rounded-md"
              />
              {showCitySuggestions && citySearchQuery && filteredCities.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto">
                  {filteredCities.map((city: City) => (
                    <li
                      key={city.id}
                      onClick={() => {
                        setCitySearchQuery(city.name);
                        setSelectedCityId(city.id);
                        setShowCitySuggestions(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Active Search for Branch */}
            <div className="relative">
              <label className="font-semibold mb-1">Branch</label>
              <input
                type="text"
                placeholder="Type to search branch..."
                value={branchSearchQuery}
                onChange={(e) => {
                  setBranchSearchQuery(e.target.value);
                  setShowBranchSuggestions(true);
                }}
                onFocus={() => setShowBranchSuggestions(true)}
                className="w-full px-3 py-2 border rounded-md"
              />
              {showBranchSuggestions && branchSearchQuery && filteredBranches.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto">
                  {filteredBranches.map((branch: Branch) => (
                    <li
                      key={branch.name}
                      onClick={() => {
                        setBranchSearchQuery(branch.name);
                        setSelectedBranchName(branch.name);
                        setShowBranchSuggestions(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                    >
                      {branch.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fees */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Max Fees</label>
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

            {/* Distance */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Max Distance (km)</label>
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

            {/* Options */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Options</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Fees"
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedOptions((prev) =>
                        prev.includes(value)
                          ? prev.filter((option) => option !== value)
                          : [...prev, value]
                      );
                    }}
                  />
                  <span className="ml-2">Fees</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="Distance"
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedOptions((prev) =>
                        prev.includes(value)
                          ? prev.filter((option) => option !== value)
                          : [...prev, value]
                      );
                    }}
                  />
                  <span className="ml-2">Distance</span>
                </label>
              </div>
            </div>

            {/* Submit Button - spanning full width */}
            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Rank Colleges"}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

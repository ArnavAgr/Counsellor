"use client"; // Ensures this page is rendered only on the client

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCities, getBranches, rankColleges } from "../services/api";
import Header from "../components/Header";

interface City {
    id: string;  // Add id to interface
    name: string;
    latitude: number;
    longitude: number;
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
    const [cities, setCities] = useState<City[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [selectedCityName, setSelectedCityName] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [maxFees, setMaxFees] = useState<number>(300000);
    const [maxDistance, setMaxDistance] = useState<number>(5000);
    const [selectedBranchName, setSelectedBranchName] = useState<string>('');
    const [selectedInstitutionTypes, setSelectedInstitutionTypes] = useState<string[]>(['NIT']); // Change to array of strings
    const [selectedCategory, setSelectedCategory] = useState<string>('OPEN');
    const [selectedGender, setSelectedGender] = useState<string>('Gender-Neutral');
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Ensure this component runs only on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        async function fetchCities() {
            try {
                const citiesData = await getCities();
                console.log('Fetched cities:', citiesData); // Add this for debugging
                const sortedCities = Array.isArray(citiesData) ? citiesData.sort((a, b) => a.name.localeCompare(b.name)) : [];
                setCities(sortedCities);
            } catch (error) {
                console.error("Error fetching cities:", error);
                setCities([]);
            }
        }
        fetchCities();
    }, []); // Remove selectedInstitutionType dependency since cities are same for both

    const fetchBranches = async () => {
        try {
            const branchesData = await getBranches(selectedInstitutionTypes);
            console.log('Fetched branches:', branchesData); // Debug log
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        } catch (error) {
            console.error("Error fetching branches:", error);
            setBranches([]);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [selectedInstitutionTypes]);

    const handleInstitutionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedInstitutionTypes([value]); // Only allow one selection
    };

    const handleRankColleges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCityName === null) {
            setError("City not selected");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        const data = {
            institution_types: selectedInstitutionTypes, // Change to array
            city: selectedCityName,
            options: selectedOptions,
            max_fees: maxFees,
            max_distance: maxDistance,
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
            if (error instanceof Error && error.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else {
                setError(error instanceof Error ? error.message : 'An error occurred');
            }
            console.error("Error fetching results:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isClient) return null; // Prevents hydration issues

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Find Your Ideal College</h1>
                <form onSubmit={handleRankColleges} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold text-gray-700">
                            Select Institution Type
                        </label>
                        <div className="flex flex-col space-y-2">
                            {['IIT', 'NIT', 'IIIT', 'NIT+IIIT'].map((type) => (
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
                    <div className="mb-4">
                        <label htmlFor="city" className="block mb-2 font-semibold text-gray-700">
                            Select City
                        </label>
                        <select onChange={(e) => setSelectedCityName(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="" key="default-city">Select City</option>
                            {cities && cities.length > 0 ? cities.map((city: City) => (
                                <option key={city.id} value={city.name}>
                                    {city.name}
                                </option>
                            )) : (
                                <option value="" key="loading-city">Loading cities...</option>
                            )}
                        </select>
                    </div>
                    <div className="mb-4">
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
                    <div className="mb-4">
                        <label htmlFor="gender" className="block mb-2 font-semibold text-gray-700">
                            Select Gender
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
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" key="default-branch">Select Branch</option>
                            {branches && branches.length > 0 ? (
                                branches.map((branch: Branch) => (
                                    <option key={`branch-${branch.name}`} value={branch.name}>
                                        {branch.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" key="loading-branch">Loading branches...</option>
                            )}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold text-gray-700">
                            Options
                        </label>
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
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Rank Colleges'}
                    </button>
                    {error && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                </form>
                <div className="mt-8">
                    {results.length > 0 && (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2">Institute</th>
                                    <th className="border p-2">Branch</th>
                                    <th className="border p-2">Closing Rank</th>
                                    {selectedOptions.includes('Distance') && <th className="border p-2">Distance (km)</th>}
                                    {selectedOptions.includes('Fees') && <th className="border p-2">Fees</th>}
                                    <th className="border p-2">Composite Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result: Result, index) => (
                                    <tr key={`${result.institute}-${result.branch}`}>
                                        <td className="border p-2">{result.institute}</td>
                                        <td className="border p-2">{result.branch}</td>
                                        <td className="border p-2">{result.closing_rank}</td>
                                        {selectedOptions.includes('Distance') && <td className="border p-2">{result.distance}</td>}
                                        {selectedOptions.includes('Fees') && <td className="border p-2">{result.fees}</td>}
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
    );
}
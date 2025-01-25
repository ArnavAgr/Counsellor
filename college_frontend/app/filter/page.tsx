"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCities, rankColleges, getBranches } from '../services/api';
import Header from "../components/Header";

// Define types for cities and results
interface City {
    id: number;
    name: string;
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
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [maxFees, setMaxFees] = useState<number>(300000);
    const [maxDistance, setMaxDistance] = useState<number>(5000);
    const [selectedBranchName, setSelectedBranchName] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        async function fetchCities() {
            const citiesData = await getCities();
            setCities(citiesData);
        }
        fetchCities();
    }, []);

    useEffect(() => {
        async function fetchBranches() {
            const branchesData = await getBranches();
            setBranches(branchesData);
        }
        fetchBranches();
    }, []);

    const handleRankColleges = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            city: selectedCityId,
            options: selectedOptions,
            max_fees: maxFees,
            max_distance: maxDistance,
            branch_name: selectedBranchName,
        };
        console.log("Sending data to backend:", data);
        try {
            const resultsData = await rankColleges(data);
            console.log("Received results from backend:", resultsData);
            setResults(resultsData.results);
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Find Your Ideal College</h1>
                <form onSubmit={handleRankColleges} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="city" className="block mb-2 font-semibold text-gray-700">
                            Select City
                        </label>
                        <select onChange={(e) => setSelectedCityId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select City</option>
                            {cities.map((city: City) => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
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
                        <span>₹{maxFees.toLocaleString('en-IN')}</span>
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
                        <select onChange={(e) => setSelectedBranchName(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Branch</option>
                            {branches.map((branch: Branch) => (
                                <option key={branch.name} value={branch.name}>{branch.name}</option>
                            ))}
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
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Rank Colleges
                    </button>
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
                                {results.map((result: Result) => (
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


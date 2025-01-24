"use client";

import { useEffect, useState } from 'react';
import { getCities, rankColleges, getBranches } from './services/api';
import Header from "./components/Header";
import { MapPin, Clock, BookOpen } from "lucide-react";

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

export default function Home() {
    const [cities, setCities] = useState<City[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [maxFees, setMaxFees] = useState<number>(300000);
    const [maxDistance, setMaxDistance] = useState<number>(5000);
    const [selectedBranchName, setSelectedBranchName] = useState<string>('');

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
            <main className="flex-grow">
                <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                Find Your Perfect College: Simplified Counseling for JEE Aspirants
                            </h1>
                            <p className="text-xl mb-8">
                                Make informed decisions about your future with our personalized college recommendations.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            {/* Add an image or illustration here if needed */}
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <MapPin size={48} className="text-blue-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Personalized College Recommendations</h3>
                                <p className="text-gray-600">Get tailored suggestions based on your preferences and JEE score.</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <Clock size={48} className="text-blue-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Save Time with Filters</h3>
                                <p className="text-gray-600">Quickly narrow down your options using our efficient filtering system.</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <BookOpen size={48} className="text-blue-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Make Informed Decisions</h3>
                                <p className="text-gray-600">
                                    Access comprehensive information to choose the best college for your future.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Rank Colleges</h2>
                        <form onSubmit={handleRankColleges} className="flex flex-col items-center">
                            <select onChange={(e) => setSelectedCityId(Number(e.target.value))} className="mb-4 p-2 border rounded" required>
                                <option value="">Select City</option>
                                {cities.map((city: City) => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                            <input
                                type="range"
                                min="0"
                                max="300000"
                                step="1000"
                                value={maxFees}
                                onChange={(e) => setMaxFees(Number(e.target.value))}
                                className="mb-4 p-2 border rounded"
                            />
                            <span>Max Fees: ₹{maxFees.toLocaleString('en-IN')}</span>
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="10"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(Number(e.target.value))}
                                className="mb-4 p-2 border rounded"
                            />
                            <span>Max Distance: {maxDistance} km</span>
                            <select
                                onChange={(e) => setSelectedBranchName(e.target.value)}
                                className="mb-4 p-2 border rounded"
                            >
                                <option value="">Select Branch</option>
                                {branches.map((branch: Branch) => (
                                    <option key={branch.name} value={branch.name}>{branch.name}</option>
                                ))}
                            </select>
                            <div className="flex mb-4">
                                <label className="mr-4">
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
                                    Fees
                                </label>
                                <label>
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
                                    Distance
                                </label>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
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
                                            <th className="border p-2">Composite Score</th>
                                            {selectedOptions.includes('Distance') && <th className="border p-2">Distance (km)</th>}
                                            {selectedOptions.includes('Fees') && <th className="border p-2">Fees</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result: Result) => (
                                            <tr key={`${result.institute}-${result.branch}`}>
                                                <td className="border p-2">{result.institute}</td>
                                                <td className="border p-2">{result.branch}</td>
                                                <td className="border p-2">{result.closing_rank}</td>
                                                <td className="border p-2">{result.composite_score}</td>
                                                {selectedOptions.includes('Distance') && <td className="border p-2">{result.distance}</td>}
                                                {selectedOptions.includes('Fees') && <td className="border p-2">{result.fees}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}


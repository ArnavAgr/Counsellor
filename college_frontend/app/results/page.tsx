"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react"; // Add Suspense
import { rankColleges } from "../services/api.js";

interface Result {
    institute: string;
    branch: string;
    closing_rank: number;
    composite_score: number;
    fees?: number;
    distance?: number;
    nirf_ranking?: number;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<Result[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const filtersFromParams = JSON.parse(
                    decodeURIComponent(searchParams.get("filters") || "{}")
                );
                setSelectedOptions(filtersFromParams.options || []);

                const resultsData = await rankColleges(filtersFromParams);
                console.log("Results data:", resultsData); // Debug log
                if (resultsData.error) {
                    console.error("Error from backend:", resultsData.error);
                    return;
                }
                setResults(resultsData.results || []);
            } catch (error) {
                console.error("Error fetching results:", error);
            }
        };
        fetchResults();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">College Rankings</h1>
                {results.length > 0 ? (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="border p-4">Institute</th>
                                    <th className="border p-4">Branch</th>
                                    <th className="border p-4">Closing Rank</th>
                                    {selectedOptions.includes("Distance") && <th className="border p-4">Distance (km)</th>}
                                    {selectedOptions.includes("Fees") && <th className="border p-4">Fees</th>}
                                    {selectedOptions.includes("NIRF") && <th className="border p-4">NIRF Ranking</th>}
                                    <th className="border p-4">Composite Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result: Result, index) => (
                                    <tr
                                        key={`${result.institute}-${result.branch}`}
                                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                    >
                                        <td className="border p-4 text-gray-900">{result.institute}</td>
                                        <td className="border p-4 text-gray-900">{result.branch}</td>
                                        <td className="border p-4 text-gray-900">{result.closing_rank}</td>
                                        {selectedOptions.includes("Distance") && (
                                            <td className="border p-4 text-gray-900">{result.distance} km</td>
                                        )}
                                        {selectedOptions.includes("Fees") && (
                                            <td className="border p-4 text-gray-900">₹{result.fees?.toLocaleString()}</td>
                                        )}
                                        {selectedOptions.includes("NIRF") && (
                                            <td className="border p-4 text-gray-900">{result.nirf_ranking}</td>
                                        )}
                                        <td className="border p-4 text-gray-900">{result.composite_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-700 text-lg font-semibold mt-8">
                        Loading...
                    </p>
                )}
            </main>
        </div>
    );
}

// Wrap the component that uses useSearchParams in Suspense
export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-center text-gray-700 text-lg font-semibold">Loading...</p>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}

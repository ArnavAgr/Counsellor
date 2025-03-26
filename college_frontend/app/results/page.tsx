"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { rankColleges } from "../services/api.js";

interface Result {
    institute: string;
    branch: string;
    closing_rank: number;
    composite_score: number;
    fees?: number;
    distance?: number;
    nirf_ranking?: number;
    highest_package?: number;
    average_package?: number;
    placement_percentage?: number;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<Result[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [displayOptions, setDisplayOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const filtersFromParams = JSON.parse(
                    decodeURIComponent(searchParams.get("filters") || "{}")
                );
                setSelectedOptions(filtersFromParams.options || []);
                setDisplayOptions(filtersFromParams.displayOptions || []);

                const resultsData = await rankColleges(filtersFromParams);
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
                <h1 className="text-4xl font-bold mb-2 text-center text-blue-700">
                    College Rankings
                    <span className="block text-lg font-normal mt-2 text-gray-600">
                        Results based on your selected preferences
                    </span>
                </h1>
                {results.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl shadow-lg">
                        <table className="w-full border-collapse bg-white rounded-xl shadow-md">
                            <thead className="bg-blue-700 text-white text-lg font-bold">
                                <tr>
                                    <th className="border p-4 rounded-tl-xl text-gray-200">S.No.</th>
                                    <th className="border p-4">Institute</th>
                                    <th className="border p-4">Branch</th>
                                    <th className="border p-4">Closing Rank</th>
                                    {[...new Set([...selectedOptions, ...displayOptions])].map((option, index) => {
                                        switch(option) {
                                            case "Distance":
                                                return <th key={index} className="border p-4">Distance (km)</th>;
                                            case "Fees":
                                                return <th key={index} className="border p-4">Fees</th>;
                                            case "NIRF":
                                                return <th key={index} className="border p-4">NIRF Ranking</th>;
                                            case "Highest_Package":
                                                return <th key={index} className="border p-4">Highest Package (LPA)</th>;
                                            case "Average_Package":
                                                return <th key={index} className="border p-4">Average Package (LPA)</th>;
                                            case "Placement_Percentage":
                                                return <th key={index} className="border p-4">Placement %</th>;
                                            default:
                                                return null;
                                        }
                                    })}
                                    <th className="border p-4 rounded-tr-xl">Composite Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result: Result, index: number) => (
                                    <tr 
                                        key={`${result.institute}-${result.branch}`} 
                                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-blue-50 transition-colors`}
                                    >
                                        <td className="border p-4 text-center text-gray-500">{index + 1}</td>
                                        <td className="border p-4">{result.institute}</td>
                                        <td className="border p-4">{result.branch}</td>
                                        <td className="border p-4">{result.closing_rank}</td>
                                        {[...new Set([...selectedOptions, ...displayOptions])].map((option, idx) => {
                                            switch(option) {
                                                case "Distance":
                                                    return <td key={idx} className="border p-4">{result.distance} km</td>;
                                                case "Fees":
                                                    return <td key={idx} className="border p-4">₹{result.fees?.toLocaleString()}</td>;
                                                case "NIRF":
                                                    return <td key={idx} className="border p-4">{result.nirf_ranking}</td>;
                                                case "Highest_Package":
                                                    return <td key={idx} className="border p-4">{result.highest_package?.toFixed(2)}</td>;
                                                case "Average_Package":
                                                    return <td key={idx} className="border p-4">{result.average_package?.toFixed(2)}</td>;
                                                case "Placement_Percentage":
                                                    return <td key={idx} className="border p-4">{result.placement_percentage?.toFixed(1)}%</td>;
                                                default:
                                                    return null;
                                            }
                                        })}
                                        <td className="border p-4">{result.composite_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-block animate-pulse">
                            <div className="text-2xl text-gray-700 mb-2">⏳</div>
                            <p className="text-gray-600 font-medium">
                                Analyzing colleges based on your criteria...
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading results...</p>
                </div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}

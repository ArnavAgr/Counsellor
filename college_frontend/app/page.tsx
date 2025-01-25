"use client";

import Header from "./components/Header";
import { MapPin, Clock, BookOpen } from "lucide-react";

export default function Home() {
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
            </main>
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}


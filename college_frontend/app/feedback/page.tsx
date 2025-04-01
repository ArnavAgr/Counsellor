"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import Header from "../components/Header";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
    rating: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("Feedback submitted:", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", feedback: "", rating: 0 });
    } catch (error) {
      setError("Failed to submit feedback. Please try again later.");
      console.error("Feedback submission error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
            Feedback Form
          </h1>

          {submitted ? (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-green-600 mb-2">
                Thank You!
              </h2>
              <p className="text-green-600">Your feedback has been submitted successfully.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="peer w-full p-3 border rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <label className="absolute left-3 top-3 text-gray-500 peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm transition-all">
                  Name (Optional)
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="peer w-full p-3 border rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <label className="absolute left-3 top-3 text-gray-500 peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm transition-all">
                  Email (Optional)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <div className="flex space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <FaStar
                      key={num}
                      size={30}
                      className={`cursor-pointer ${formData.rating >= num ? "text-yellow-500" : "text-gray-300"}`}
                      onClick={() => handleRating(num)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Feedback
                </label>
                <textarea
                  name="feedback"
                  rows={4}
                  value={formData.feedback}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                ></textarea>
                <p className="text-right text-sm text-gray-500">
                  {formData.feedback.length}/500 characters
                </p>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; 2023 JEE College Finder. All rights reserved.</p>
      </footer>
    </div>
  );
}
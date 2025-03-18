"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-800">
          CollegeChayan
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/filter"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Find Colleges
              </Link>
            </li>
            <li>
              <Link
                href="/disclaimer"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Disclaimer
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Feedback
              </Link>
            </li>
          </ul>
        </nav>
        {/* Hamburger Button for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isMenuOpen ? (
                // Close icon
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.3 5.71a1 1 0 010 1.42L13.42 12l4.88 4.88a1 1 0 11-1.42 1.42L12 13.42l-4.88 4.88a1 1 0 01-1.42-1.42L10.58 12 5.7 7.12a1 1 0 011.42-1.42L12 10.58l4.88-4.88a1 1 0 011.42 0z"
                />
              ) : (
                // Hamburger icon
                <path
                  fillRule="evenodd"
                  d="M4 5h16v2H4zM4 11h16v2H4zM4 17h16v2H4z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden">
          <ul className="px-4 pt-2 pb-4 space-y-2">
            <li>
              <Link
                href="/"
                className="block text-gray-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/filter"
                className="block text-gray-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Colleges
              </Link>
            </li>
            <li>
              <Link
                href="/disclaimer"
                className="block text-gray-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Disclaimer
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="block text-gray-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Feedback
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

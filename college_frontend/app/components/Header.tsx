import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          JEE College Finder
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/filter" className="text-gray-600 hover:text-blue-600 transition duration-300">
                Find Colleges
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}


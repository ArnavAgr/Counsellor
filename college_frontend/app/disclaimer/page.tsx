import Header from "../components/Header";

const sectionIcons = [
  // General Information
  (
    <svg className="w-6 h-6 text-blue-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
  ),
  // No Professional Advice
  (
    <svg className="w-6 h-6 text-purple-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
  ),
  // External Links
  (
    <svg className="w-6 h-6 text-green-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656-5.656m1.414-1.414a4 4 0 00-5.656 5.656l3 3a4 4 0 005.656-5.656" /></svg>
  ),
  // Data Accuracy & Changes
  (
    <svg className="w-6 h-6 text-yellow-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  // Limitation of Liability
  (
    <svg className="w-6 h-6 text-red-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  // User Responsibility
  (
    <svg className="w-6 h-6 text-pink-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  // Changes to This Disclaimer
  (
    <svg className="w-6 h-6 text-indigo-500 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  // Contact Information
  (
    <svg className="w-6 h-6 text-blue-400 mr-2 inline-block align-text-top" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
  ),
];

export default function DisclaimerPage() {
  const sections = [
    {
      title: "1. General Information",
      content:
        "The information provided on CollegeChayan is for general informational purposes only. While we strive to keep the content accurate and up to date, we make no warranties or representations regarding its completeness, reliability, or accuracy. Any reliance you place on this information is strictly at your own risk.",
    },
    {
      title: "2. No Professional Advice",
      content:
        "The content on this website does not constitute professional, legal, financial, or educational advice. Users should verify any information with official sources or seek professional guidance before making decisions.",
    },
    {
      title: "3. External Links",
      content:
        "CollegeChayan may contain links to third-party websites. We do not own or control these sites and are not responsible for their content, policies, or practices. The inclusion of links does not imply endorsement.",
    },
    {
      title: "4. Data Accuracy & Changes",
      content:
        "Our data is sourced from various public and third-party providers. While we strive for accuracy, errors and outdated information may occur. We reserve the right to modify or remove content at any time without notice.",
    },
    {
      title: "5. Limitation of Liability",
      content:
        "CollegeChayan, its owners, developers, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website, including loss of data or financial losses.",
    },
    {
      title: "6. User Responsibility",
      content:
        "By using this website, you acknowledge responsibility for any decisions based on its content. We shall not be held liable for discrepancies or misinterpretations.",
    },
    {
      title: "7. Changes to This Disclaimer",
      content:
        "We reserve the right to update this Disclaimer at any time. Please review this page periodically. Continued use of the website signifies acceptance of any changes.",
    },
    {
      title: "8. Contact Information",
      content: (
        <>
          If you have any questions, feel free to contact us at: <a href="mailto:support@collegechayan.com" className="font-medium text-blue-600 hover:underline hover:text-blue-800 transition-colors">support@collegechayan.com</a>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-2xl border border-gray-200 relative">
          <h1 className="text-5xl font-extrabold mb-8 text-center text-blue-700 tracking-tight drop-shadow-lg">Disclaimer</h1>
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={section.title}>
                <div className="flex items-center mb-2">
                  {sectionIcons[idx]}
                  <h2 className="text-2xl font-semibold text-gray-800">{section.title}</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {section.content}
                </p>
                {idx < sections.length - 1 && (
                  <div className="my-6 h-1 w-1/2 mx-auto bg-gradient-to-r from-blue-300 via-purple-200 to-pink-200 rounded-full opacity-70" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-6 mt-10 shadow-inner">
        <div className="container mx-auto px-4 text-center text-sm flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span>&copy; {new Date().getFullYear()} CollegeChayan. All rights reserved.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

import Header from "../components/Header";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Disclaimer</h1>
          <div className="prose text-gray-700 text-lg leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">1. General Information</h2>
              <p>
                The information provided on <strong>CollegeChayan</strong> is for general informational purposes only. While we strive to keep the content accurate and up to date, we make no warranties or representations regarding its completeness, reliability, or accuracy. Any reliance you place on this information is strictly at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">2. No Professional Advice</h2>
              <p>
                The content on this website does not constitute professional, legal, financial, or educational advice. Users should verify any information with official sources or seek professional guidance before making decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">3. External Links</h2>
              <p>
                CollegeChayan may contain links to third-party websites. We do not own or control these sites and are not responsible for their content, policies, or practices. The inclusion of links does not imply endorsement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">4. Data Accuracy & Changes</h2>
              <p>
                Our data is sourced from various public and third-party providers. While we strive for accuracy, errors and outdated information may occur. We reserve the right to modify or remove content at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">5. Limitation of Liability</h2>
              <p>
                CollegeChayan, its owners, developers, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website, including loss of data or financial losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">6. User Responsibility</h2>
              <p>
                By using this website, you acknowledge responsibility for any decisions based on its content. We shall not be held liable for discrepancies or misinterpretations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">7. Changes to This Disclaimer</h2>
              <p>
                We reserve the right to update this Disclaimer at any time. Please review this page periodically. Continued use of the website signifies acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">8. Contact Information</h2>
              <p>
                If you have any questions, feel free to contact us at: <span className="font-medium text-blue-600">support@collegechayan.com</span>
              </p>
            </section>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CollegeChayan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

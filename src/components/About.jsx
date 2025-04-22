import { useEffect } from 'react';

export default function About() {
  // Smooth scroll for navigation
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/images/logo.png" // Add your logo here
                alt="CoupCats"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">CoupCats</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Predictions with Purpose
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Assessing political stability through data-driven insights
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About CoupCats
          </h2>
          <div className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
            <p className="mt-4">
              The CoupCats project is a free, interactive model for estimating the risk of 
              government overthrow in countries worldwide. Our mission is to empower leaders 
              and policymakers with accessible tools for informed decision-making.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img 
              src="/images/world-map.png" // Add world map image
              alt="Global coverage" 
              className="h-32 w-full object-contain mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Global Coverage</h3>
            <p className="text-gray-600">Risk assessments for countries worldwide</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <img 
              src="/images/data-science.png" // Add data science illustration
              alt="Data driven" 
              className="h-32 w-full object-contain mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Historical Analysis</h3>
            <p className="text-gray-600">Predictions based on comprehensive historical data</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <img 
              src="/images/university.png" // Add university illustration
              alt="Academic research" 
              className="h-32 w-full object-contain mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Academic Foundation</h3>
            <p className="text-gray-600">Developed by University of Kentucky students & faculty</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                * Our predictions are based on historical data and statistical models. 
                They should not be interpreted as absolute indicators of current political 
                conditions or future outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            © {new Date().getFullYear()} CoupCats. An open-source initiative maintaining the legacy of CoupCast.
          </p>
        </div>
      </footer>
    </div>
  );
}
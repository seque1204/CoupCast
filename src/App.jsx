import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import CountryDataSearch from './CountrySearch';
import CountryWriteup from './components/CountryWriteup';
import Team from './components/team';
import About from './components/About';
import "./App.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#Map');

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash || '#Map';
      setCurrentPage(newHash);

      // Clear country selection when switching pages
      if (newHash !== '#Map') {
        setSelectedCountry(null);
      }

      if (newHash !== '#Country') {
        setSelectedCountry(null);
        clearSearch();
      }
    };

    // Initialize hash if empty
    if (!window.location.hash) {
      window.location.hash = '#Map';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const clearSearch = () => {
    setClearSearchTrigger(true);
  };

  return (
    <div className="App">
      <div className="header">
        <div className="logo-container">
          <img src="/logo-uk.png" alt="Logo" className="logo" />
        </div>
        <div className="text-container">
          <span className="top-text">University of Kentucky</span>
          <span className="bottom-text">Department of Political Science</span>
        </div>
        <nav>
          <ul>
            <li><a href="#Map">Map</a></li>
            <li><a href="#Country">Country Pages</a></li>
            <li><a href="#About">About</a></li>
            <li><a href="#TeamInfo">Team Info</a></li>
            <li>
              <a
                href="https://tek.uky.edu/"  // Replace with your actual TEK URL
                target="_blank"
                rel="noopener noreferrer"
              >
                About TEK
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/* If current page is #TeamInfo, show the Team component */}
      {currentPage === '#TeamInfo' ? (
        <Team />
      ) : currentPage === '#About' ? (
        // If current page is #About, show the About component
        <About />
      ) : currentPage.startsWith('#Country') ? (
        // If current page is #Country, show the Country Writeup component
        <>
          <CountryDataSearch
            onCountrySelect={setSelectedCountry}
            clearSearchTrigger={clearSearchTrigger}
            onResetClearSearch={() => setClearSearchTrigger(false)}
          />
          <CountryWriteup externalSelectedCountry={selectedCountry} onClearSearch={clearSearch} />
        </>
      ) : (
          // If current page is not #TeamInfo, show the Map and CountryDataSearch components
          <>
            <CountryDataSearch
              onCountrySelect={setSelectedCountry}
              clearSearchTrigger={clearSearchTrigger}
              onResetClearSearch={() => setClearSearchTrigger(false)}
            />
            <Map externalSelectedCountry={selectedCountry} onClearSearch={clearSearch} />
          </>
        )}
        <div className="footer"></div>
    </div>
  );
};

export default App;
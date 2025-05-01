import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import CountryDataSearch from './CountrySearch';
import CountryWriteup from './components/CountryWriteup';
import Team from './components/team';
import About from './components/About';
import RotateWarning from './components/RotateWarning';
import ZoomWrapper from './components/ZoomWrapper';
import "./App.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#Map');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });


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
      <RotateWarning />
      <ZoomWrapper baseWidth={1200}>
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
              {/*<li><a href="#Country">Country Pages</a></li>*/}
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
        ) /*: currentPage.startsWith('#Country') ? (
          // If current page is #Country, show the Country Writeup component
          <>
            <CountryDataSearch
              onCountrySelect={setSelectedCountry}
              clearSearchTrigger={clearSearchTrigger}
              onResetClearSearch={() => setClearSearchTrigger(false)}
            />
            <CountryWriteup externalSelectedCountry={selectedCountry} onClearSearch={clearSearch} />
          </>
        )*/ : (
            // If current page is not #TeamInfo, show the Map and CountryDataSearch components
            <>
              <CountryDataSearch
                onCountrySelect={setSelectedCountry}
                clearSearchTrigger={clearSearchTrigger}
                onResetClearSearch={() => setClearSearchTrigger(false)}
              />
              <Map
                externalSelectedCountry={selectedCountry}
                onClearSearch={clearSearch}
                setGlobalLabelPosition={setLabelPosition}
                setGlobalHoveredCountry={setHoveredCountry}
              />
            </>
          )}
        <div className="footer"></div>
      </ZoomWrapper>
      {hoveredCountry && (
        <div
          className="label"
          style={{
            position: "fixed",
            top: labelPosition.y,
            left: labelPosition.x,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: "0.9rem",
          }}
        >
          {hoveredCountry}
        </div>
      )}
    </div>
  );
};

export default App;
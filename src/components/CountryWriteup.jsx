import React, { useState, useEffect } from 'react';
import CanadaWriteup from './countryPages/CanadaWriteup';
import DefaultWriteup from './countryPages/DefaultWriteup';
import BurkinaFasoWriteup from './countryPages/BurkinaFasoWriteup';

const CountryWriteup = ({ externalSelectedCountry, onClearSearch }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    let country = null;

    // Check for externalSelectedCountry first
    if (externalSelectedCountry && externalSelectedCountry.country) {
      country = externalSelectedCountry.country;
    } else {
      // Parse from hash
      const hash = window.location.hash;
      const match = hash.match(/name=([^&]+)/);
      if (match) {
        country = decodeURIComponent(match[1]);
        const cleanHash = hash.split('?')[0];
        if (cleanHash !== hash) {
          // Slight delay to avoid interfering with render/update cycle
          setTimeout(() => {
            window.history.replaceState(null, '', cleanHash);
          }, 0);
        }
      }
    }

  setSelectedCountry(country);
  }, [externalSelectedCountry]);

  const renderWriteup = () => {
    switch (selectedCountry) {
      case 'Canada':
        return <CanadaWriteup />;
      case 'Burkina Faso':
        return <BurkinaFasoWriteup />;
      case null:
        return <DefaultWriteup />;
      default:
        return <h1>No writeup available for {selectedCountry}</h1>;
    }
  };

  return (
    <div>
      {renderWriteup()}
    </div>
  );
};

export default CountryWriteup;
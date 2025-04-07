import React, { useState, useEffect } from 'react';
import { ZoomableGroup, ComposableMap, Geographies, Geography } from 'react-simple-maps';
import "./Map.css";
import { countryToContinent, continentZoomData } from "../ContinentData";
import { ClipLoader } from 'react-spinners';
import { useMemo } from 'react';

const rgbToHex = (r, g, b) => {
  const toHex = (x) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Function to calculate color based on probability
const colorScale = (p) => {
  if (p === -1) {
    return "#505050";
  }
  const red = 235 - Math.round(235 * p);
  const green = 235 - Math.round(235 * p);
  const blue = 235;
  return rgbToHex(red, green, blue);
};

const getRiskColor = (value) => {
  // Low risk: light gray (#EBEBEB)
  // High risk: red (#FF0000)
  const low = { r: 235, g: 235, b: 235 };
  const high = { r: 255, g: 0, b: 0 };

  const r = Math.round(low.r + (high.r - low.r) * value);
  const g = Math.round(low.g + (high.g - low.g) * value);
  const b = Math.round(low.b + (high.b - low.b) * value);

  // Convert to hex string
  const toHex = (num) => num.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const CircleProgress = ({ value, size = 50, stroke = 6 }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - value * circumference;
  
  // Use the helper to compute the stroke color for the progress portion
  const progressColor = getRiskColor(value);

  return (
    <svg height={size} width={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Background Circle */}
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress Circle with dynamic color */}
      <circle
        stroke={progressColor}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
      />
    </svg>
  );
};


const Map = ({ externalSelectedCountry, onClearSearch }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [data, setData] = useState([]);
  const [dataOG, setDataOG] = useState([]);
  const [mapCenter, setMapCenter] = useState([10, 0]);
  const [zoomLevel, setZoomLevel] = useState(1.3);
  const [targetZoom, setTargetZoom] = useState(1.3);
  const [targetCenter, setTargetCenter] = useState([10, 0]);
  const [manualZoom, setManualZoom] = useState(true);
  const [locked, setLocked] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const [countrySliders, setCountrySliders] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [scoredState, setScoredState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  const defaultSliders = { 
    "pce":0.0,
    "pce2":0.0,
    "pce3":0.0,
    "milit.y":0.0,
    "cold":0.0,
    //"e_asia_pacific":0.0,
    //"euro_cent_asia":0.0,
    //"LA_carrib":0.0,
    //"MENA":0.0,
    //"N_america":0.0,
    //"S_asia":0.0,
    //"Sub_africa":0.0
  };

  // For the ranking panel (when no country is selected), allow collapse/expand.
  // Expanded by default.
  const [rankingPanelExpanded, setRankingPanelExpanded] = useState(true);

    // Fetch data
    useEffect(() => {
      if (loading) {
      const fetchData = async () => {
        try {
          // Fetch first dataset
          const response = await fetch(
            "https://raw.githubusercontent.com/thynec/CoupCats/refs/heads/main/recent_data.json"
          );
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setData(data);
  
          // Fetch second dataset
          const responseOG = await fetch(
            "https://raw.githubusercontent.com/thynec/CoupCats/refs/heads/main/recent_data.json"
          );
          if (!responseOG.ok) {
            throw new Error(`HTTP error! Status: ${responseOG.status}`);
          }
          const dataOG = await responseOG.json();
          setDataOG(dataOG);
  
          console.log("Data loaded on mount");
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          console.log("Setting loading to false 1");
          setLoading(false); // Set loading to false after both fetches are done
        }
      };
  
      fetchData();
    }}, []);
  const rankingCountries = [...data].sort((a, b) => b.prediction_prob - a.prediction_prob);

  // Update view when externalSelectedCountry changes
  useEffect(() => {
    if (externalSelectedCountry) {
      const countryName = externalSelectedCountry.country;
      setSelectedCountry(countryName);
      const continent = countryToContinent[countryName];
      if (continent && continentZoomData[continent]) {
        const { center, zoom } = continentZoomData[continent];
        setManualZoom(false);
        setTargetCenter(center);
        setTargetZoom(zoom);
      }
    } else {
      setSelectedCountry(null);
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
  }, [externalSelectedCountry]);

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    setSelectedCountry(countryName);
    if (onClearSearch) {
      onClearSearch();
    }
    const continent = countryToContinent[countryName];
    if (continent && continentZoomData[continent]) {
      const { center, zoom } = continentZoomData[continent];
      setManualZoom(false);
      setTargetCenter(center);
      setTargetZoom(zoom);
      //Initialize Sliders
      if (!countrySliders[countryName]) {
        setCountrySliders(prev => ({
          ...prev,
          [countryName]: defaultSliders
        }));
      }
      //Initialize Slider Values
      const countryData = data.find((s) => s['country'] === countryName);
      if (!sliderValues[countryName] && countryData) {
        setSliderValues(prev => ({
          ...prev,
          [countryName]: Object.keys(defaultSliders).reduce((acc, key) => {
            acc[key] = (typeof countryData[key] === "number" && isFinite(countryData[key]))
              ? countryData[key].toFixed(2)
              : "";
            return acc;
          }, {})
        }));
      }
    }
  };

  const handleMapClick = (event) => {
    if (event.target.tagName === 'svg' || event.target.tagName === 'path') {
      setSelectedCountry(null);
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
    if (!event.target.closest(".geography")) { 
      setSelectedCountry(null);
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
  };

  const handleMouseMove = (event) => {
    setLabelPosition({ x: event.pageX + 132, y: event.pageY - 15 });
  };

  const handleSliderChange = (e, key) => {
    const sliderVal = Number(e.target.value); // ensure it's a number
  
    const countryData = data.find((s) => s.country === selectedCountry);
    const countryDataOG = dataOG.find((s) => s.country === selectedCountry);
  
    if (selectedCountry && countryData && countryDataOG) {
      const originalValue = countryDataOG[key];
      const updatedValue = originalValue * (1 + sliderVal / 100);
  
      // Update the actual model data
      countryData[key] = updatedValue;
  
      // Calculate prediction
      const pce      = countryData['pce'] ?? 0;
      const pce2     = countryData['pce2'] ?? 0;
      const pce3     = countryData['pce3'] ?? 0;
      const military = countryData['milit.y'] ?? 0;
      const cold     = countryData['cold'] ?? 0;
  
      const x = 0.003 * pce + 0.00015 * pce2 + 0.0000035 * pce3 + 0.5 * military + 0.2 * cold + 0.000001;
      countryData['prediction_prob'] = 1 / (1 + Math.exp(-x));
  
      // Set display state (slider value % and updated number)
      setCountrySliders(prev => ({
        ...prev,
        [selectedCountry]: {
          ...prev[selectedCountry],
          [key]: sliderVal // % change
        }
      }));
  
      setSliderValues(prev => ({
        ...prev,
        [selectedCountry]: {
          ...prev[selectedCountry],
          [key]: isFinite(updatedValue) ? updatedValue.toFixed(2) : "N/A"
        }
      }));
  
      console.log("Updated:", key, updatedValue, "Prediction:", countryData['prediction_prob']);
    }
  };

  const handleTextInputChange = (e, key) => {
    const newValue = e.target.value;
    setSliderValues((prev) => ({
        ...prev,
        [selectedCountry]: {
            ...prev[selectedCountry],
            [key]: newValue, // Store as string for live editing
        },
    }));
  };

  const handleTextInputCommit = (e, key) => {
    if (e.type === "blur" || (e.type === "keydown" && e.key === "Enter")) {
      let rawValue = e.target.value.trim();
      if (!isNaN(rawValue) && rawValue !== "") {
        let newValue = parseFloat(rawValue);
  
        const countryData = data.find(s => s.country === selectedCountry);
        const countryDataOG = dataOG.find(s => s.country === selectedCountry);
  
        if (!countryData || !countryDataOG) return;
  
        const originalValue = countryDataOG[key];
  
        // Clamp to ±15%
        const maxVal = originalValue * 1.15;
        const minVal = originalValue * 0.85;
        newValue = Math.max(Math.min(newValue, maxVal), minVal);
  
        // Update raw value (for text input)
        setSliderValues(prev => ({
          ...prev,
          [selectedCountry]: {
            ...prev[selectedCountry],
            [key]: newValue.toFixed(2),
          },
        }));
  
        // Update actual model data
        countryData[key] = newValue;
  
        // Update prediction_prob using the formula
        const pce      = countryData['pce'] ?? 0;
        const pce2     = countryData['pce2'] ?? 0;
        const pce3     = countryData['pce3'] ?? 0;
        const military = countryData['milit.y'] ?? 0;
        const cold     = countryData['cold'] ?? 0;
  
        const x = 0.003 * pce + 0.00015 * pce2 + 0.0000035 * pce3 + 0.5 * military + 0.2 * cold + 0.000001;
        countryData['prediction_prob'] = 1 / (1 + Math.exp(-x));
  
        // Update % slider (derived from comparison to original)
        const delta = originalValue !== 0
          ? (((newValue / originalValue) - 1) * 100).toFixed(0)
          : "N/A";
  
        setCountrySliders(prev => ({
          ...prev,
          [selectedCountry]: {
            ...prev[selectedCountry],
            [key]: delta,
          },
        }));
  
        console.log("Updated:", key, newValue, "Delta:", delta, "Prediction:", countryData['prediction_prob']);
      }
    }
  };

  const resetDataValues = () => {
    const fetchData = async () => {
      try {
        // Fetch first dataset
        const response = await fetch(
          "https://raw.githubusercontent.com/thynec/CoupCats/refs/heads/main/recent_data.json"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    setSelectedCountry(null);
    setManualZoom(false);
    setTargetCenter([10, 5]);
    setTargetZoom(1.3);
    setSliderValues({}); // Clear slider values
    setCountrySliders({}); // Clear country-specific sliders
  };  

  // Smooth zoom animation
  useEffect(() => {
    if (manualZoom) return;
    let animationFrame;
    const tolerance = 0.01;
    const animateZoom = () => {
      if (
        Math.abs(zoomLevel - targetZoom) > tolerance || 
        Math.abs(mapCenter[0] - targetCenter[0]) > tolerance || 
        Math.abs(mapCenter[1] - targetCenter[1]) > tolerance
      ) {
        setZoomLevel(prev => prev + (targetZoom - prev) * 0.2);
        setMapCenter(prev => [
          prev[0] + (targetCenter[0] - prev[0]) * 0.2,
          prev[1] + (targetCenter[1] - prev[1]) * 0.2,
        ]);
        animationFrame = requestAnimationFrame(animateZoom);
      } else if (!locked) {
        setManualZoom(true);
      }
    };
    animationFrame = requestAnimationFrame(animateZoom);
    return () => cancelAnimationFrame(animationFrame);
  }, [zoomLevel, targetZoom, mapCenter, targetCenter, manualZoom]);

  let prob = null;
  let probX = null;
  if (selectedCountry) {
    const countryData = data.find((s) => s['country'] === selectedCountry);
    prob = countryData ? countryData['prediction_prob'] : "N/A";

    const binomialAtLeastOne = (x, p) => 1 - Math.pow(1 - p, x);

    const p = countryData ? countryData['prediction_prob'] : 0.5; 

    probX = countryData ? binomialAtLeastOne(months, p) : "N/A";

    if (probX < prob){
      console.log("Warning: ProbX is less than Prob", probX, prob);
    }
  } 
  
  const getFlagUrl = (countryName) => `/flags/${countryName.toLowerCase().replace(/\s+/g, '-')}.svg`;

  const flagUrls = useMemo(() => {
    return rankingCountries.reduce((acc, country) => {
      acc[country.country] = getFlagUrl(country.country);
      return acc;
    }, {});
  }, [rankingCountries]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={35} color="#000" loading={true} />
      </div>
    );
  }

  
  return (
    <div className="MapContainer" onMouseMove={handleMouseMove}>
      <div className="map-box">
        <div className="map-wrapper" onClick={handleMapClick}>
          <ComposableMap width={1000} projectionConfig={{ scale: 140 }}>
            <ZoomableGroup center={mapCenter}
                           zoom={zoomLevel}
                           minZoom={1.30}
                           maxZoom={4.00}
                           translateExtent={[[137, 55], [906, 520]]}
                           filterZoomEvent={(event) => event.type !== "wheel" || !locked}
                           onMoveEnd={({ zoom, coordinates }) => {
                             setTargetZoom(zoom);
                             setZoomLevel(zoom);
                             setTargetCenter(coordinates);
                             setMapCenter(coordinates);
            }}>
              <Geographies geography="/map.json">
                {({ geographies }) => {
                  const selectedGeo = geographies.find((geo) => geo.properties.name === selectedCountry);
                  const otherGeographies = geographies.filter((geo) => geo.properties.name !== selectedCountry);
                  return (
                    <>
                      {otherGeographies.map((geo) => {
                        const d = data.find((s) => s['country'] === geo.properties.name);
                        let prob = -1;
                        if (d) {
                          prob = d['prediction_prob'];
                        }
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCountryClick(geo);
                            }}
                            onMouseEnter={() => setHoveredCountry(geo.properties.name)}
                            onMouseLeave={() => setHoveredCountry(null)}
                            style={{
                              default: { 
                                fill: colorScale(prob),
                                stroke: "#607D8B",
                                strokeWidth: 0.1,
                                strokeLinejoin: "round",
                                strokeLinecap: "round",
                                pointerEvents: "fill"
                              },
                              hover: {
                                fill: colorScale(prob),
                                stroke: "#000",
                                strokeWidth: 0.3,
                                strokeLinejoin: "round",
                                strokeLinecap: "round",
                              },
                              pressed: { fill: colorScale(prob), outline: "none" },
                            }}
                          />
                        );
                      })}
                      {selectedGeo && (
                        <Geography
                          key={selectedGeo.rsmKey}
                          geography={selectedGeo}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCountryClick(selectedGeo);
                          }}
                          onMouseEnter={() => setHoveredCountry(selectedGeo.properties.name)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          style={{
                            default: {
                              fill: colorScale(prob),
                              stroke: "#000",
                              strokeWidth: 0.3,
                              strokeLinejoin: "round",
                              strokeLinecap: "round",
                              pointerEvents: "fill",
                              filter: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
                            },
                            hover: {
                              fill: colorScale(prob),
                              stroke: "#000",
                              strokeWidth: 0.3,
                              strokeLinejoin: "round",
                              strokeLinecap: "round",
                              pointerEvents: "fill",
                              filter: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
                            },
                            pressed: { fill: colorScale(prob), outline: "none" },
                          }}
                        />
                      )}
                    </>
                  );
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Zoom Controls on the left side */}
        <div
          style={{
            position: 'absolute',
            top: '330px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (targetZoom < 4) {
              setManualZoom(false);
              setTargetZoom(targetZoom + 0.2);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.7rem',
              color: targetZoom >= 4 ? '#888' : '#000',
              userSelect: 'none',
            }}
          >
            +
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '380px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (targetZoom > 1.3) {
              setManualZoom(false);
              setTargetZoom(targetZoom - 0.2);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.7rem',
              color: targetZoom <= 1.3 ? '#888' : '#000',
              userSelect: 'none',
            }}
          >
            -
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '430px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          onClick={() => { setLocked(prev => !prev); setManualZoom(false) }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.5rem',
              color: '#000',
              userSelect: 'none',
            }}
          >
            {locked ? "Locked" : "Unlocked"}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '480px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          onClick={() => { resetDataValues();
          console.log("Reset triggered", data, dataOG); }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.7rem',
              color: '#000',
              userSelect: 'none',
            }}
          >
            Reset
          </div>
        </div>

        {/* Side Panel on the right (collapsible ranking panel or country details) */}
        <div
          className={`side-panel ${selectedCountry ? "visible" : "ranking"}`}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: selectedCountry ? '400px' : (rankingPanelExpanded ? '400px' : '40px'),
            height: selectedCountry ? '800px' : (rankingPanelExpanded ? '800px' : '40px'),
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            overflowY: 'auto',
            transition: 'width 0.3s ease, height 0.3s ease, transform 0.3s ease',
            zIndex: 1000,
          }}
        >
          {/* Render the toggle arrow only when no country is selected */}
          {!selectedCountry && (
            <button 
              onClick={() => setRankingPanelExpanded(prev => !prev)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                zIndex: 1100,
              }}
              aria-label="Toggle Ranking Panel"
            >
              {rankingPanelExpanded ? '→' : '←'}
            </button>
          )}
          {selectedCountry ? (
            <>
              <button className="close-btn" onClick={() => {
                  setSelectedCountry(null);
                  setManualZoom(false);
                  setTargetCenter([10, 5]);
                  setTargetZoom(1.3);
                }} style={{right: '10px',}} >
                ✖
              </button>

              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={scoredState} 
                  onChange={(e) => setScoredState(e.target.checked)} 
              />
              <span className="slider">{scoredState ? "Predictive" : "Overall Indicator"}</span>
              </label>
              
              <h1>{selectedCountry}</h1>
              <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingTop: "10px", paddingBottom: "12px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
                  Risk Rating:
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CircleProgress value={prob} />
                  <span style={{ fontSize: "1.2rem", fontWeight: "500", width: "60px", textAlign: "right" }}>
                    {prob !== "N/A" ? (prob * 100).toFixed(0) + "%" : "N/A"}
                  </span>
                </div>
              </h2>

              <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingBottom: "12px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
                  Risk in{" "}
                  <select
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value, 10))}
                    style={{
                      fontSize: "inherit",
                      fontFamily: "inherit",
                      border: "none",
                      background: "transparent",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    {[1, 3, 6, 9, 12, 18, 24].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>{" "}
                  months:
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CircleProgress value={probX} />
                  <span style={{ fontSize: "1.2rem", fontWeight: "500", width: "60px", textAlign: "right" }}>
                    {probX !== "N/A" ? (probX * 100).toFixed(0) + "%" : "N/A"}
                  </span>
                </div>
              </h2>
              {selectedCountry && (
                !scoredState ? (

                  // Progress Bar View
                  <div className="slider-container">
                    {Object.keys(defaultSliders).map((key) => {
                      const maxValue = Math.max(...data.map(s => s[key] || 0));
                      const countryData = data.find(s => s['country'] === selectedCountry);
                      const countryValue = countryData ? parseFloat(countryData[key]) : null;
                      const score = countryValue !== null && maxValue > 0 ? (countryValue / maxValue) * 10 : "N/A";

                      return (
                        <div key={key} className="slider-item">
                          <div className="split-label">
                            <span className="label-text">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                            {/* <span className="label-value">
                              {countryValue !== null ? countryValue.toFixed(2) : "N/A"}
                            </span> */}
                          </div>

                          {/* Progress Bar */}
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill"
                              style={{
                                width: score !== "N/A" ? `${(score / 10 * 100)}%` : '0%'
                              }}
                            />
                          </div>

                          {/* Score Text */}
                          <div className="score-text">
                            Score: {score !== "N/A" ? `${score.toFixed(2)}/10` : "N/A"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                    // Raw Input View
                      <div className="slider-container">
                        {Object.keys(defaultSliders).map((key) => (
                          <div key={key} className="slider-item">
                            <label className="split-label">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                              <input
                                type="text"
                                value={sliderValues[selectedCountry]?.[key] ?? ""}
                                onChange={(e) => handleTextInputChange(e, key)}
                                onBlur={(e) => handleTextInputCommit(e, key)}
                                onKeyDown={(e) => handleTextInputCommit(e, key)}
                                className="slider-textbox"
                              />
                            </label>
                            <input
                              type="range"
                              min="-15"
                              max="15"
                              value={countrySliders[selectedCountry]?.[key] ?? 0}
                              onChange={(e) => handleSliderChange(e, key)}
                            />
                            <span>{countrySliders[selectedCountry]?.[key] + "%" || 0}</span>
                          </div>
                        ))}
                      </div>
                    )
                )}
            </>
          ) : (
            rankingPanelExpanded && (
              <>
                <h2 style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #ccc" }}>
                  Overall Coup Likelihood
                </h2>
                {rankingCountries.map((country, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 15px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCountryClick({ properties: { name: country.country } });
                    }}
                  >
                    <div style={{ flex: "0 0 50px", fontWeight: "bold", textAlign: "center" }}>
                      {index + 1}
                    </div>
                    {/* Add Flag Here */}
                    <img 
                      src={flagUrls[country.country]}
                      alt={`${country.country} flag`}
                      style={{
                        width: '24px',
                        height: '16px',
                        margin: '0 12px',
                        borderRadius: '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/flags/unknown-flag.svg";
                      }}
                    />

                    <div style={{ flex: "1", textAlign: "left" }}>
                      {country.country}
                    </div>
                    <div
                      style={{
                        flex: "0 0 120px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {country.prediction_prob?.toFixed?.(2) ?? "N/A"}
                    </div>
                  </div>
                ))}
              </>
            )
          )}
        </div>
      </div>

      {hoveredCountry && (
        <div
          className="label"
          style={{
            position: "absolute",
            top: labelPosition.y - 160,
            left: labelPosition.x - 120,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredCountry}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '20px',   // Change top and bottom for top/bottom left
          left: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          zIndex: 1000,
        }}
      >
        {/* Gradient Bar */}
        <div
          style={{
            width: '150px',
            height: '20px',
            background: 'linear-gradient(to right, #EBEBEB, #00008B)', // White to dark blue
            borderRadius: '5px',
            marginLeft: '10px',
            marginBottom: '5px',
          }}
        ></div>
        {/* Labels */}
        <div style={{ display: 'flex', flexDirection: 'space-between', fontSize: '0.9rem', width: '100%', justifyContent: 'space-between' }}>
          <span style={{ marginBottom: '2px' }}>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
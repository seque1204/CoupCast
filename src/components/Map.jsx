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
let maxProbForScaling = -1; // Default max probability for scaling

// Function to calculate color based on probability
const colorScale = (p, maxProb) => {
  if (p === -1) {
    return "#cfcccc";
  }
  // check if p is a number and not NaN
  if (isNaN(p) || p === null || p === undefined) {
    return "#cfcccc"; // Default color for invalid probability
  }
  // Add a buffer (say 25%)
  maxProbForScaling = maxProb + maxProb * 0.5;

  // Set k for logarithmic scaling (bigger = stronger boost to small values)
  const k = 100; // you can tweak between 50-200 depending on how aggressive you want

  // Apply logarithmic scaling
  const numerator = Math.log(1 + k * p);
  const denominator = Math.log(1 + k * maxProbForScaling);
  let scaledP = numerator / denominator;

  // Cap at 1 to be safe
  scaledP = Math.min(scaledP, 1);

  // Now color based on scaledP
  const red = 235 - Math.round(235 * scaledP);
  const green = 235 - Math.round(235 * scaledP);
  const blue = 235;
  return rgbToHex(red, green, blue);
};


const getRiskColor = (value) => {
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


const Map = ({ externalSelectedCountry, onClearSearch, setGlobalLabelPosition, setGlobalHoveredCountry }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [data, setData] = useState([]);
  const [dataOG, setDataOG] = useState([]);
  const [mapCenter, setMapCenter] = useState([10, 0]);
  const [zoomLevel, setZoomLevel] = useState(1.3);
  const [targetZoom, setTargetZoom] = useState(1.3);
  const [targetCenter, setTargetCenter] = useState([10, 0]);
  const [manualZoom, setManualZoom] = useState(true);
  const [locked, setLocked] = useState(true);
  const [countrySliders, setCountrySliders] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [scoredState, setScoredState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(18);
  const [showInstructions, setShowInstructions] = useState(true);
  const [maxPredictionProb, setMaxPredictionProb] = useState(0.05); // Set a default max probability of 0.05
  const [rankingPanelExpanded, setRankingPanelExpanded] = useState(false);


  const toggleInstructions = () => {
    setShowInstructions(prev => !prev);
  };

  const defaultSliders = {   //Sorted by weight in prediction
    "Trade": 100,
    "Change_GDP_per_cap": 100,
    "Democracy_level": 100,
    "Women_political_participation": 100,
    "Protests": 100,
    "Military_regime": 0,
    "Military_influence": 100,

  };

  // For the ranking panel (when no country is selected), allow collapse/expand.
  // Expanded by default.
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
    }
  }, []);
  const rankingCountries = [...data].sort((a, b) =>
    (isNaN(b.prediction_prob) ? -1 : b.prediction_prob) -
    (isNaN(a.prediction_prob) ? -1 : a.prediction_prob)
  );
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
    } else {
      setSelectedCountry(null);
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
  }, [externalSelectedCountry]);

  useEffect(() => {
    if (data.length > 0) {
      // Calculate the maximum prediction_prob
      const maxProb = Math.max(
        ...data
          .map((item) => item.prediction_prob)
          .filter((value) => typeof value === "number" && !isNaN(value))
      );
      console.log("Max Prediction Probability:", maxProb);
      setMaxPredictionProb(maxProb);
    }
  }, [dataOG]);

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    setSelectedCountry(countryName);
    setGlobalHoveredCountry(null)
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
      setGlobalHoveredCountry(null)
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
    if (!event.target.closest(".geography")) {
      setSelectedCountry(null);
      setGlobalHoveredCountry(null)
      setManualZoom(false);
      setTargetCenter([10, 5]);
      setTargetZoom(1.3);
    }
  };

  const handleMouseMove = (event) => {
    setGlobalLabelPosition({ x: event.clientX + 20, y: event.clientY + 20 });
  };

  const handleSliderChange = (e, key) => {
    let sliderVal = Number(e.target.value); // ensure it's a number

    if (key == "Military_regime") {
      sliderVal = sliderVal === 0 ? 0 : 1;
    }
    const countryData = data.find((s) => s.country === selectedCountry);
    const countryDataOG = dataOG.find((s) => s.country === selectedCountry);

    if (selectedCountry && countryData && countryDataOG) {
      const originalValue = countryDataOG[key];
      const updatedValue = key === "Military_regime"

 

      ? sliderVal // Direct toggle value


      : originalValue * (sliderVal / 100);





    // Update the actual model data


    countryData[key] = updatedValue;

      // Calculate prediction
      const Trade = countryData['Trade'] ?? 0;
      const Change_GDP_per_cap = countryData['Change_GDP_per_cap'] ?? 0;
      const Democracy_level = countryData['Democracy_level'] ?? 0;
      const Women_political_participation = countryData['Women_political_participation'] ?? 0;
      const Protests = countryData['Protests'] ?? 0;
      const Military_regime = countryData['Military_regime'] ?? 0;
      const Military_influence = countryData['Military_influence'] ?? 0;

      // Not on sliders but need to stay constant 
      const Cold_war = countryData['Cold_war'] ?? 0;
      const e_asia_pacific = countryData['e_asia_pacific'] ?? 0;
      const LA_carrib = countryData['LA_carrib'] ?? 0;
      const MENA = countryData['MENA'] ?? 0;
      const N_america = countryData['N_america'] ?? 0;
      const S_asia = countryData['S_asia'] ?? 0;
      const Sub_africa = countryData['Sub_africa'] ?? 0;
      const pce = countryData['pce'] ?? 0;
      const pce2 = countryData['pce2'] ?? 0;
      const pce3 = countryData['pce3'] ?? 0;
      const Democracy_squared = countryData['Democracy_squared'] ?? 0;
      const GDP_per_cap = countryData['GDP_per_cap'] ?? 0;
      const Civil_wars = countryData['Civil_wars'] ?? 0;
      const intercept = -6.607;

      const x = intercept +
        -7.367e-2 * Trade +
        -3.559e0 * Change_GDP_per_cap +
        7.9264e0 * Democracy_level +
        -9.8963e-1 * Women_political_participation +
        2.5498e-1 * Protests +
        1.2107e0 * Military_regime +
        8.7481e-1 * Military_influence + //After this is just other ones not on slider
        4.5741e-1 * Cold_war +
        2.3207e-1 * e_asia_pacific +
        8.2664e-1 * LA_carrib +
        7.1901e-1 * MENA +
        -1.1423e1 * N_america +
        4.1404e-1 * S_asia +
        7.9359e-1 * Sub_africa +
        -5.7242e-3 * pce +
        1.0202e-5 * pce2 +
        -9.6800e-9 * pce3 +
        -8.5157e0 * Democracy_squared +
        -1.104e-1 * GDP_per_cap +
        2.4043e-1 * Civil_wars
      console.log("Original Probability:", countryData['prediction_prob']);
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
        const maxVal = originalValue * 2;
        const minVal = originalValue * 0;
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
        // Calculate prediction
        const Trade = countryData['Trade'] ?? 0;
        const Change_GDP_per_cap = countryData['Change_GDP_per_cap'] ?? 0;
        const Democracy_level = countryData['Democracy_level'] ?? 0;
        const Women_political_participation = countryData['Women_political_participation'] ?? 0;
        const Protests = countryData['Protests'] ?? 0;
        const Military_regime = countryData['Military_regime'] ?? 0;
        const Military_influence = countryData['Military_influence'] ?? 0;
        // Not on sliders but need to stay constant
        const Cold_war = countryData['Cold_war'] ?? 0;
        const e_asia_pacific = countryData['e_asia_pacific'] ?? 0;
        const LA_carrib = countryData['LA_carrib'] ?? 0;
        const MENA = countryData['MENA'] ?? 0;
        const N_america = countryData['N_america'] ?? 0;
        const S_asia = countryData['S_asia'] ?? 0;
        const Sub_africa = countryData['Sub_africa'] ?? 0;
        const pce = countryData['pce'] ?? 0;
        const pce2 = countryData['pce2'] ?? 0;
        const pce3 = countryData['pce3'] ?? 0;
        const Democracy_squared = countryData['Democracy_squared'] ?? 0;
        const GDP_per_cap = countryData['GDP_per_cap'] ?? 0;
        const Civil_wars = countryData['Civil_wars'] ?? 0;
        const intercept = -6.607;

        const x = intercept +
          -7.367e-2 * Trade +
          -3.559e0 * Change_GDP_per_cap +
          7.9264e0 * Democracy_level +
          -9.8963e-1 * Women_political_participation +
          2.5498e-1 * Protests +
          1.2107e0 * Military_regime +
          8.7481e-1 * Military_influence + //After this is just other ones not on slider
          4.5741e-1 * Cold_war +
          2.3207e-1 * e_asia_pacific +
          8.2664e-1 * LA_carrib +
          7.1901e-1 * MENA +
          -1.1423e1 * N_america +
          4.1404e-1 * S_asia +
          7.9359e-1 * Sub_africa +
          -5.7242e-3 * pce +
          1.0202e-5 * pce2 +
          -9.6800e-9 * pce3 +
          -8.5157e0 * Democracy_squared +
          -1.104e-1 * GDP_per_cap +
          2.4043e-1 * Civil_wars
        console.log("Original Probability:", countryData['prediction_prob']);
        countryData['prediction_prob'] = 1 / (1 + Math.exp(-x));

        // Update % slider (derived from comparison to original)
        const delta = originalValue !== 0
          ? ((newValue / originalValue) * 100).toFixed(0)
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

    if (probX < prob) {
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
              translateExtent={[[137, 55], [986, 520]]}
              filterZoomEvent={(event) => event.type !== "wheel" || event.type.startsWith('touch') || !locked}
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
                            onMouseEnter={() => setGlobalHoveredCountry(geo.properties.name)}
                            onMouseLeave={() => setGlobalHoveredCountry(null)}
                            style={{
                              default: {
                                fill: colorScale(prob, maxPredictionProb),
                                stroke: "#607D8B",
                                strokeWidth: 0.1,
                                strokeLinejoin: "round",
                                strokeLinecap: "round",
                                pointerEvents: "fill"
                              },
                              hover: {
                                fill: colorScale(prob, maxPredictionProb),
                                stroke: "#000",
                                strokeWidth: 0.3,
                                strokeLinejoin: "round",
                                strokeLinecap: "round",
                              },
                              pressed: { fill: colorScale(prob, maxPredictionProb), outline: "none" },
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
                          onMouseEnter={() => setGlobalHoveredCountry(geo.properties.name)}
                          onMouseLeave={() => setGlobalHoveredCountry(null)}
                          style={{
                            default: {
                              fill: colorScale(prob, maxPredictionProb),
                              stroke: "#000",
                              strokeWidth: 0.3,
                              strokeLinejoin: "round",
                              strokeLinecap: "round",
                              pointerEvents: "fill",
                              filter: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
                            },
                            hover: {
                              fill: colorScale(prob, maxPredictionProb),
                              stroke: "#000",
                              strokeWidth: 0.3,
                              strokeLinejoin: "round",
                              strokeLinecap: "round",
                              pointerEvents: "fill",
                              filter: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
                            },
                            pressed: { fill: colorScale(prob, maxPredictionProb), outline: "none" },
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

        {/* Help Button */}
        <button
          style={{
            position: 'absolute',
            top: '200px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            color: '#000',
            userSelect: 'none',
          }}
          onClick={toggleInstructions}
          aria-label="Help"
        >
          User Guide
        </button>

        { /* instructions pop up */}
        {showInstructions && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '700px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '15px',
              zIndex: 1000,
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>Instructions</h3>
            <p style={{ fontSize: '1.0rem', lineHeight: '2' }}>
              - <strong>Hover</strong> over a country to see its name.<br />
              - <strong>Zoom in/out</strong> using the "+" and "-" buttons on the left.<br />
              - <strong>Locked/Unlocked mode</strong>: Toggle the zoom on/off button to enable or disable gesture-based zoom.<br />
              - <strong>Click</strong> or <strong>Search</strong> a country to view its details and risk rating.<br />
              - <strong>Toggle modes</strong> at the top of the pannel to switch between predictive and overall indicators.<br />
              - <strong>Use the sliders</strong> to adjust parameters and see how they affect the prediction in <strong>real-time</strong>.<br />
              - <strong>Ranking Panel</strong>: Expand or collapse the ranking panel on the right to view country rankings.<br />
              - <strong>Risk Gradient</strong>: Use the gradient bar at the top-left to interpret risk levels (low to high).<br />
              - <strong>Reset the map</strong> using the reset button to restore default values.<br />
            </p>
            <button
              style={{
                marginTop: '15px',
                padding: '10px 15px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
              onClick={(event) => {
                toggleInstructions();
                setRankingPanelExpanded(true);
              }}

            >
              Close
            </button>
          </div>
        )}

        {/* Zoom Controls on the left side */}
        <div
          style={{
            position: 'absolute',
            top: '250px',
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
            top: '300px',
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
            top: '350px',
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
              fontSize: '0.55rem',
              color: '#000',
              userSelect: 'none',
            }}
          >
            {locked ? "Lock Zoom ON" : "Lock Zoom OFF"}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '400px',
            left: '10px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          onClick={() => {
            resetDataValues();
            console.log("Reset triggered", data, dataOG);
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
              fontSize: '0.7rem',
              color: '#000',
              userSelect: 'none',
            }}
          >
            Reset Map
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
            height: selectedCountry ? '685px' : (rankingPanelExpanded ? '685px' : '40px'),
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
            overflowY: 'auto',
            transition: 'width 0.3s ease, height 0.3s ease, transform 0.3s ease',
            zIndex: 999,
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
              <div className="sticky-header">
                <button className="close-btn" onClick={() => {
                  setSelectedCountry(null);
                  setManualZoom(false);
                  setTargetCenter([10, 5]);
                  setTargetZoom(1.3);
                }} style={{ right: '10px', }} >
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
                <h2 className="risk-header">
                  <div> Risk Rating:</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CircleProgress value={prob} />
                    <span>
                      {prob !== "N/A" ? (prob * 100).toFixed(2) + "%" : "N/A"}
                    </span>
                  </div>
                </h2>

                <h2 className="risk-header">
                  <div>
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
                    <span>
                      {probX !== "N/A" ? (probX * 100).toFixed(2) + "%" : "N/A"}
                    </span>
                  </div>
                </h2>
              </div>
              {selectedCountry && (
                !scoredState ? (

                  // Progress Bar View
                  <div className="slider-container">
                    {Object.keys(defaultSliders).map((key) => {
                      const maxValue = Math.max(...data.map(s => s[key] || 0));
                      const minValue = Math.abs(Math.min(...data.map(s => s[key] || 0)));
                      const countryData = data.find(s => s['country'] === selectedCountry);
                      const countryValue = countryData ? parseFloat(countryData[key]) : null;
                      const score = countryValue !== null && maxValue > 0 ? ((countryValue + minValue) / (maxValue + minValue)) * 10 : "N/A"
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
                          min={key === "Military_regime" ? "0" : "0"}
                          max={key === "Military_regime" ? "1" : "200"}
                          value={countrySliders[selectedCountry]?.[key] ?? 100}
                          onChange={(e) => handleSliderChange(e, key)}
                        />
                        <span>{countrySliders[selectedCountry]?.[key]}{key !== "Military_regime" ? "%" : ""}</span>                      </div>
                    ))}
                  </div>
                )
              )}

              {/* <button className="CountryWriteup" onClick={() => {
                window.location.hash = `#Country?name=${encodeURIComponent(selectedCountry)}`;
              }} style={{ marginTop: '20px', textAlign: 'center' }} >
                {"View Country Writeup"}
              </button> */}
              <a
                className="CountryWriteup"
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedCountry + " coup news")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: '20px', textAlign: 'center', display: 'inline-block', padding: '8px 16px', background: '#eee', textDecoration: 'none', borderRadius: '4px' }}
              >
                View Country Coup News
              </a>

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
                      {country.prediction_prob?.toFixed?.(4) ?? "N/A"}
                    </div>
                  </div>
                ))}
              </>
            )
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '3%',   // Change top and bottom for top/bottom left
          left: '11%',
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
        {/* Title */}
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
          }}
        >
          Current Risk
        </h3>
        {/* Gradient Bar with No Data Section */}
        <div
          style={{
            width: '180px',
            height: '20px',
            display: 'flex',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '5px',
          }}
        >
          {/* No Data Section */}
          <div style={{ width: '30px', backgroundColor: '#cfcccc' }}></div>
          {/* Gradient Section */}
          <div style={{ flex: 1, background: 'linear-gradient(to right, #EBEBEB, #00008B)' }}></div>
        </div>

        {/* Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: '0.6rem',
            marginTop: '2px',
          }}
        >
          <div style={{ width: '30px', textAlign: 'center', whiteSpace: 'nowrap' }}>
            <div>No</div>
            <div>Data</div>
          </div>
          <div style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
            <div>Low</div>
            <div>Risk</div>
          </div>
          <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
            <div>High</div>
            <div>Risk</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
import React, { useState, useEffect, useRef } from "react";
import "./CountrySearch.css";
import { ClipLoader } from "react-spinners";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function CountryDataSearch({ onCountrySelect, clearSearchTrigger, onResetClearSearch }) {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [sortDirection, setSortDirection] = useState(null); // "asc" or "desc"
  const [sortColumn, setSortColumn] = useState(""); // If empty, default to "Country"
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  const suggestionsRef = useRef([]);

  const sortOptions = [
    { label: "Country (A-Z)", key: "country" }, 
    { label: "Trade", key: "Trade"},
    { label: "% Change in GDP per capita", key: "Change_GDP_per_cap"},
    { label: "Democracy Level", key: "Democracy_level"},
    { label: "Women Political Participation", key: "Women_political_participation"},
    { label: "Protests", key: "Protests"},
    { label: "Military Regime", key: "Military_regime"},
    { label: "Military Influence", key: "Military_influence"},
    { label: "Prediction Probability", key: "prediction_prob" },
  ];

  const effectiveSortColumn = sortColumn || "country";

  useEffect(() => {
    if (loading) {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/thynec/CoupCats/refs/heads/main/recent_data.json"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setData(data);
        console.log("JSON loaded on mount");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("setting loading to false 2")
        setLoading(false);
      }
    };
  
    fetchData();
  }}, []);

  // When clearSearchTrigger becomes true, clear the search input.
  useEffect(() => {
    if (clearSearchTrigger) {
      setSearchQuery("");
      setShowSuggestions(false);
      onResetClearSearch();
    }
  }, [clearSearchTrigger, onResetClearSearch]);

  const filteredCountries = data.filter((country) => {
    const escapedQuery = escapeRegExp(searchQuery);
    const regex = new RegExp("\\b" + escapedQuery, "i");
    return regex.test(country.country);
  });

  const getDisplayedCountries = () => {
    let countries = showViewAll ? data : filteredCountries;
    countries = [...countries].sort((a, b) => {
      if (effectiveSortColumn === "country") {
        const comp = a.country.localeCompare(b.country);
        return sortDirection === "desc" ? -comp : comp;
      } else {
        const parseValue = (val) => {
          const num = Number(val);
          return isNaN(num) ? -1 : num;
        };
        const valA = parseValue(a[effectiveSortColumn]);
        const valB = parseValue(b[effectiveSortColumn]);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
    });
    return countries;
  };

  const displayedCountries = getDisplayedCountries();

  const sortTitle =
    effectiveSortColumn === "country"
      ? "Sorted by (A-Z)"
      : `Sorted by ${sortDirection === "asc" ? "Lowest to Highest" : "Highest to Lowest"}: ${
          sortOptions.find((opt) => opt.key === effectiveSortColumn)?.label || effectiveSortColumn
        }`;

  const handleSuggestionClick = (country) => {
    setSelectedCountry(country);
    setSearchQuery(country.country);
    setShowSuggestions(false);
    setShowViewAll(false);
    setHighlightedIndex(-1);
    if (onCountrySelect) {
      onCountrySelect(country);
    }
  };

  const handleFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedCountry) {
      setSelectedCountry(null);
      if (onCountrySelect) {
        onCountrySelect(null);
      }
    }
    setShowSuggestions(value.trim().length > 0);
    setShowViewAll(false);
    setHighlightedIndex(-1);
  };

  const clearInput = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedCountry(null);
    if (onCountrySelect) {
      onCountrySelect(null);
    }
    setSortColumn("");
    setSortDirection(null);
    setHighlightedIndex(-1);
  };

  const toggleViewAll = () => {
    if (showViewAll) {
      setSearchQuery("");
      setSortColumn("");
      setSortDirection(null);
      setShowSuggestions(false);
      setShowViewAll(false);
      setHighlightedIndex(-1);
    } else {
      setShowViewAll(true);
      setSortColumn("country");
      setSortDirection("asc");
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortColumn(value);
    setSortDirection(value === "country" ? "asc" : "desc");
  };

  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredCountries.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          handleSuggestionClick(filteredCountries[highlightedIndex]);
        } else {
          const match = filteredCountries.find(
            (country) => country.country.toLowerCase() === searchQuery.toLowerCase()
          );
          if (match) {
            handleSuggestionClick(match);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current[highlightedIndex]) {
      suggestionsRef.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={35} color="#000" loading={true} />
      </div>
    );
  }
  // Render loading state at the end of the component
  return (
    <div className="CountryDataSearch" style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ marginRight: "1rem", fontSize: "1.5rem" }}>Country Search</h1>
        <div style={{ position: "relative", flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Search for a country..."
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid black",
              borderRadius: "4px",
            }}
          />
          {searchQuery && (
            <button
              onClick={clearInput}
              style={{
                position: "absolute",
                right: "5px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {!selectedCountry && !searchQuery && (
          <button
            onClick={toggleViewAll}
            className="button"
            style={{ marginLeft: "1rem", padding: "0.5rem 1rem", fontSize: "1rem" }}
          >
            {showViewAll ? "Close" : "View All"}
          </button>
        )}
      </div>

      <div
        className="view-all-wrapper"
        style={{
          overflow: "hidden",
          transition: "max-height 0.5s ease-in-out",
          maxHeight: showViewAll ? "500px" : "0px",
        }}
      >
        <div className="view-all-content" style={{ paddingTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <label htmlFor="sort-select" style={{ margin: 0, fontSize: "1rem" }}>Sort by:</label>
            <select
              id="sort-select"
              value={effectiveSortColumn}
              onChange={handleSortChange}
              className="dropdown"
              style={{
                fontSize: "1rem",
                padding: "0.25rem",
                border: "1px solid black",
                borderRadius: "4px",
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            {effectiveSortColumn !== "country" && (
              <>
                <label htmlFor="sort-direction" style={{ margin: 0, fontSize: "1rem" }}>Order:</label>
                <select
                  id="sort-direction"
                  value={sortDirection || "asc"}
                  onChange={handleSortDirectionChange}
                  className="dropdown"
                  style={{
                    fontSize: "1rem",
                    padding: "0.25rem",
                    border: "1px solid black",
                    borderRadius: "4px",
                  }}
                >
                  <option value="desc">Highest to Lowest</option>
                  <option value="asc">Lowest to Highest</option>
                </select>
              </>
            )}
          </div>
          {sortTitle && <h3 style={{ marginBottom: "1rem" }}>{sortTitle}</h3>}
          <div
            className="view-all-list"
            style={{
              border: "1px solid #ccc",
              marginBottom: "1rem",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {displayedCountries.map((country, index) => (
              <div
                key={country.country}
                onClick={() => handleSuggestionClick(country)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
              >
                {effectiveSortColumn !== "country" && (
                  <div style={{ marginRight: "1rem", width: "30px", textAlign: "right" }}>
                    {index + 1}.
                  </div>
                )}
                <div style={{ flex: "1", textAlign: "left" }}>{country.country}</div>
                {effectiveSortColumn !== "country" && (
                  <span style={{ marginLeft: "1rem" }}>{country[effectiveSortColumn]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSuggestions && searchQuery.trim().length > 0 && !showViewAll && (
        <ul
          className="suggestions-list"
          style={{
            listStyle: "none",
            padding: 0,
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            marginBottom: "1rem",
          }}
        >
          {filteredCountries.map((country, index) => (
            <li
              key={country.country}
              ref={(el) => (suggestionsRef.current[index] = el)}
              onClick={() => handleSuggestionClick(country)}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                borderBottom: "1px solid #ccc",
                backgroundColor: index === highlightedIndex ? "lightgray" : "#fff",
              }}
            >
              {country.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CountryDataSearch;

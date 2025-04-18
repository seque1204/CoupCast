import React, { useEffect, useState } from "react";

const RotateWarning = () => {
  const [shouldShowOverlay, setShouldShowOverlay] = useState(false);
  const [message, setMessage] = useState("");

  const checkIfShouldShow = () => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    const zoomRatio = window.innerWidth / window.outerWidth;
    const isZoomedIn = zoomRatio < 0.95; // Tweak threshold if needed

    if (isMobile && isPortrait) {
      setShouldShowOverlay(true);
      setMessage("Please rotate your device to landscape mode");
    } else if (isMobile && isZoomedIn) {
      setShouldShowOverlay(true);
      setMessage("Please zoom out your browser for the best experience");
    } else {
      setShouldShowOverlay(false);
      setMessage("");
    }
  };

  useEffect(() => {
    checkIfShouldShow();
    window.addEventListener("resize", checkIfShouldShow);
    window.addEventListener("orientationchange", checkIfShouldShow);
    return () => {
      window.removeEventListener("resize", checkIfShouldShow);
      window.removeEventListener("orientationchange", checkIfShouldShow);
    };
  }, []);

  if (!shouldShowOverlay) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      color: "white",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "2rem",
      animation: "fadeIn 0.5s ease-in-out"
    }}>
      <div style={{
        fontSize: "3rem",
        marginBottom: "1rem",
        animation: "bounce 2s infinite"
      }}>
        🔍
      </div>
      <h2 style={{ fontSize: "1.5rem", maxWidth: "300px" }}>{message}</h2>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RotateWarning;

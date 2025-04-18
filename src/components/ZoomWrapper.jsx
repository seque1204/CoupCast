import React, { useEffect, useState } from "react";

const ZoomWrapper = ({ children, baseWidth = 1200 }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const newScale = Math.min(screenWidth / baseWidth, 1); // never scale up, only down
      setScale(newScale);
    };

    updateScale(); // run once on mount
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [baseWidth]);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      {children}
    </div>
  );
};

export default ZoomWrapper;

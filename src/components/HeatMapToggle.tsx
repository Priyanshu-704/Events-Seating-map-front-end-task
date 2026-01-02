import React from "react";


interface HeatMapToggleProps {
  showHeatMap: boolean;
  toggleHeatMap: () => void;
  darkMode?: boolean;
}

const HeatMapToggle: React.FC<HeatMapToggleProps> = ({
  showHeatMap,
  toggleHeatMap,
  darkMode = false,
}) => {
  return (
    <button
      onClick={toggleHeatMap}
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-lg 
        transition-all duration-200 focus:outline-none 
        focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        ${darkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"}
        ${
          showHeatMap
            ? darkMode
              ? "bg-gradient-to-r from-red-900/30 to-orange-900/30 text-red-300 border border-red-800 hover:from-red-900/40 hover:to-orange-900/40"
              : "bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-300 hover:from-red-200 hover:to-orange-200"
            : darkMode
            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }
        shadow-md hover:shadow-lg
      `}
      aria-label={
        showHeatMap ? "Switch to normal view" : "Switch to price heat map"
      }
      aria-pressed={showHeatMap}
    >
      {showHeatMap ? (
        <>
          
          <span className="font-medium">Normal View</span>
        </>
      ) : (
        <>
          <span className="font-medium">Price Heat </span>
        </>
      )}
    </button>
  );
};

export default HeatMapToggle;

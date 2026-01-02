/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import VenueMap from "./components/VenueMap";
import SelectionSummary from "./components/SelectionSummary";
import SeatDetails from "./components/SeatDetails";
import Checkout from "./components/Checkout";
import { useSeatSelection } from "./hooks/useSeatSelection";
import { VenueData, Seat } from "./types";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import HeatMapToggle from "./components/HeatMapToggle";

function App() {
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  const {
    selectedSeats,
    toggleSeat,
    clearSelection,
    highlightedSeat,
    setHighlightedSeat,
    selectedCount,
    maxSelections,
    isSeatSelected,
    isLoading: seatLoading,
  } = useSeatSelection();

  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const [showHeatMap, setShowHeatMap] = useState(false);

  useEffect(() => {
    if (selectedCount === maxSelections) {
      setShowLimitDialog(true);
    }
  }, [selectedCount, maxSelections]);

  const toggleHeatMap = () => {
    setShowHeatMap(!showHeatMap);
  };

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.setProperty("color-scheme", "dark");
      document.documentElement.setAttribute("data-color-mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.setProperty("color-scheme", "light");
      document.documentElement.setAttribute("data-color-mode", "light");
    }
  }, [darkMode]);

  const allSeats = useMemo(() => {
    if (!venueData) return [];
    return venueData.sections.flatMap((section) =>
      section.rows.flatMap((row) => row.seats)
    );
  }, [venueData]);

  const selectedSeatObjects = useMemo(() => {
    if (!venueData) return [];
    const selectedIdsArray = Array.from(selectedSeats);
    return allSeats.filter((seat) => selectedIdsArray.includes(seat.id));
  }, [allSeats, selectedSeats]);

  useEffect(() => {
    const loadVenueData = async () => {
      try {
        const response = await fetch("/venue.json");
        if (response.ok) {
          const data = await response.json();
          setVenueData(data);
        } else {
          throw new Error(`Failed to load venue data: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to load venue data:", error);
        setError("Failed to load venue data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadVenueData();
  }, []);

  const overallLoading = isLoading || seatLoading;

  if (overallLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
            Loading venue map and seat selections...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <div className="text-red-500">
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className="w-full h-full"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <div className="text-gray-500">
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className="w-full h-full"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
            No venue data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isCheckoutPage && (
                <Link
                  to="/"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  <ArrowLeft
                    size={20}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </Link>
              )}
              <div className="ml-3 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {venueData.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isCheckoutPage && (
                <HeatMapToggle
                  showHeatMap={showHeatMap}
                  toggleHeatMap={toggleHeatMap}
                  darkMode={darkMode}
                />
              )}
              <button
                onClick={toggleDarkMode}
                className="relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 shadow-md"
                aria-pressed={darkMode}
                aria-label={
                  darkMode
                    ? "Switch to light mode. Currently using dark mode"
                    : "Switch to dark mode. Currently using light mode"
                }
                aria-live="polite"
              >
                <span
                  className={`
                    flex items-center justify-center
                    h-8 w-8 transform rounded-full shadow-lg
                    transition-all duration-300 ease-in-out border-2
                    ${
                      darkMode
                        ? "translate-x-0 bg-white border-gray-300"
                        : "translate-x-10 bg-yellow-600 border-yellow-700 text-white"
                    }
                  `}
                  aria-hidden="true"
                >
                  {darkMode ? (
                    <Sun size={18} className="text-yellow-500 drop-shadow-sm" />
                  ) : (
                    <Moon size={18} className="text-white drop-shadow-sm" />
                  )}
                </span>

                <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                  <span
                    className={`transition-opacity duration-300 ${
                      darkMode ? "opacity-30" : "opacity-70"
                    }`}
                  >
                    <Sun
                      size={14}
                      className="text-gray-600 dark:text-gray-400"
                    />
                  </span>

                  <span
                    className={`transition-opacity duration-300 ${
                      darkMode ? "opacity-70" : "opacity-30"
                    }`}
                  >
                    <Moon
                      size={14}
                      className="text-gray-600 dark:text-gray-400"
                    />
                  </span>
                </span>

                <span className="sr-only" role="status">
                  {darkMode ? "Dark mode enabled" : "Light mode enabled"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 pb-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="lg:flex-1">
                  <div
                    className="
                       bg-white dark:bg-gray-800
                       rounded-xl shadow-sm
                        border border-gray-200 dark:border-gray-700
                        p-4 lg:p-6
                        transition-colors duration-200
                         h-[calc(100vh-140px)]
                         min-h-[500px]
                         max-h-[700px]
                      "
                  >
                    <VenueMap
                      venueData={venueData}
                      onSeatHover={setHoveredSeat}
                      onSeatSelect={setSelectedSeat}
                      onToggleSeat={toggleSeat}
                      isSeatSelected={isSeatSelected}
                      highlightedSeat={highlightedSeat}
                      setHighlightedSeat={setHighlightedSeat}
                      darkMode={darkMode}
                      showHeatMap={showHeatMap}
                      toggleHeatMap={toggleHeatMap}
                    />
                  </div>
                </div>

                <div className="lg:w-96">
                  <div className="sticky top-24 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
                      <SeatDetails
                        seat={hoveredSeat ?? selectedSeat}
                        isHovered={!!hoveredSeat}
                      />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
                      <SelectionSummary
                        seats={selectedSeatObjects}
                        selectedSeatIds={selectedSeats}
                        onRemove={toggleSeat}
                        onClear={clearSelection}
                        selectedCount={selectedCount}
                        maxSelections={maxSelections}
                      />
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                selectedSeats={selectedSeatObjects}
                clearSelection={clearSelection}
                venueData={venueData}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showLimitDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLimitDialog(false)}
          />

          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Seat Limit Reached
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can select a maximum of <strong>{maxSelections}</strong> seats
              per booking.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLimitDialog(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                OK
              </button>

              <button
                onClick={() => {
                  clearSelection();
                  setShowLimitDialog(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

import { useState, useEffect, useCallback } from "react";

const MAX_SELECTIONS = 8;
const STORAGE_KEY = "seat-selections";

export const useSeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [highlightedSeat, setHighlightedSeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const seatIds = parsed.map((item) =>
            typeof item === "string" ? item : item.seatId
          );
          setSelectedSeats(new Set(seatIds));
        } else if (
          parsed.selectedSeats &&
          Array.isArray(parsed.selectedSeats)
        ) {
          setSelectedSeats(new Set(parsed.selectedSeats));
        }
      }
    } catch (error) {
      console.error("Failed to load seat selections:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        const seatArray = Array.from(selectedSeats);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seatArray));
      } catch (error) {
        console.error("Failed to save seat selections:", error);
      }
    }
  }, [selectedSeats, isLoading]);

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);

      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= MAX_SELECTIONS) {
          return prev;
        }
        next.add(seatId);
      }

      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isSeatSelected = useCallback(
    (seatId: string) => {
      return selectedSeats.has(seatId);
    },
    [selectedSeats]
  );

  return {
    selectedSeats,
    highlightedSeat,
    setHighlightedSeat,
    toggleSeat,
    clearSelection,
    isSeatSelected,
    selectedCount: selectedSeats.size,
    maxSelections: MAX_SELECTIONS,
    isLoading,
  };
};

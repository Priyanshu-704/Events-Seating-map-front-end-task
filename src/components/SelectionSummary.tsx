import React, { useMemo } from "react";
import { X, ShoppingCart, Trash2, CheckCircle, Ticket } from "lucide-react";
import { Seat } from "../types";
import { PRICE_TIERS } from "../data/mockVenue";

interface SelectionSummaryProps {
  seats: Seat[];
  selectedSeatIds: Set<string>;
  onRemove: (seatId: string) => void;
  onClear: () => void;
  selectedCount: number;
  maxSelections: number;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  seats,
  onRemove,
  onClear,
  selectedCount,
  maxSelections,
}) => {
  const seatsWithPrices = useMemo(() => {
    return seats.map((seat) => {
      const tier =
        PRICE_TIERS.find((t) => t.id === seat.priceTier) || PRICE_TIERS[0];
      return {
        ...seat,
        price: tier.price,
        tierName: tier.name,
        tierColor: tier.color,
      };
    });
  }, [seats]);

  const subtotal = useMemo(() => {
    return seatsWithPrices.reduce((total, seat) => total + seat.price, 0);
  }, [seatsWithPrices]);

  const serviceFee = useMemo(() => subtotal * 0.12, [subtotal]);
  const total = useMemo(() => subtotal + serviceFee, [subtotal, serviceFee]);

  if (seats.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Your Selection
              </h2>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {selectedCount}/{maxSelections}
            </span>
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <ShoppingCart className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            No seats selected yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on available seats to add them to your selection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-gray-700 dark:text-gray-300" size={20} />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Your Selection
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCount}/{maxSelections}
              </span>
            </div>
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Clear all selections"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {seatsWithPrices.map((seat) => (
            <div
              key={seat.id}
              className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <Ticket size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {seat.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: seat.tierColor }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {seat.tierName}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Section {seat.section} • Row {seat.row} • Seat {seat.number}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  ₹{seat.price.toFixed(2)}
                </span>
                <button
                  onClick={() => onRemove(seat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                  aria-label={`Remove seat ${seat.id}`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Order Summary
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Seats ({seats.length})</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Service Fee (12%)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{serviceFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total Amount
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Including all fees and taxes
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

 
          <div className="flex gap-3">
            <button
              onClick={onClear}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </button>
            <button
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={selectedCount === 0}
              onClick={() => window.location.href = "/checkout"}
            >
              <CheckCircle size={18} />
              Checkout
            </button>
          </div>

     
          {selectedCount >= maxSelections && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 text-center">
                ✓ Maximum selection limit reached ({maxSelections} seats)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionSummary;
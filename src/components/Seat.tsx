import React, { memo } from "react";
import { Seat as SeatType } from "../types";
import { PRICE_TIERS } from "../data/mockVenue";

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (seat: SeatType) => void;
  onFocus: (seatId: string | null) => void;
  onHover?: (seat: SeatType | null) => void; 
  absoluteX: number;
  absoluteY: number;
  showHeatMap?: boolean;
}

const getSeatColor = (
  seat: SeatType,
  isSelected: boolean,
  isHighlighted: boolean,
  showHeatMap: boolean,
  isAvailable: boolean
) => {
  if (isSelected) return "#3b82f6";
  if (isHighlighted) return "#f59e0b";

  if (showHeatMap) {
    const priceTier =
      PRICE_TIERS.find((t) => t.id === seat.priceTier) || PRICE_TIERS[0];
    return priceTier.color;
  } else {
    if (!isAvailable) return "#6b7280";
    return "#10b981";
  }
};

const getStrokeColor = (
  seat: SeatType,
  isSelected: boolean,
  isHighlighted: boolean,
  showHeatMap: boolean,
  isAvailable: boolean
) => {
  if (isSelected) return "#1d4ed8";
  if (isHighlighted) return "#d97706";

  if (showHeatMap) {
    const colorMap: Record<string, string> = {
      premium: "#dc2626",
      vip: "#ea580c",
      standard: "#059669",
      economy: "#2563eb",
      balcony: "#7c3aed",
    };

    const tier = seat.priceTier ?? "standard";
    return colorMap[tier] ?? "#6b7280";
  }

  return isAvailable ? "#059669" : "#4b5563";
};

let hoverTimeout: NodeJS.Timeout | null = null;

const Seat = memo(
  ({
    seat,
    isSelected,
    isHighlighted,
    onClick,
    onFocus,
    onHover,
    absoluteX,
    absoluteY,
    showHeatMap = false,
  }: SeatProps) => {
    const priceTier =
      PRICE_TIERS.find((t) => t.id === seat.priceTier) || PRICE_TIERS[0];
    const isAvailable = seat.status === "available";

    
    const seatColor = React.useMemo(
      () =>
        getSeatColor(seat, isSelected, isHighlighted, showHeatMap, isAvailable),
      [seat, isSelected, isHighlighted, showHeatMap, isAvailable]
    );

    const strokeColor = React.useMemo(
      () =>
        getStrokeColor(
          seat,
          isSelected,
          isHighlighted,
          showHeatMap,
          isAvailable
        ),
      [seat, isSelected, isHighlighted, showHeatMap, isAvailable]
    );

    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAvailable) {
          onClick(seat);
        }
      },
      [isAvailable, onClick, seat]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isAvailable) {
            onClick(seat);
          }
        }
      },
      [isAvailable, onClick, seat]
    );

    const handleFocus = React.useCallback(() => {
      onFocus(seat.id);
    }, [onFocus, seat.id]);

    const handleBlur = React.useCallback(() => {
      onFocus(null);
    }, [onFocus]);

    const handleMouseEnter = React.useCallback(() => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      hoverTimeout = setTimeout(() => {
         onHover?.(seat);
        onFocus(seat.id);
      }, 16);
    }, [onFocus, onHover, seat]);

    const handleMouseLeave = React.useCallback(() => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      onFocus(null);
    }, [onFocus]);

    const cursor = isAvailable ? "cursor-pointer" : "cursor-not-allowed";

    return (
      <g
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={isAvailable ? 0 : -1}
        role="button"
        aria-label={`Seat ${seat.id}, ${priceTier.name}, ${seat.status}, Price: ₹${priceTier.price}`}
        aria-disabled={!isAvailable}
        className={`seat ${cursor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        transform={`translate(${absoluteX}, ${absoluteY})`}
      >
        <rect
          x="2"
          y="2"
          width="30"
          height="30"
          fill="rgba(0,0,0,0.1)"
          rx="6"
        />

        <rect
          x="0"
          y="0"
          width="30"
          height="30"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth={showHeatMap ? "1.5" : "2"}
          rx="6"
          className="transition-all duration-150 hover:opacity-90"
        />

        {isSelected && (
          <rect
            x="-3"
            y="-3"
            width="36"
            height="36"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="4"
            rx="9"
          />
        )}

        {isHighlighted && (
          <rect
            x="-4"
            y="-4"
            width="38"
            height="38"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            rx="11"
          />
        )}

        {showHeatMap && !isSelected && (
          <text
            x="15"
            y="19"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            className="select-none pointer-events-none"
          >
            ₹{priceTier.price}
          </text>
        )}

        {!showHeatMap && !isSelected && (
          <text
            x="15"
            y="19"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
            className="select-none pointer-events-none"
          >
            {seat.id.split("-")[2]}
          </text>
        )}

        {isSelected && (
          <text
            x="15"
            y="19"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            className="select-none pointer-events-none"
          >
            ✓
          </text>
        )}
      </g>
    );
  }
);

Seat.displayName = "Seat";

export default Seat;

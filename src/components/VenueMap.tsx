import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { VenueData, Seat, Section } from "../types";
import SeatComponent from "./Seat";
import { Layers, IndianRupee } from "lucide-react";

interface VenueMapProps {
  venueData: VenueData;
  onSeatHover: (seat: Seat | null) => void;
  onSeatSelect: (seat: Seat) => void;
  onToggleSeat: (seatId: string) => void;
  isSeatSelected: (seatId: string) => boolean;
  highlightedSeat: string | null;
  setHighlightedSeat: (seatId: string | null) => void;
  darkMode?: boolean;
  showHeatMap?: boolean;
  toggleHeatMap?: () => void;
}

const ROW_GAP = 35;
const SEAT_GAP = 40;

const SECTION_GAP = 180;
const SECTION_HORIZONTAL_GAP = 100;

const AISLE_EVERY = 4;   
const AISLE_GAP = 20;   

const getAbsoluteSeatPosition = (
  seat: Seat,
  section: Section,
  rowIndex: number,
  sectionIndex: number
) => {
  const scale = section.transform.scale;

  const col = seat.col ?? 1;

  const aisleCount =
    AISLE_EVERY > 0
      ? Math.floor((col - 1) / AISLE_EVERY)
      : 0;

  const absoluteX =
    section.transform.x +
    sectionIndex * SECTION_HORIZONTAL_GAP +
    (col - 1) * SEAT_GAP * scale +
    aisleCount * AISLE_GAP * scale;

  const absoluteY =
    section.transform.y +
    sectionIndex * SECTION_GAP +
    rowIndex * ROW_GAP * scale;

  return {
    ...seat,
    absoluteX,
    absoluteY,
  };
};

const transformSeatsToAbsolute = (venueData: VenueData) => {
  const allSeats: Array<Seat & { absoluteX: number; absoluteY: number }> = [];

  venueData.sections.forEach((section, sectionIdx) => {
    section.rows.forEach((row, rowIdx) => {
      row.seats.forEach((seat) => {
        const absoluteSeat = getAbsoluteSeatPosition(
          seat,
          section,
          rowIdx,
          sectionIdx
        );
        allSeats.push(absoluteSeat);
      });
    });
  });

  return allSeats;
};

const VenueMap: React.FC<VenueMapProps> = ({
  venueData,
  onSeatHover,
  onSeatSelect,
  onToggleSeat,
  isSeatSelected,
  highlightedSeat,
  setHighlightedSeat,
  darkMode = false,
  showHeatMap = false,
  toggleHeatMap,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const styles = useMemo(
    () => ({
      container: darkMode
        ? "bg-gray-900 text-gray-100"
        : "bg-gray-100 text-gray-900",
      grid: darkMode ? "#374151" : "#e5e7eb",
      sectionLabel: darkMode ? "#d1d5db" : "#374151",
      controls: {
        bg: darkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-white hover:bg-gray-50",
        text: darkMode ? "text-gray-100" : "text-gray-900",
        shadow: darkMode ? "shadow-lg shadow-black/30" : "shadow-lg",
      },
      mapBackground: darkMode ? "#111827" : "#ffffff",
      heatMapToggle: {
        bg: showHeatMap
          ? darkMode
            ? "bg-red-900/30 hover:bg-red-900/40"
            : "bg-red-100 hover:bg-red-200"
          : darkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-white hover:bg-gray-50",
        text: showHeatMap
          ? darkMode
            ? "text-red-300"
            : "text-red-700"
          : darkMode
          ? "text-gray-100"
          : "text-gray-900",
      },
    }),
    [darkMode, showHeatMap]
  );

  const allSeatsWithAbsolutePos = useMemo(
    () => transformSeatsToAbsolute(venueData),
    [venueData]
  );

  const handleSeatHover = useCallback(
    (seat: Seat | null) => {
      onSeatHover(seat);
      setHighlightedSeat(seat ? seat.id : null);
    },
    [onSeatHover, setHighlightedSeat]
  );

  const findClosestSeat = useCallback(
    (currentSeatId: string, dx: number, dy: number): Seat | undefined => {
      const currentSeat = allSeatsWithAbsolutePos.find(
        (s) => s.id === currentSeatId
      );
      if (!currentSeat) return undefined;

      const targetX = currentSeat.absoluteX + dx;
      const targetY = currentSeat.absoluteY + dy;

      return allSeatsWithAbsolutePos
        .filter((seat) => seat.id !== currentSeatId)
        .reduce(
          (closest, seat) => {
            const distance = Math.sqrt(
              Math.pow(seat.absoluteX - targetX, 2) +
                Math.pow(seat.absoluteY - targetY, 2)
            );

            if (!closest.seat || distance < closest.distance) {
              return { seat, distance };
            }
            return closest;
          },
          {
            seat: undefined as (typeof allSeatsWithAbsolutePos)[0] | undefined,
            distance: Infinity,
          }
        )?.seat;
    },
    [allSeatsWithAbsolutePos]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!highlightedSeat || !svgRef.current) return;

      e.preventDefault();
      const step = 40;
      let targetSeat: (typeof allSeatsWithAbsolutePos)[0] | undefined;

      switch (e.key) {
        case "ArrowUp":
          targetSeat = findClosestSeat(highlightedSeat, 0, -step);
          break;
        case "ArrowDown":
          targetSeat = findClosestSeat(highlightedSeat, 0, step);
          break;
        case "ArrowLeft":
          targetSeat = findClosestSeat(highlightedSeat, -step, 0);
          break;
        case "ArrowRight":
          targetSeat = findClosestSeat(highlightedSeat, step, 0);
          break;
        case "Enter":
        case " ": {
          const currentSeat = allSeatsWithAbsolutePos.find(
            (s) => s.id === highlightedSeat
          );
          if (currentSeat && currentSeat.status === "available") {
            onToggleSeat(currentSeat.id);
          }
          break;
        }
        case "Escape":
          setHighlightedSeat(null);
          break;
        case "h":
        case "H":
          if (toggleHeatMap) {
            e.preventDefault();
            toggleHeatMap();
          }
          break;
      }

      if (targetSeat) {
        setHighlightedSeat(targetSeat.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    highlightedSeat,
    allSeatsWithAbsolutePos,
    onToggleSeat,
    setHighlightedSeat,
    findClosestSeat,
    toggleHeatMap,
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const dx = (e.clientX - startPan.x) / scale;
      const dy = (e.clientY - startPan.y) / scale;

      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPan({ x: e.clientX, y: e.clientY });
    },
    [isPanning, startPan, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, scale * delta));

      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleFactor = newScale / scale;
        setOffset((prev) => ({
          x: mouseX - (mouseX - prev.x) * scaleFactor,
          y: mouseY - (mouseY - prev.y) * scaleFactor,
        }));
      }

      setScale(newScale);
    },
    [scale]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setStartPan({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPanning || e.touches.length !== 1) return;

      e.preventDefault();
      const dx = (e.touches[0].clientX - startPan.x) / scale;
      const dy = (e.touches[0].clientY - startPan.y) / scale;

      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPan({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    },
    [isPanning, startPan, scale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheelBound = (e: WheelEvent) => handleWheel(e);
    svg.addEventListener("wheel", handleWheelBound, { passive: false });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      svg.removeEventListener("wheel", handleWheelBound);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || e.target === svgRef.current) {
        setHighlightedSeat(null);
      }
    },
    [setHighlightedSeat]
  );

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status === "available") {
        onToggleSeat(seat.id);
        onSeatSelect(seat);
      }
      setHighlightedSeat(seat.id);
    },
    [onToggleSeat, onSeatSelect, setHighlightedSeat]
  );

  return (
    <div
      ref={containerRef}
      className={`
    relative
    w-full
    h-full
    overflow-hidden
    rounded-lg
    transition-colors duration-200
    ${styles.container}
  `}
      onClick={handleContainerClick}
      data-dark-mode={darkMode}
    >
      <svg
        ref={svgRef}
        width={venueData.map.width}
        height={venueData.map.height}
        viewBox={`${offset.x} ${offset.y} ${venueData.map.width / scale} ${
          venueData.map.height / scale
        }`}
        className={`w-full h-full ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${venueData.name} seating map ${
          showHeatMap ? "with price heat map" : ""
        }`}
      >
        <rect
          x="0"
          y="0"
          width={venueData.map.width}
          height={venueData.map.height}
          fill={styles.mapBackground}
        />

        <defs>
          <pattern
            id={`grid-${darkMode ? "dark" : "light"}`}
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke={styles.grid}
              strokeWidth="1"
              className="transition-colors duration-200"
            />
          </pattern>
        </defs>

        <rect
          x="0"
          y="0"
          width={venueData.map.width}
          height={venueData.map.height}
          fill={`url(#grid-${darkMode ? "dark" : "light"})`}
          className="transition-colors duration-200"
        />

        {venueData.sections.map((section, sectionIdx) => (
  <g key={section.id}>
    <text
      x={
        section.transform.x +
        sectionIdx * SECTION_HORIZONTAL_GAP
      }
      y={section.transform.y + sectionIdx * SECTION_GAP - 16}
      fill={styles.sectionLabel}
      fontSize="14"
      fontWeight="bold"
    >
      {section.label}
    </text>
  </g>
))}


        {allSeatsWithAbsolutePos.map((seat) => (
          <SeatComponent
            key={seat.id}
            seat={seat}
            isSelected={isSeatSelected(seat.id)}
            isHighlighted={highlightedSeat === seat.id}
            onClick={handleSeatClick}
            onFocus={setHighlightedSeat}
            onHover={handleSeatHover}
            absoluteX={seat.absoluteX}
            absoluteY={seat.absoluteY}
            showHeatMap={showHeatMap}
          />
        ))}
      </svg>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {toggleHeatMap && (
          <button
            onClick={toggleHeatMap}
            className={`p-3 rounded-lg transition-all duration-200 ${styles.heatMapToggle.bg} ${styles.heatMapToggle.text} ${styles.controls.shadow} hover:scale-105 active:scale-95 flex items-center justify-center`}
            aria-label={
              showHeatMap ? "Switch to normal view" : "Switch to price heat map"
            }
            aria-pressed={showHeatMap}
          >
            {showHeatMap ? <Layers size={20} /> : <IndianRupee size={20} />}
          </button>
        )}

        <button
          onClick={() => setScale((s) => Math.min(3, s * 1.2))}
          className={`p-3 rounded-lg transition-all duration-200 ${styles.controls.bg} ${styles.controls.text} ${styles.controls.shadow} hover:scale-105 active:scale-95`}
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.1, s * 0.8))}
          className={`p-3 rounded-lg transition-all duration-200 ${styles.controls.bg} ${styles.controls.text} ${styles.controls.shadow} hover:scale-105 active:scale-95`}
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          className={`p-3 rounded-lg transition-all duration-200 ${styles.controls.bg} ${styles.controls.text} ${styles.controls.shadow} hover:scale-105 active:scale-95`}
          aria-label="Reset view"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VenueMap;

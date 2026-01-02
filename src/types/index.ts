export interface Seat {
  tierId: string | number;
  id: string;
  section: string;
  row: string;
  number: string;
  price: number;
  status:
    | "available"
    | "reserved"
    | "sold"
    | "held";
  absoluteX: number;
  absoluteY: number;
  width?: number;
  height?: number;
  label?: string;
  priceTier?: number;
  col?: number;
  x: number;
  y: number;
}

export interface MapDimensions {
  width: number;
  height: number;
  viewBox: string;
}

export interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface VenueData {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

export interface SeatSelection {
  seat: Seat;
  timestamp: number;
}

export interface SelectionSummary {
  seats: SeatSelection[];
  subtotal: number;
  maxSeats: number;
}

export interface PriceTier {
  id: number;
  name: string;
  price: number;
  color: string;
  description: string;
}

export interface SelectedSeat {
  seatId: string;
  timestamp: number;
}

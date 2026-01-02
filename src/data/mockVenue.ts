import { PriceTier } from "../types";

export const PRICE_TIERS: PriceTier[] = [
  { 
    id: 1, 
    price: 149.99, 
    color: "#f59e0b", 
    name: "Premium", 
    description: "Premium Seating" 
  },
  { 
    id: 2, 
    price: 99.99, 
    color: "#10b981", 
    name: "Standard",
    description: "Standard Seating"
  },
  { 
    id: 3, 
    price: 69.99, 
    color: "#3b82f6", 
    name: "Economy",
    description: "Economy Seating"
  },
  { 
    id: 4, 
    price: 39.99, 
    color: "#8b5cf6", 
    name: "Budget",
    description: "Budget Seating"
  },
];
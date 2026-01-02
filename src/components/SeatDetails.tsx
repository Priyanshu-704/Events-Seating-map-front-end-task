import React from "react";
import { Seat } from "../types";
import { PRICE_TIERS } from "../data/mockVenue";
import {

  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Ticket,
} from "lucide-react";

interface SeatDetailsProps {
  seat: Seat | null;
  isHovered?: boolean;

}

const SeatDetails: React.FC<SeatDetailsProps> = ({
  seat,
 
  isHovered = false,
}) => {
  if (!seat) return null;

  const priceTier =
    PRICE_TIERS.find((t) => t.id === seat.priceTier) || PRICE_TIERS[0];

  const getStatusIcon = () => {
    switch (seat.status) {
      case "available":
        return (
          <CheckCircle
            className="text-green-500 dark:text-green-400"
            size={18}
          />
        );
      case "reserved":
        return (
          <Clock className="text-amber-500 dark:text-amber-400" size={18} />
        );
      case "sold":
        return <XCircle className="text-red-500 dark:text-red-400" size={18} />;
      case "held":
        return <User className="text-blue-500 dark:text-blue-400" size={18} />;
    }
  };

  const getStatusText = () => {
    switch (seat.status) {
      case "available":
        return "Available";
      case "reserved":
        return "Reserved";
      case "sold":
        return "Sold";
      case "held":
        return "Held";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        isHovered ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg" : ""
      }`}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="text-gray-600 dark:text-gray-300" size={18} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Seat Details
            </h3>
          </div>
         
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-600 dark:text-blue-400" size={16} />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Seat ID
              </span>
            </div>
            <span className="font-mono text-lg font-bold text-blue-900 dark:text-blue-200">
              {seat.id}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor()}">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Section
            </p>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-semibold text-gray-900 dark:text-white">
                {seat.id.split("-")[0]}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Row
            </p>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-semibold text-gray-900 dark:text-white">
                {seat.id.split("-")[1]}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Seat Number
            </p>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-semibold text-gray-900 dark:text-white">
                {seat.id.split("-")[2]}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Price Tier
            </p>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: priceTier.color }}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {priceTier.name}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Price
            </p>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Price
                </span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ₹{priceTier.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Includes all applicable fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatDetails;

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Seat } from "../types";
import { VenueData } from "../types";
import { PRICE_TIERS } from "../data/mockVenue";
import {
  CreditCard,
  Lock,
  Shield,
  Ticket,
  Calendar,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface CheckoutProps {
  selectedSeats: Seat[];
  clearSelection: () => void;
  venueData: VenueData;
}

const Checkout: React.FC<CheckoutProps> = ({
  selectedSeats,
  clearSelection,
  venueData,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationNumber] = useState(() => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );


  const { seatsWithPrices, subtotal, serviceFee, convenienceFee, tax, total } = useMemo(() => {
    const seatsWithPrices = selectedSeats.map((seat) => {
      const tier = PRICE_TIERS.find((t) => t.id === seat.priceTier) || PRICE_TIERS[0];
      return {
        ...seat,
        price: tier.price,
        tierName: tier.name,
        tierColor: tier.color,
      };
    });

    const subtotal = seatsWithPrices.reduce((total, seat) => total + seat.price, 0);
    const serviceFee = subtotal * 0.12;
    const convenienceFee = 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + serviceFee + convenienceFee + tax;

    return { seatsWithPrices, subtotal, serviceFee, convenienceFee, tax, total };
  }, [selectedSeats]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
      setStep("confirmation");
    }, 2000);
  };

  const handleGoBack = () => {
    if (step === "payment") {
      setStep("details");
    } else if (step === "details") {
      navigate("/");
    } else if (step === "confirmation") {
      clearSelection();
      navigate("/");
    }
  };

  const handleBookMoreTickets = () => {
    clearSelection();
    navigate("/");
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  if (selectedSeats.length === 0 && step !== "confirmation") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Ticket className="text-gray-400 dark:text-gray-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No Seats Selected
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please select seats before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Back to Seat Selection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {["details", "payment", "confirmation"].map((s, index) => (
            <div key={s} className="flex flex-col items-center relative" style={{ width: '33.33%' }}>
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full z-10 ${
                    step === s
                      ? "bg-blue-600 text-white"
                      : step === "confirmation" && s === "payment"
                      ? "bg-green-600 text-white"
                      : isConfirmed && s === "confirmation"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  } transition-colors duration-200`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-1 ${
                      (step === "payment" && index === 0) || 
                      (step === "confirmation" && index === 1) ||
                      (isConfirmed && index === 0)
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    } transition-colors duration-200`}
                    style={{ transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${
                  step === s || 
                  (step === "confirmation" && s === "payment") ||
                  (isConfirmed && s === "confirmation")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                } transition-colors duration-200`}>
                  {s === "details" && "Personal Details"}
                  {s === "payment" && "Payment"}
                  {s === "confirmation" && "Confirmation"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "details" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Please provide your contact information</p>
              </div>
              
              <form className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      Back to Seats
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("payment")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      Continue to Payment
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-gray-700 dark:text-gray-300" size={22} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure payment powered by Stripe</p>
              </div>
              
              <form onSubmit={handleSubmitPayment} className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                      <input
                        type="text"
                        name="cardNumber"
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setFormData(prev => ({ ...prev, cardNumber: formatted }));
                        }}
                        maxLength={19}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setFormData(prev => ({ ...prev, cardExpiry: value }));
                        }}
                        maxLength={5}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC *
                      </label>
                      <input
                        type="text"
                        name="cardCVC"
                        value={formData.cardCVC}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                          setFormData(prev => ({ ...prev, cardCVC: value }));
                        }}
                        maxLength={4}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Lock className="text-green-600 dark:text-green-400" size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="text-green-600 dark:text-green-400" size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">PCI DSS Compliant</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-700 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₹{total.toFixed(2)}
                          <Lock size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === "confirmation" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Your tickets have been successfully booked. A confirmation email has been sent to {formData.email}.
                </p>
                
                <div className="max-w-md mx-auto bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 mb-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                      <Calendar size={14} />
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confirmation Number</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                      {confirmationNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleBookMoreTickets}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Book More Tickets
                  </button>
                  <button 
                    onClick={handleGoBack}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{venueData.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={14} />
                  7:30 PM • Duration: 2h 30m
                </div>
              </div>
              
          
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Seats ({selectedSeats.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {seatsWithPrices.map((seat) => (
                    <div key={seat.id} className="flex justify-between items-center p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{seat.id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{seat.tierName}</p>
                      </div>
                      <p className="font-bold text-blue-700 dark:text-blue-400">₹{seat.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
         
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee (12%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Convenience Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All prices in USD
                </p>
              </div>
              
              <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <p>All sales are final. No refunds or exchanges.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} className="mt-0.5 flex-shrink-0" />
                  <p>Please arrive at least 30 minutes before the show.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
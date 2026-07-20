// src/app/listing/ListingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../core/api/client';
import { useAuth } from '../../core/hooks/useAuth';
import { Calendar, Shield, CreditCard, Tag, User, MapPin } from 'lucide-react';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, cibil, user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Date selections
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(1);

  // Set default dates: tomorrow and day after tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(dayAfter.toISOString().split('T')[0]);
  }, []);

  // Fetch listing details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        if (res?.status === 'success') {
          setItem(res.data);
        }
      } catch (err) {
        setError(err.message || 'Product details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Recalculate duration whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDurationDays(diffDays > 0 ? diffDays : 1);
    }
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-bgmain">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-bgmain p-6 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md border border-red-100 shadow-md">
          <p className="text-lg font-bold">Error Loading Product</p>
          <p className="text-sm mt-2">{error || 'Product not found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-all"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // --- Dynamic Deposit & Pricing Engine Calculations (matches backend) ---
  const CATEGORY_RULES = {
    ELECTRONICS: { depositPercentage: 0.08, maxDepositCap: 8000, baseDailyPremium: 100 },
    VEHICLES: { depositPercentage: 0.05, maxDepositCap: 5000, baseDailyPremium: 250 },
    LIFESTYLE: { depositPercentage: 0.05, maxDepositCap: 1500, baseDailyPremium: 30 },
    DEFAULT: { depositPercentage: 0.06, maxDepositCap: 3000, baseDailyPremium: 50 }
  };

  const rule = CATEGORY_RULES[item.category.toUpperCase()] || CATEGORY_RULES.DEFAULT;
  const totalRent = item.dailyRent * durationDays;
  
  let rawDeposit = item.mrp * rule.depositPercentage;
  if (rawDeposit > rule.maxDepositCap) {
    rawDeposit = rule.maxDepositCap;
  }
  
  // CIBIL waiver check (40% discount)
  const isCibilWaiverEligible = cibil >= 750;
  const finalDeposit = Math.round(isCibilWaiverEligible ? rawDeposit * 0.60 : rawDeposit);
  const totalInsurance = rule.baseDailyPremium * durationDays;
  const platformFee = 50;
  const totalPayableNow = totalRent + totalInsurance + platformFee + finalDeposit;

  // Handle Pay and Rent action
  const handleRentNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    let bookingId = null;

    const handleCancelBooking = async (id) => {
      if (!id) return;
      try {
        await api.post('/bookings/cancel-pending', { bookingId: id });
      } catch (cancelErr) {
        console.error('Error releasing booking reservation:', cancelErr.message);
      }
    };

    try {
      // 1. Create booking request on backend
      const bookingRes = await api.post('/bookings/request', {
        listingId: item._id,
        startDate,
        endDate
      });

      if (bookingRes?.status !== 'success' || !bookingRes.data) {
        throw new Error('Could not create booking reservation.');
      }

      bookingId = bookingRes.data._id;

      // 2. Generate Razorpay Order
      const orderRes = await api.post('/payments/create-order', { bookingId });
      if (orderRes?.status !== 'success' || !orderRes.data) {
        throw new Error('Failed to generate secure payment order.');
      }

      const { razorpayOrderId, amount, currency } = orderRes.data;

      // 3. Mount Razorpay Checkout frame
      const options = {
        key: 'rzp_test_TAeFddw3UHUx1O', // Razorpay Test Key (from backend .env)
        amount: amount,
        currency: currency,
        name: "AssetHop Rentals",
        description: `Rent ${item.title} for ${durationDays} days`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyRes = await api.post('/payments/verify', {
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes?.status === 'success') {
              alert('🎉 Payment Successful! Your rental order has been verified.');
              navigate('/dashboard');
            } else {
              alert('❌ Payment validation signature mismatch.');
            }
          } catch (verifyErr) {
            alert(`Verification Error: ${verifyErr.message}`);
          }
        },
        modal: {
          ondismiss: function () {
            handleCancelBooking(bookingId);
          }
        },
        prefill: {
          name: user?.name || "Customer Name",
          email: user?.email || "customer@example.com"
        },
        theme: {
          color: "#7F2A3C" // Red Velvet theme color matching accent
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        handleCancelBooking(bookingId);
      });
      rzp.open();

    } catch (err) {
      alert(`Booking Error: ${err.message}`);
      if (bookingId) {
        handleCancelBooking(bookingId);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-bgmain min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Product Info & Images */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            {/* Title & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md uppercase tracking-wider">
                  {item.category}
                </span>
                <h1 className="text-3xl font-extrabold text-primary mt-2">{item.title}</h1>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  {item.status}
                </span>
              </div>
            </div>

            {/* Gallery Placeholder */}
            <div className="my-6 aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 relative group">
              {item.images && item.images[0] ? (
                <img src={item.images[0]} alt={item.title} className="object-cover w-full h-full" />
              ) : (
                <div className="text-center p-4">
                  <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-gray-400">Premium Asset Preview</span>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">About this rental</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
            </div>

            {/* Host Details */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.hostId?.profileImage ? (
                  <img
                    src={item.hostId.profileImage}
                    alt={item.hostId.name || 'Owner'}
                    className="h-10 w-10 rounded-full object-cover border border-accent/20"
                  />
                ) : (
                  <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Verified Owner</p>
                  <p className="text-sm font-semibold text-primary">{item.hostId?.name || 'Owner'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Mumbai, IN</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Checkout Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-150 sticky top-6">
            
            {/* Rent Pricing Header */}
            <div className="flex items-baseline justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Daily Rental</p>
                <span className="text-3xl font-extrabold text-accent">₹{item.dailyRent}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Retail Value (MRP)</p>
                <span className="text-sm font-semibold text-gray-700">₹{item.mrp}</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">START DATE</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">END DATE</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 mt-6 pt-4 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Rent (₹{item.dailyRent} × {durationDays} days)</span>
                <span className="font-semibold text-primary">₹{totalRent}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Insurance Premium</span>
                <span className="font-semibold text-primary">₹{totalInsurance}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>AssetHop Platform Fee</span>
                <span className="font-semibold text-primary">₹{platformFee}</span>
              </div>

              {/* Security Deposit Details with CIBIL Highlight */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1 mt-2">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Shield className="h-4 w-4 text-accent" />
                    Security Deposit ({rule.depositPercentage * 100}%)
                  </span>
                  <span className={`text-xs ${isCibilWaiverEligible ? 'line-through text-gray-400' : 'font-bold text-primary'}`}>
                    ₹{Math.round(rawDeposit)}
                  </span>
                </div>
                {isCibilWaiverEligible && (
                  <div className="flex justify-between items-center text-xs text-green-700 font-bold bg-green-50 p-1.5 rounded">
                    <span>CIBIL Trust Waiver (-40%)</span>
                    <span>₹{finalDeposit}</span>
                  </div>
                )}
                <div className="text-[10px] text-gray-400">
                  Calculated based on {item.category} rules. Cap: ₹{rule.maxDepositCap}.
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-dashed border-gray-200 mt-2">
                <span>Total Payable Now</span>
                <span className="text-lg text-accent">₹{totalPayableNow}</span>
              </div>
            </div>

            {/* Call To Action */}
            <button
              onClick={handleRentNow}
              disabled={bookingLoading || item.status !== 'AVAILABLE'}
              className="w-full mt-6 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-200 shadow-md shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {bookingLoading ? (
                <span>Generating Order...</span>
              ) : item.status !== 'AVAILABLE' ? (
                <span>Item Currently Booked</span>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay & Rent Now</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Payments are held securely in escrow until physical handover is verified via OTP.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

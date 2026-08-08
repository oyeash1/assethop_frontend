import React from 'react';
import { List, Package, AlertTriangle, Key, Clock } from 'lucide-react';
import DeliverySimulator from './DeliverySimulator';

export default function HostBookingsList({
  hostRequests,
  loading,
  simulatingBookingId,
  setSimulatingBookingId,
  simulatedCoords,
  setSimulatedCoords,
  handoverOtp,
  setHandoverOtp,
  handleVerifyOtp,
  returnOtpFields,
  setReturnOtpFields,
  handleVerifyReturnOtp,
  handleSimulateMovement,
  now,
  formatDuration
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
        <List className="h-5 w-5 text-accent" />
        Requested Bookings & Rental Active Trips ({hostRequests.length})
      </h3>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : hostRequests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-150 shadow-md max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-600">No requests received yet.</p>
          <p className="text-xs text-gray-400 mt-2">When users book your products, they will appear here for OTP check-in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {hostRequests.map((booking) => {
            const isSimulating = simulatingBookingId === booking._id;

            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left column: metadata & OTP verification */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase">
                        {booking.listingId?.category}
                      </span>
                      <h4 className="text-lg font-bold text-primary mt-1 line-clamp-1">
                        {booking.listingId?.title}
                      </h4>
                    </div>
                  </div>

                  {/* Dates & Payout Breakdown */}
                  <div className="text-xs border-y border-gray-100 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-400">Renter Name</p>
                        <p className="font-semibold text-primary">{booking.userId?.name || 'Customer'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Net Earning</p>
                        <p className="font-bold text-green-600">
                          ₹{(booking.hostNetPayout || booking.totals?.hostEarned || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 space-y-1 text-[11px] font-medium text-gray-650">
                      <div className="flex justify-between">
                        <span>Gross Base Rent</span>
                        <span>₹{(booking.baseRentalFee || booking.pricing?.baseRent || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Platform Commission (8% + 18% GST)</span>
                        <span>-₹{(((booking.hostCommissionFee || ((booking.baseRentalFee || booking.pricing?.baseRent || 0) * 0.08)) + (booking.hostGstFee || ((booking.baseRentalFee || booking.pricing?.baseRent || 0) * 0.08 * 0.18))) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-primary">
                        <span>Net Host Payout</span>
                        <span>₹{(booking.hostNetPayout || booking.totals?.hostEarned || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Handover OTP Verification Form */}
                  {booking.status === 'REQUESTED' && (
                    <div className="space-y-3">
                      {/* Check if Renter has uploaded photos */}
                      {!booking.pickupPhotos || booking.pickupPhotos.length === 0 ? (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-250 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                            <AlertTriangle className="h-4 w-4 text-amber-600 animate-bounce" />
                            <span>Waiting for Renter Photo Upload</span>
                          </div>
                          <p className="text-[10px] text-amber-600 leading-normal font-semibold">
                            The renter must capture and upload at least 2 live photos of the product condition at your shop before you can verify the Handover OTP.
                          </p>
                          
                          {/* Disabled input field */}
                          <div className="flex gap-2 opacity-50 cursor-not-allowed">
                            <input
                              type="text"
                              disabled
                              placeholder="OTP Entry Locked"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none"
                            />
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-300 text-gray-500 text-xs font-bold rounded-lg"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50/50 p-4 rounded-xl border border-green-200 space-y-3">
                          <h5 className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                            <Key className="h-4 w-4 text-green-600 animate-pulse" />
                            Handover OTP Verification
                          </h5>
                          
                          {/* Photo Gallery for Host Inspection */}
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-555 uppercase">Renter Uploaded Pickup Photos:</p>
                            <div className="grid grid-cols-4 gap-1">
                              {booking.pickupPhotos.map((img, index) => (
                                <div key={index} className="h-10 rounded overflow-hidden border border-gray-300">
                                  <img src={img} alt="Inspect" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength="6"
                              placeholder="Enter Handover OTP"
                              value={handoverOtp[booking._id] || ''}
                              onChange={(e) => setHandoverOtp({
                                ...handoverOtp,
                                [booking._id]: e.target.value
                              })}
                              className="flex-1 px-3 py-2 border border-gray-350 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            <button
                              onClick={() => handleVerifyOtp(booking._id)}
                              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active trip tracking & Return OTP input */}
                  {booking.status === 'ACTIVE' && (
                    <div className="space-y-4">
                      {/* Host Side Timer */}
                      {(() => {
                        let timeRemainingMs = 0;
                        let isOverdue = false;
                        let lateFeeAccumulated = 0;
                        if (booking.handoverVerifiedAt) {
                          const startTime = new Date(booking.handoverVerifiedAt).getTime();
                          const allowedDurationMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
                          const targetEndTime = startTime + allowedDurationMs;
                          const diff = targetEndTime - now.getTime();
                          if (diff < 0) {
                            isOverdue = true;
                            timeRemainingMs = Math.abs(diff);
                            const hoursOverdue = Math.ceil(timeRemainingMs / (1000 * 60 * 60));
                            const hourlyRent = (booking.listingId?.dailyRent || 0) / 24;
                            lateFeeAccumulated = Math.ceil(hoursOverdue * hourlyRent * 1.5);
                          } else {
                            timeRemainingMs = diff;
                          }
                        }

                        return (
                          <div className={`p-3 rounded-lg border text-center space-y-1 ${
                            isOverdue ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-205 text-green-900'
                          }`}>
                            <p className="text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {isOverdue ? 'Rental Overdue' : 'Time Remaining'}
                            </p>
                            <p className="text-xl font-mono font-extrabold">
                              {isOverdue ? '-' : ''}{formatDuration(timeRemainingMs)}
                            </p>
                            {isOverdue && (
                              <p className="text-[10px] font-extrabold text-red-650">Renter Late Charge: ₹{lateFeeAccumulated}</p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Return OTP Exchange Form */}
                      <div className="bg-gray-55 p-4 rounded-xl border border-gray-200 space-y-3">
                        <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Key className="h-4 w-4 text-accent animate-pulse" />
                          Confirm Rental Return OTP
                        </h5>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter Return OTP"
                            value={returnOtpFields[booking._id] || ''}
                            onChange={(e) => setReturnOtpFields({
                              ...returnOtpFields,
                              [booking._id]: e.target.value
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                          <button
                            onClick={() => handleVerifyReturnOtp(booking._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isSimulating) {
                            setSimulatingBookingId(null);
                          } else {
                            setSimulatingBookingId(booking._id);
                            if (booking.listingId?.location?.coordinates) {
                              const [lng, lat] = booking.listingId.location.coordinates;
                              setSimulatedCoords([lat, lng]);
                            }
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          isSimulating
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-accent text-white border-transparent hover:bg-accent-hover shadow-sm shadow-accent/10'
                        }`}
                      >
                        {isSimulating ? 'Stop Simulator' : 'Open Delivery Simulator Map'}
                      </button>
                    </div>
                  )}

                  {/* COMPLETED Trip summary */}
                  {booking.status === 'COMPLETED' && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-2 text-xs font-semibold">
                      <p className="font-extrabold text-green-800 uppercase text-[9px] tracking-wider">Settled Trip Receipt</p>
                      <div className="space-y-1 text-gray-650">
                        <div className="flex justify-between">
                          <span>Gross Base Rent</span>
                          <span>₹{(booking.baseRentalFee || booking.pricing?.baseRent || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-500 font-medium">
                          <span>Platform Commission (8% + 18% GST)</span>
                          <span>-₹{(((booking.hostCommissionFee || ((booking.baseRentalFee || booking.pricing?.baseRent || 0) * 0.08)) + (booking.hostGstFee || ((booking.baseRentalFee || booking.pricing?.baseRent || 0) * 0.08 * 0.18))) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-250 pt-1 text-gray-700">
                          <span>Base Net Payout</span>
                          <span>₹{(booking.hostNetPayout || booking.totals?.hostEarned || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-650 font-bold">
                          <span>Late Penalty Earnings</span>
                          <span>₹{(booking.lateFeeCharge || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-300 pt-1.5 font-extrabold text-green-900">
                          <span>Total Settlement</span>
                          <span>₹{((booking.hostNetPayout || booking.totals?.hostEarned || 0) + (booking.lateFeeCharge || 0)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right column: Simulator console map */}
                <DeliverySimulator
                  isSimulating={isSimulating}
                  simulatedCoords={simulatedCoords}
                  handleSimulateMovement={handleSimulateMovement}
                />

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

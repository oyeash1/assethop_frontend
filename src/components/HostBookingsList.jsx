import React, { useState } from 'react';
import { List, Package, AlertTriangle, Key, Clock, FileText, Camera, Upload, X, ShieldAlert, CheckCircle } from 'lucide-react';
import DeliverySimulator from './DeliverySimulator';
import LiveCameraModal from './LiveCameraModal';
import RaiseDisputeModal from './RaiseDisputeModal';
import { printInvoice } from '../core/utils/invoiceHelper';

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
  hostReturnPhotos = {},
  handleReturnPhotoCapture,
  removeReturnPhoto,
  photoUploading = {},
  handleUploadAndLockReturnPhotos,
  loadData,
  now,
  formatDuration
}) {
  const [activeCameraBookingId, setActiveCameraBookingId] = useState(null);
  const [disputeBooking, setDisputeBooking] = useState(null);
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
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase">
                        {booking.listingId?.category}
                      </span>
                      <h4 className="text-lg font-bold text-primary mt-1 line-clamp-1">
                        {booking.listingId?.title}
                      </h4>
                    </div>
                    
                    <button
                      onClick={() => printInvoice(booking, 'HOST')}
                      className="px-2.5 py-1 bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-bold rounded-lg border border-accent/20 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      title="Download Settlement Statement"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Earning Receipt
                    </button>
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

                      {/* Mandatory Return Inspection Photos Section */}
                      <div className="bg-gray-55 p-4 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Camera className="h-4 w-4 text-accent" />
                            Return Inspection Photos *
                          </h5>
                          {booking.returnPhotos && booking.returnPhotos.length > 0 ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Photos Locked
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              Mandatory Before Return / Dispute
                            </span>
                          )}
                        </div>

                        {booking.returnPhotos && booking.returnPhotos.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {booking.returnPhotos.map((photoUrl, idx) => (
                              <div key={idx} className="h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <img src={photoUrl} alt={`Return Inspection ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-[11px] text-gray-500">
                              Capture at least 2 live photos of the returned item to verify its condition or raise a dispute if damaged.
                            </p>

                            {/* Captured Thumbnails */}
                            {((hostReturnPhotos[booking._id] || []).length > 0) && (
                              <div className="grid grid-cols-4 gap-2">
                                {(hostReturnPhotos[booking._id] || []).map((photoUrl, idx) => (
                                  <div key={idx} className="relative h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
                                    <img src={photoUrl} alt={`Captured ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removeReturnPhoto(booking._id, idx)}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Camera Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveCameraBookingId(booking._id)}
                                disabled={photoUploading[booking._id]}
                                className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              >
                                <Camera className="h-4 w-4 text-emerald-400" />
                                <span>Launch Live Camera</span>
                              </button>

                              <label className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all border border-gray-300">
                                <Upload className="h-3.5 w-3.5" />
                                <span>File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleReturnPhotoCapture(e, booking._id)}
                                />
                              </label>
                            </div>

                            {/* Lock Return Photos Button */}
                            {((hostReturnPhotos[booking._id] || []).length >= 2) && (
                              <button
                                onClick={() => handleUploadAndLockReturnPhotos(booking._id)}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Save & Lock Return Photos ({(hostReturnPhotos[booking._id] || []).length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Return OTP & Dispute Form */}
                      {(() => {
                        const hasPhotos = (booking.returnPhotos && booking.returnPhotos.length > 0);
                        return (
                          <div className="bg-gray-55 p-4 rounded-xl border border-gray-200 space-y-3">
                            <h5 className="text-xs font-bold text-gray-700 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Key className="h-4 w-4 text-accent animate-pulse" />
                                Rental Return Action
                              </span>
                            </h5>

                            {!hasPhotos ? (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                                ⚠️ Please capture and lock return photos above to enable Return OTP verification or Dispute filing.
                              </div>
                            ) : (
                              <div className="space-y-3">
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
                                    Confirm Return
                                  </button>
                                </div>

                                <div className="pt-1 border-t border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => setDisputeBooking(booking)}
                                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <ShieldAlert className="h-4 w-4" />
                                    <span>Raise Product Damage / Condition Dispute</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

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

                  {/* DISPUTED Trip Card */}
                  {booking.status === 'DISPUTED' && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                        <div>
                          <h5 className="text-xs font-bold">Rental Trip Under Dispute</h5>
                          <p className="text-[10px] text-red-600 font-medium">Escrow Payout Held on Security Lock (Admin Review in Progress)</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-red-150 text-xs space-y-1.5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dispute Status</p>
                        <p className="text-gray-800 font-semibold">
                          Host raised a rental damage/condition dispute upon asset return.
                        </p>
                        {booking.returnPhotos && booking.returnPhotos.length > 0 && (
                          <div className="pt-1">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">Attached Return Proof ({booking.returnPhotos.length})</p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {booking.returnPhotos.map((img, idx) => (
                                <div key={idx} className="h-12 rounded overflow-hidden border border-gray-200">
                                  <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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

      {/* Live Return Inspection Camera Modal */}
      {activeCameraBookingId && (
        <LiveCameraModal
          isOpen={!!activeCameraBookingId}
          onClose={() => setActiveCameraBookingId(null)}
          bookingId={activeCameraBookingId}
          onCapture={(fileOrBlob) => handleReturnPhotoCapture(fileOrBlob, activeCameraBookingId)}
        />
      )}

      {/* Raise Rental Dispute Modal */}
      {disputeBooking && (
        <RaiseDisputeModal
          isOpen={!!disputeBooking}
          onClose={() => setDisputeBooking(null)}
          booking={disputeBooking}
          onDisputeSuccess={() => {
            if (loadData) loadData();
          }}
        />
      )}
    </div>
  );
}

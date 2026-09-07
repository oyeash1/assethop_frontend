import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { List, Package, ChevronRight, Check, MapPin, Navigation, Camera, X, Upload, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import L from 'leaflet';
import { printInvoice } from '../core/utils/invoiceHelper';
import LiveCameraModal from './LiveCameraModal';

const hostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeView({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function RenterBookingsList({
  rentals,
  loading,
  navigate,
  liveLocations,
  renterSteps,
  setRenterSteps,
  userLocations,
  capturedPhotos,
  handlePickupPhotoCapture,
  removeCapturedPhoto,
  photoUploading,
  handleUploadAndLockPhotos,
  returnOtpFields,
  setReturnOtpFields,
  handleVerifyReturnOtp,
  now,
  formatDuration,
  getHaversineDistance
}) {
  const [activeCameraBookingId, setActiveCameraBookingId] = useState(null);

  return (
    <div>
      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
        <List className="h-5 w-5 text-accent" />
        Active Rentals & Requested Orders ({rentals.length})
      </h3>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-md max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-600">No rentals booked yet.</p>
          <p className="text-sm text-gray-400 mt-2">Hop to the homepage and discover available products nearby!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all"
          >
            Find Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rentals.map((booking) => {
            const isTracking = liveLocations[booking._id];
            const mapCenter = isTracking ? liveLocations[booking._id] : [19.0760, 72.8777];

            // Determine Renter current step
            let currentStep = 1;
            if (booking.status === 'COMPLETED') {
              currentStep = 5;
            } else if (booking.status === 'ACTIVE') {
              currentStep = 4;
            } else if (booking.status === 'REQUESTED') {
              if (booking.pickupPhotos && booking.pickupPhotos.length > 0) {
                currentStep = 3;
              } else if (renterSteps[booking._id] === 2) {
                currentStep = 2;
              } else {
                currentStep = 1;
              }
            }

            // Step 1: navigation details
            const userPos = userLocations[booking._id];
            const shopCoords = booking.listingId?.location?.coordinates || [72.8777, 19.0760];
            const distanceM = userPos ? getHaversineDistance(userPos[0], userPos[1], shopCoords[1], shopCoords[0]) : 0;

            // Step 4: Timer details
            let timeRemainingMs = 0;
            let isOverdue = false;
            let lateFeeAccumulated = 0;
            if (booking.status === 'ACTIVE' && booking.handoverVerifiedAt) {
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
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* STEPPER PROGRESS HEADER */}
                <div className="lg:col-span-3 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-150 mb-2 overflow-x-auto gap-4">
                  {[
                    { step: 1, label: 'Locate Host', desc: 'Navigate to pickup' },
                    { step: 2, label: 'Verify Asset', desc: 'Capture live photos' },
                    { step: 3, label: 'Handover OTP', desc: 'Verify with host' },
                    { step: 4, label: 'Active Rental', desc: 'Timer running' },
                    { step: 5, label: 'Completed', desc: 'Trip details' }
                  ].map((s) => {
                    const isCompleted = currentStep > s.step;
                    const isActive = currentStep === s.step;
                    return (
                      <div key={s.step} className="flex items-center gap-2 shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-200' :
                          isActive ? 'bg-accent text-white shadow-md shadow-accent/20 animate-pulse' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : s.step}
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-bold leading-tight ${isActive ? 'text-accent font-extrabold' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</p>
                          <p className="text-[9px] text-gray-400 font-semibold">{s.desc}</p>
                        </div>
                        {s.step < 5 && <ChevronRight className="h-4 w-4 text-gray-300 ml-1.5" />}
                      </div>
                    );
                  })}
                </div>

                <div className="lg:col-span-3 flex justify-between items-center bg-white px-2 py-1 border-b border-gray-100 pb-3 -mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">BOOKING ID:</span>
                    <span className="text-xs font-mono font-bold text-gray-700">{booking._id}</span>
                  </div>
                  <button
                    onClick={() => printInvoice(booking, 'RENTER')}
                    className="px-3 py-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold rounded-lg border border-accent/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {booking.status === 'COMPLETED' ? 'Download Final Invoice' : 'Download Payment Invoice'}
                  </button>
                </div>

                {/* STEP 1 CONTENT: Navigate to Host */}
                {currentStep === 1 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase">
                          {booking.listingId?.category}
                        </span>
                        <h4 className="text-lg font-bold text-primary mt-1 line-clamp-1">
                          {booking.listingId?.title || 'Rental Item'}
                        </h4>
                      </div>

                      <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-2 text-xs">
                        <p className="text-primary font-bold flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-accent" />
                          Pickup Shop Location Navigation
                        </p>
                        <div className="space-y-1 text-gray-650 font-semibold">
                          <p>📍 Distance: <span className="text-accent font-extrabold">{Math.round(distanceM)} meters</span></p>
                          <p>🚶 Est. Walk Duration: <span className="text-primary font-bold">~{Math.ceil(distanceM / 80)} mins</span></p>
                        </div>
                        <p className="text-[10px] text-gray-405 leading-normal mt-1">Please walk to the shop coordinates shown on the navigation map. Host's live delivery partner telemetry will stream on connection.</p>
                      </div>

                      <button
                        onClick={() => setRenterSteps(prev => ({ ...prev, [booking._id]: 2 }))}
                        className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent/15 flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="h-4 w-4" />
                        I Have Arrived at Pickup Location
                      </button>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-[280px] lg:h-auto min-h-[250px] relative">
                      <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        <MapContainer center={userPos || [shopCoords[1], shopCoords[0]]} zoom={15} className="w-full h-full">
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {userPos && <ChangeView center={userPos} />}
                          
                          {/* Renter location pin */}
                          {userPos && (
                            <Marker position={userPos} icon={userIcon}>
                              <Popup>
                                <div className="text-xs font-bold">Your Location</div>
                              </Popup>
                            </Marker>
                          )}
                          
                          {/* Shop location pin */}
                          <Marker position={[shopCoords[1], shopCoords[0]]} icon={hostIcon}>
                            <Popup>
                              <div className="text-xs font-bold">Host Shop / Pickup Point</div>
                            </Popup>
                          </Marker>

                          {/* Navigation Polyline */}
                          {userPos && (
                            <Polyline positions={[userPos, [shopCoords[1], shopCoords[0]]]} color="#f97316" dashArray="5, 10" weight={4} />
                          )}
                        </MapContainer>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 CONTENT: Capture Pickup Photos */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-primary">Verify Asset Condition</h4>
                        <p className="text-xs text-gray-505 mt-0.5">Capture live photos of the product at the shop before exchange.</p>
                      </div>

                      <div className="space-y-3">
                        <button 
                          type="button"
                          onClick={() => setActiveCameraBookingId(booking._id)}
                          className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-accent/40 rounded-xl cursor-pointer hover:bg-accent/5 transition-all text-center space-y-1.5"
                        >
                          <Camera className="h-7 w-7 text-accent animate-bounce" />
                          <span className="text-xs font-bold text-gray-700">Launch Live Camera</span>
                          <span className="text-[9px] text-gray-400">Strictly live capture • Viewfinder preview stream</span>
                        </button>

                        <LiveCameraModal
                          isOpen={activeCameraBookingId === booking._id}
                          onClose={() => setActiveCameraBookingId(null)}
                          onCapture={handlePickupPhotoCapture}
                          bookingId={booking._id}
                        />

                        {/* Previews */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Captured Condition Photos ({capturedPhotos[booking._id]?.length || 0}/4)</p>
                          <div className="grid grid-cols-4 gap-2">
                            {(capturedPhotos[booking._id] || []).map((img, idx) => (
                              <div key={idx} className="relative h-14 rounded-lg overflow-hidden border border-gray-250 bg-gray-50 group">
                                <img src={img} alt="Condition Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeCapturedPhoto(booking._id, idx)}
                                  className="absolute top-0.5 right-0.5 bg-red-650 text-white rounded-full p-0.5 hover:bg-red-750 transition-all"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                            {photoUploading[booking._id] && (
                              <div className="h-14 rounded-lg border border-dashed border-accent flex items-center justify-center bg-accent/5">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUploadAndLockPhotos(booking._id)}
                        disabled={!capturedPhotos[booking._id] || capturedPhotos[booking._id].length < 2}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
                          capturedPhotos[booking._id]?.length >= 2
                            ? 'bg-accent hover:bg-accent-hover text-white shadow-accent/15'
                            : 'bg-gray-100 text-gray-450 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload & Lock Condition Photos
                      </button>
                      <p className="text-[9px] text-gray-400 text-center">Requires at least 2 live condition photos before lock confirmation.</p>
                    </div>

                    <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 flex items-center justify-center text-center">
                      <div className="max-w-sm space-y-2">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                        <p className="text-xs font-bold text-gray-700">Safety Checkpoint Guidelines</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Take clear snapshots of the product from multiple angles (front, back, screen, serial numbers) to verify its initial physical status. This photo record helps resolve deposit and insurance claims in case of disputes.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3 CONTENT: Handover OTP Exchange */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-primary">Verify Physical Handover</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Please share the Handover OTP with the host to initiate the trip.</p>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-150 text-center space-y-3">
                        <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Handover OTP Code</p>
                        <p className="text-3xl font-mono font-extrabold text-accent tracking-widest">{booking.handoverOtp}</p>
                        <p className="text-[10px] text-gray-400 leading-normal font-medium">Host will enter this OTP on their terminal. Do not share this OTP until you have physically inspected and verified the product matches description.</p>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-accent py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                        <span>Waiting for host verification...</span>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col justify-center">
                      <h5 className="text-xs font-bold text-gray-700 mb-2">Logged Condition Checkpoint Photos</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {booking.pickupPhotos?.map((img, index) => (
                          <div key={index} className="h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <img src={img} alt="Locked Condition" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-green-600 font-semibold mt-3 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Condition photos are safely locked in database.
                      </p>
                    </div>
                  </>
                )}

                {/* STEP 4 CONTENT: Active Rental Countdown Timer */}
                {currentStep === 4 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                          Trip Active
                        </span>
                        <h4 className="text-lg font-bold text-primary mt-1 line-clamp-1">
                          {booking.listingId?.title}
                        </h4>
                      </div>

                      <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                        isOverdue
                          ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                          : 'bg-green-50/50 border-green-200 text-green-800'
                      }`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {isOverdue ? 'Rental Time Exceeded (Overdue)' : 'Time Remaining'}
                        </p>
                        <p className="text-2xl font-mono font-extrabold tracking-wider">
                          {isOverdue ? '-' : ''}{formatDuration(timeRemainingMs)}
                        </p>
                        {isOverdue && (
                          <div className="pt-2 border-t border-red-250 border-dashed space-y-1">
                            <p className="text-xs font-extrabold text-red-650">Late Charge Accumulated: ₹{lateFeeAccumulated}</p>
                            <p className="text-[9px] text-red-500 font-semibold leading-normal">Additional fees are charged at 1.5x penalty hourly rental rate per exceeded hour.</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-center space-y-1.5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Return OTP Code</p>
                        <p className="text-2xl font-mono font-extrabold text-gray-700 tracking-widest">{booking.returnOtp}</p>
                        <p className="text-[9px] text-gray-450">Show this Return OTP code to the host when returning the asset to stop the rental timer.</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-[280px] lg:h-auto min-h-[250px] relative">
                      <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        <MapContainer center={isTracking ? liveLocations[booking._id] : [shopCoords[1], shopCoords[0]]} zoom={14} className="w-full h-full">
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {isTracking && <ChangeView center={liveLocations[booking._id]} />}
                          
                          {/* Live delivery vehicle pin */}
                          {isTracking && (
                            <Marker position={liveLocations[booking._id]} icon={userIcon}>
                              <Popup>
                                <div className="text-xs font-bold text-accent animate-pulse">Rider Live Position</div>
                              </Popup>
                            </Marker>
                          )}

                          <Marker position={[shopCoords[1], shopCoords[0]]} icon={hostIcon}>
                            <Popup>
                              <div className="text-xs font-bold">Return Shop Location</div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 5 CONTENT: Trip Completed */}
                {currentStep === 5 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-primary">Rental Successfully Completed</h4>
                          <p className="text-xs text-gray-550">The product has hopped back to the Host.</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-xs space-y-2.5">
                        <p className="font-bold text-primary uppercase text-[10px]">Rental Summary Receipt</p>
                        <div className="space-y-1.5 text-gray-600 font-semibold">
                          <div className="flex justify-between">
                            <span>Base Fee Paid</span>
                            <span>₹{booking.totals?.userTotalPaid}</span>
                          </div>
                          <div className="flex justify-between text-red-650 font-bold">
                            <span>Late Return Penalty</span>
                            <span>₹{booking.lateFeeCharge || 0}</span>
                          </div>
                          <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-accent font-extrabold text-sm">
                            <span>Total Cost Settled</span>
                            <span>₹{booking.totals?.userTotalPaid + (booking.lateFeeCharge || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-medium space-y-1 border-t border-gray-100 pt-3">
                        <p>🏁 Handover: {booking.handoverVerifiedAt ? new Date(booking.handoverVerifiedAt).toLocaleString() : 'N/A'}</p>
                        <p>🏁 Returned: {booking.actualReturnDate ? new Date(booking.actualReturnDate).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <h5 className="text-xs font-bold text-gray-700">Archived Verification Logs</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {booking.pickupPhotos?.map((img, index) => (
                          <div key={index} className="h-16 rounded-lg overflow-hidden border border-gray-200">
                            <img src={img} alt="Locked Condition Log" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-green-50 text-green-700 text-[10px] font-bold border border-green-200 rounded-lg">
                        Trip completed without disputes. Deposit will refund automatically following listing inspections. Thank you for using AssetHop!
                      </div>
                    </div>
                  </>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

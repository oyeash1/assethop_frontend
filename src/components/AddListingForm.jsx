import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Plus, Upload, X, AlertTriangle } from 'lucide-react';
import L from 'leaflet';

const hostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map reactively when search coords update
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Click listener to pick coordinates for host listing
function ListingLocationPicker({ setCoordinates, setMarkerPos }) {
  useMapEvents({
    click(e) {
      setCoordinates([e.latlng.lng, e.latlng.lat]); // [longitude, latitude] for MongoDB
      setMarkerPos([e.latlng.lat, e.latlng.lng]); // [latitude, longitude] for Leaflet
    }
  });
  return null;
}

export default function AddListingForm({
  user,
  navigate,
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  mrp,
  setMrp,
  dailyRent,
  setDailyRent,
  coordinates,
  setCoordinates,
  markerPos,
  setMarkerPos,
  images,
  handleImageUpload,
  removeImage,
  imageUploading,
  formLoading,
  handleAddListingSubmit
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-lg p-6 max-w-4xl mx-auto">
      <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5 text-accent" />
        List a Premium Rental Asset
      </h3>

      {user?.kycStatus !== 'VERIFIED' ? (
        <div className="py-12 px-6 text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-gray-900">KYC Verification Required</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              To maintain a safe rental community, all hosts are required to complete KYC verification before listing products.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent/15 cursor-pointer"
          >
            Go to KYC Document Center
          </button>
        </div>
      ) : (
        <form onSubmit={handleAddListingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sony FX3 Cinema Camera"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Description</label>
              <textarea
                required
                rows="3"
                placeholder="Describe conditions, accessories, packages..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="VEHICLES">Vehicles</option>
                  <option value="LIFESTYLE">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Retail Price (MRP)</label>
                <input
                  type="number"
                  required
                  placeholder="₹60,000"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Daily Rental Fee</label>
              <input
                type="number"
                required
                placeholder="₹1,200"
                value={dailyRent}
                onChange={(e) => setDailyRent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Images Upload / Previews */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Product Images</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-16 rounded-lg overflow-hidden border border-gray-250 bg-gray-50 group">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx, false)}
                      className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className={`h-16 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-bold mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {imageUploading && (
                <p className="text-[10px] text-accent animate-pulse font-bold">Uploading file to Cloudinary...</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow-md shadow-accent/20 transition-all duration-200"
              >
                {formLoading ? 'Publishing Offer...' : 'Publish Listed Product'}
              </button>
            </div>
          </div>

          {/* Location Coordinates Map Picker */}
          <div className="flex flex-col h-[320px] md:h-auto min-h-[300px]">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1 uppercase">
              <span>Coordinates Location Picker</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const lat = position.coords.latitude;
                          const lng = position.coords.longitude;
                          setCoordinates([lng, lat]);
                          setMarkerPos([lat, lng]);
                        },
                        (err) => alert(`Error detecting location: ${err.message}`)
                      );
                    } else {
                      alert("Geolocation is not supported by your browser.");
                    }
                  }}
                  className="px-2 py-0.5 bg-accent/15 hover:bg-accent/25 text-accent rounded font-bold text-[9px] uppercase tracking-wider transition-all"
                >
                  Detect My Location
                </button>
                <span className="text-accent font-bold">
                  [{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <MapContainer center={markerPos} zoom={12} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView center={markerPos} />
                <ListingLocationPicker setCoordinates={setCoordinates} setMarkerPos={setMarkerPos} />
                <Marker position={markerPos} icon={hostIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-center">Drop Point location of listed asset</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-[10px] text-gray-400 italic mt-2">Click on the map above to select where this asset is stored or can be picked up.</p>
          </div>
        </form>
      )}
    </div>
  );
}

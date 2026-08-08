import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Edit, X, Upload } from 'lucide-react';
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

export default function EditListingModal({
  isEditModalOpen,
  setIsEditModalOpen,
  editingItem,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editCategory,
  setEditCategory,
  editStatus,
  setEditStatus,
  editMrp,
  setEditMrp,
  editDailyRent,
  setEditDailyRent,
  editImages,
  handleImageUpload,
  removeImage,
  imageUploading,
  editCoordinates,
  setEditCoordinates,
  editMarkerPos,
  setEditMarkerPos,
  editFormLoading,
  handleEditSubmit
}) {
  if (!isEditModalOpen || !editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-primary/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Edit className="h-5 w-5 text-accent" />
            Edit Rental Listing
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleEditSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Product Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Description</label>
              <textarea
                required
                rows="3"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="VEHICLES">Vehicles</option>
                  <option value="LIFESTYLE">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Retail Price (MRP)</label>
                <input
                  type="number"
                  required
                  value={editMrp}
                  onChange={(e) => setEditMrp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Daily Rental Fee</label>
                <input
                  type="number"
                  required
                  value={editDailyRent}
                  onChange={(e) => setEditDailyRent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Images Upload / Previews */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Product Images</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {editImages.map((img, idx) => (
                  <div key={idx} className="relative h-16 rounded-lg overflow-hidden border border-gray-250 bg-gray-50 group">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx, true)}
                      className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {editImages.length < 4 && (
                  <label className={`h-16 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-bold mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {imageUploading && (
                <p className="text-[10px] text-accent animate-pulse font-bold">Uploading file to Cloudinary...</p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editFormLoading}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-xs shadow-md shadow-accent/20 transition-all"
              >
                {editFormLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Right Column: Coordinates Location Picker Map */}
          <div className="flex flex-col h-[300px] md:h-auto min-h-[250px]">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1 uppercase">
              <span>Edit Coordinates Drop Location</span>
              <span className="text-accent font-bold">
                [{editCoordinates[0].toFixed(4)}, {editCoordinates[1].toFixed(4)}]
              </span>
            </div>
            
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-250 shadow-inner">
              <MapContainer center={editMarkerPos} zoom={12} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView center={editMarkerPos} />
                <ListingLocationPicker setCoordinates={setEditCoordinates} setMarkerPos={setEditMarkerPos} />
                <Marker position={editMarkerPos} icon={hostIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-center">Edit point location</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-[10px] text-gray-400 italic mt-2">Click on the map above to select where this asset is stored or can be picked up.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

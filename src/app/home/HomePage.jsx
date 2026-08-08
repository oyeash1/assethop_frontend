// src/app/home/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../core/api/client';
import { useAuth } from '../../core/hooks/useAuth';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, ShieldAlert, Laptop, Car, Shirt } from 'lucide-react';
import ListingCard from '../../components/ListingCard';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon asset mapping
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create custom colored pins for items
const hostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: markerShadow,
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

// Map Click Listener to update user's location
function MapClickHandler({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { cibil } = useAuth();
  
  // Default coordinates: Mumbai
  const [coords, setCoords] = useState([19.0760, 72.8777]); // [latitude, longitude]
  const [searchRadius, setSearchRadius] = useState(10000); // 10km default
  const [listings, setListings] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Request browser geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log("Geolocation permission denied. Defaulting to Mumbai, India.");
        }
      );
    }
  }, []);

  // Fetch nearby items when location/radius changes
  useEffect(() => {
    fetchNearbyItems();
  }, [coords, searchRadius]);

  const fetchNearbyItems = async () => {
    setLoading(true);
    setError('');
    try {
      // Backend expects: /api/v1/listings/nearby?lng=...&lat=...&radius=...
      // Note: longitude is coords[1], latitude is coords[0]
      const res = await api.get(`/listings/nearby?lng=${coords[1]}&lat=${coords[0]}&radius=${searchRadius}`);
      if (res?.status === 'success') {
        setListings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to search nearby listings.');
    } finally {
      setLoading(false);
    }
  };

  // Filter listings by search query and category
  const filteredListings = listings.filter((item) => {
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-bgmain overflow-hidden">
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[420px] bg-white border-r border-gray-200 flex flex-col h-1/2 lg:h-full z-20 shadow-lg">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search cameras, bikes, clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-all"
            />
          </div>

          {/* Search Radius Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Search Radius</span>
              <span className="text-accent">{(searchRadius / 1000).toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <p className="text-[10px] text-gray-400 italic">Click anywhere on the map to change search center location</p>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                !categoryFilter
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setCategoryFilter('ELECTRONICS')}
              className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'ELECTRONICS'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Electronics
            </button>
            <button
              onClick={() => setCategoryFilter('VEHICLES')}
              className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'VEHICLES'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Car className="h-3.5 w-3.5" />
              Vehicles
            </button>
            <button
              onClick={() => setCategoryFilter('LIFESTYLE')}
              className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'LIFESTYLE'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shirt className="h-3.5 w-3.5" />
              Lifestyle
            </button>
          </div>
        </div>

        {/* Listings List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Nearby Offers ({filteredListings.length})</h3>
            {loading && <span className="text-xs text-gray-400 animate-pulse">Scanning...</span>}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-xs text-red-700">
              {error}
            </div>
          )}

          {!loading && filteredListings.length === 0 && (
            <div className="text-center py-12 px-4 space-y-2">
              <Compass className="h-10 w-10 text-gray-300 mx-auto animate-bounce" />
              <p className="text-sm font-semibold text-gray-600">No items listed in this area.</p>
              <p className="text-xs text-gray-400">Try expanding your search radius slider or clicking elsewhere on the map.</p>
            </div>
          )}

          {filteredListings.map((item) => (
            <ListingCard
              key={item._id}
              item={item}
              onClick={() => navigate(`/listing/${item._id}`)}
            />
          ))}
        </div>
      </div>

      {/* Right Map View */}
      <div className="flex-1 h-1/2 lg:h-full relative z-10">
        <MapContainer center={coords} zoom={13} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={coords} />
          <MapClickHandler setCoords={setCoords} />
          
          {/* User Geolocation Center Marker */}
          <Marker position={coords} icon={userIcon}>
            <Popup>
              <div className="text-xs font-bold">Search Center</div>
            </Popup>
          </Marker>

          {/* Offer Listing Pinpoints */}
          {filteredListings.map((item) => {
            if (!item.location?.coordinates || item.location.coordinates.length < 2) return null;
            const [lng, lat] = item.location.coordinates;
            return (
              <Marker
                key={item._id}
                position={[lat, lng]}
                icon={hostIcon}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 max-w-[200px]">
                    <h4 className="font-bold text-sm text-primary line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-semibold">Category: {item.category}</p>
                    <div className="flex justify-between items-center text-xs border-t border-gray-150 pt-1.5">
                      <span className="text-accent font-bold">₹{item.dailyRent}/day</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-[9px] rounded font-bold text-gray-600">{item.status}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/listing/${item._id}`)}
                      className="w-full mt-2 py-1 text-center bg-accent text-white text-xs font-bold rounded hover:bg-accent-hover transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}

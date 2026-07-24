// src/app/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../core/api/client';
import { useAuth } from '../../core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Plus, Grid, List, Sparkles, MapPin, Key, CheckCircle, Truck, Package, Edit, Trash2, Upload, X, AlertTriangle } from 'lucide-react';
import L from 'leaflet';

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

// Click listener for host to click-and-emit simulated location coordinates
function MapSimulationEmitter({ onSimulateClick }) {
  useMapEvents({
    click(e) {
      onSimulateClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Socket reference
  const socketRef = useRef(null);

  // Common UI State
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, listings, add-listing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data State
  const [rentals, setRentals] = useState([]); // Renter's bookings
  const [hostRequests, setHostRequests] = useState([]); // Host's bookings
  const [hostListings, setHostListings] = useState([]); // Host's listed products

  // Tracking state (Renter side)
  // Mapping bookingId -> [lat, lng]
  const [liveLocations, setLiveLocations] = useState({});

  // Handover state (Host side)
  const [handoverOtp, setHandoverOtp] = useState({});

  // Add Listing Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [mrp, setMrp] = useState('');
  const [dailyRent, setDailyRent] = useState('');
  const [coordinates, setCoordinates] = useState([72.8777, 19.0760]); // [longitude, latitude]
  const [markerPos, setMarkerPos] = useState([19.0760, 72.8777]); // [latitude, longitude]
  const [images, setImages] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Upload state
  const [imageUploading, setImageUploading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('ELECTRONICS');
  const [editMrp, setEditMrp] = useState('');
  const [editDailyRent, setEditDailyRent] = useState('');
  const [editCoordinates, setEditCoordinates] = useState([72.8777, 19.0760]);
  const [editMarkerPos, setEditMarkerPos] = useState([19.0760, 72.8777]);
  const [editImages, setEditImages] = useState([]);
  const [editStatus, setEditStatus] = useState('AVAILABLE');
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Image Upload Handlers
  const handleImageUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/listings/upload', formData);
      if (res?.status === 'success') {
        if (isEditing) {
          setEditImages(prev => [...prev, res.url]);
        } else {
          setImages(prev => [...prev, res.url]);
        }
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index, isEditing = false) => {
    if (isEditing) {
      setEditImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Edit/Delete helper openers
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditMrp(item.mrp);
    setEditDailyRent(item.dailyRent);
    setEditStatus(item.status || 'AVAILABLE');
    setEditImages(item.images || []);
    
    const coords = item.location?.coordinates || [72.8777, 19.0760];
    setEditCoordinates(coords);
    setEditMarkerPos([coords[1], coords[0]]);
    
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormLoading(true);
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        mrp: parseFloat(editMrp),
        dailyRent: parseFloat(editDailyRent),
        status: editStatus,
        images: editImages,
        coordinates: editCoordinates
      };

      const res = await api.put(`/listings/${editingItem._id}`, payload);
      if (res?.status === 'success') {
        alert('🎉 Listing updated successfully!');
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(`Failed to update listing: ${err.message}`);
    } finally {
      setEditFormLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeletingItem(item);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await api.delete(`/listings/${deletingItem._id}`);
      if (res?.status === 'success') {
        setIsDeleteModalOpen(false);
        loadData();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete listing.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Active simulated booking for host
  const [simulatingBookingId, setSimulatingBookingId] = useState(null);
  const [simulatedCoords, setSimulatedCoords] = useState([19.0760, 72.8777]);

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Setup sockets and listeners
  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket.io client
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Socket client tunnel connected successfully.');
      });

      // Listen for location updates
      socketRef.current.on('location_stream', (data) => {
        // Data format: { lat, lng } emitted into a room of bookingId
        // Wait, how do we know which bookingId this is for?
        // Let's modify the socket.io listener to track coordinates.
        // The backend index.js emits: io.to(bookingId).emit('location_stream', { lat, lng });
        // Since the backend doesn't attach bookingId to the emitted payload directly, 
        // let's adjust it by mapping the active listening rooms, 
        // or let's update state directly if we listen in. 
        // To map it, let's make sure the client listens to location updates.
        // Wait! Let's register listeners for all of user's active/requested bookings!
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated]);

  // Load Dashboard Data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  // Subscribe socket to rooms of active rentals once they are loaded
  useEffect(() => {
    if (socketRef.current && rentals.length > 0) {
      rentals.forEach((r) => {
        if (r.status === 'REQUESTED' || r.status === 'ACTIVE') {
          socketRef.current.emit('join_room', r._id);
        }
      });

      // Define local event handler to update coordinate map
      // Wait, we need to know which room it came from. Since socket.io rooms isolate emissions,
      // let's make a custom listener where we capture the broadcast.
      // Wait, if the broadcast doesn't have bookingId, let's check: does index.js emit bookingId?
      // "io.to(bookingId).emit('location_stream', { lat, lng })"
      // If we want it to carry the bookingId, let's modify backend's index.js to emit:
      // "io.to(bookingId).emit('location_stream', { bookingId, lat, lng })"
      // That is an incredibly helpful refinement to make tracking work cleanly! Let's do that next.
      // For now, let's configure client to listen.
    }
  }, [rentals]);

  // Join rooms on host side too
  useEffect(() => {
    if (socketRef.current && hostRequests.length > 0) {
      hostRequests.forEach((r) => {
        if (r.status === 'REQUESTED' || r.status === 'ACTIVE') {
          socketRef.current.emit('join_room', r._id);
        }
      });
    }
  }, [hostRequests]);

  // Also listen for stream coordinates
  useEffect(() => {
    if (socketRef.current) {
      const handleLocationStream = (data) => {
        // Expecting data: { bookingId, lat, lng }
        if (data?.bookingId) {
          setLiveLocations(prev => ({
            ...prev,
            [data.bookingId]: [data.lat, data.lng]
          }));
        }
      };
      
      socketRef.current.on('location_stream', handleLocationStream);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('location_stream', handleLocationStream);
        }
      };
    }
  }, [rentals, hostRequests]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (user.role === 'USER') {
        // Fetch rentals
        const res = await api.get('/bookings/my-rentals');
        if (res?.status === 'success') {
          setRentals(res.data);
        }
      } else if (user.role === 'HOST') {
        if (activeTab === 'bookings') {
          // Fetch host requests
          const res = await api.get('/bookings/host-requests');
          if (res?.status === 'success') {
            setHostRequests(res.data);
          }
        } else if (activeTab === 'listings') {
          // Fetch host listings
          const res = await api.get('/listings/my/all');
          if (res?.status === 'success') {
            setHostListings(res.data);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Host action: Confirm physical exchange OTP
  const handleVerifyOtp = async (bookingId) => {
    const otp = handoverOtp[bookingId];
    if (!otp) {
      alert('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      const res = await api.post('/bookings/verify-handover', { bookingId, otp });
      if (res?.status === 'success') {
        alert('🎉 Handover Verified! Rental is now ACTIVE.');
        loadData();
      }
    } catch (err) {
      alert(`Handover failed: ${err.message}`);
    }
  };

  // Host action: Click to simulate delivery vehicle movement
  const handleSimulateMovement = (lat, lng) => {
    if (!simulatingBookingId) return;
    
    setSimulatedCoords([lat, lng]);
    
    // Emit coordinate update to socket room
    if (socketRef.current) {
      // We will send bookingId so the listener knows which pin to move!
      socketRef.current.emit('update_location', {
        bookingId: simulatingBookingId,
        lat,
        lng
      });
    }
  };

  // Host action: Add new listing
  const handleAddListingSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        mrp: parseFloat(mrp),
        dailyRent: parseFloat(dailyRent),
        coordinates, // [longitude, latitude]
        hostId: user.id,
        images
      };

      const res = await api.post('/listings/add', payload);
      if (res?.status === 'success') {
        alert('🎉 New item listed successfully on AssetHop!');
        // Reset form
        setTitle('');
        setDescription('');
        setMrp('');
        setDailyRent('');
        setImages([]);
        // Switch tab to listings list
        setActiveTab('listings');
      }
    } catch (err) {
      alert(`Failed to list item: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-bgmain min-h-[calc(100vh-80px)]">
      
      {/* Dashboard Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-md mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">Dashboard Panel</p>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            Hello, {user.name} 
            <span className="text-xs px-2.5 py-0.5 bg-accent/15 text-accent rounded-full font-bold">
              {user.role === 'HOST' ? 'Host Console' : 'Renter Console'}
            </span>
          </h2>
          <p className="text-sm text-gray-500">Manage bookings, view digital keys, and trace hyperlocal assets.</p>
        </div>

        {/* Console Nav Tabs */}
        {user.role === 'HOST' && (
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'bookings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4" />
              Rent Requests
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'listings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
              My Assets
            </button>
            <button
              onClick={() => setActiveTab('add-listing')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'add-listing' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* --- RENTER VIEW PANEL --- */}
      {user.role === 'USER' && (
        <div className="space-y-6">
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

                return (
                  <div key={booking._id} className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Booking metadata */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase">
                            {booking.listingId?.category}
                          </span>
                          <h4 className="text-lg font-bold text-primary mt-1 line-clamp-1">
                            {booking.listingId?.title || 'Rental Item'}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          booking.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-3">
                        <div>
                          <p className="text-gray-400">Start Date</p>
                          <p className="font-semibold text-primary">{new Date(booking.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">End Date</p>
                          <p className="font-semibold text-primary">{new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Base Rental Fee</span>
                          <span>₹{booking.pricing?.baseRent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform & Insurance</span>
                          <span>₹{booking.pricing?.insurancePremium + booking.pricing?.platformFee}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-700">
                          <span>Refundable Deposit</span>
                          <span>₹{booking.pricing?.securityDeposit}</span>
                        </div>
                        <div className="flex justify-between font-bold text-accent border-t border-dashed border-gray-200 pt-1.5 text-sm">
                          <span>Total Paid</span>
                          <span>₹{booking.totals?.userTotalPaid}</span>
                        </div>
                      </div>

                      {/* Security Verification Keys */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
                        <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Key className="h-4 w-4 text-accent" />
                          Security Exchange Checkpoints
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Handover OTP</p>
                            <p className="text-lg font-mono font-extrabold text-accent mt-0.5">{booking.handoverOtp}</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Return OTP</p>
                            <p className="text-lg font-mono font-extrabold text-gray-600 mt-0.5">{booking.returnOtp}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400">Show Handover OTP to host to authorize delivery. Show Return OTP upon returning.</p>
                      </div>

                    </div>

                    {/* Live delivery tracking map */}
                    <div className="lg:col-span-2 flex flex-col h-[280px] lg:h-auto min-h-[250px] relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-accent" />
                          Hyperlocal Delivery Tracking Map
                        </span>
                        {isTracking ? (
                          <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 font-bold border border-green-200 rounded animate-pulse">
                            Live Stream Connected
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Waiting for host to simulate delivery location updates...</span>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        <MapContainer center={mapCenter} zoom={14} className="w-full h-full">
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <ChangeView center={mapCenter} />
                          {isTracking && (
                            <Marker position={liveLocations[booking._id]} icon={hostIcon}>
                              <Popup>
                                <div className="text-xs font-bold">Delivery Partner Location</div>
                              </Popup>
                            </Marker>
                          )}
                          {/* Item Listing Location Pin */}
                          {booking.listingId?.location?.coordinates && (
                            <Marker 
                              position={[booking.listingId.location.coordinates[1], booking.listingId.location.coordinates[0]]} 
                              icon={userIcon}
                            >
                              <Popup>
                                <div className="text-xs font-bold">Item Shop / Location</div>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- HOST VIEW PANEL --- */}
      {user.role === 'HOST' && (
        <div>
          {/* Tab 1: Bookings Management */}
          {activeTab === 'bookings' && (
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
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                              booking.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-3">
                            <div>
                              <p className="text-gray-400">Renter Name</p>
                              <p className="font-semibold text-primary">{booking.userId?.name || 'Customer'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Earnings</p>
                              <p className="font-bold text-green-600">₹{booking.totals?.hostEarned}</p>
                            </div>
                          </div>

                          {/* Handover OTP Verification Form */}
                          {booking.status === 'REQUESTED' && (
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
                              <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                <Key className="h-4 w-4 text-accent" />
                                Handover OTP Verification
                              </h5>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength="6"
                                  placeholder="Enter 6-digit OTP"
                                  value={handoverOtp[booking._id] || ''}
                                  onChange={(e) => setHandoverOtp({
                                    ...handoverOtp,
                                    [booking._id]: e.target.value
                                  })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
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

                          {/* Active trip tracking toggle */}
                          {booking.status === 'ACTIVE' && (
                            <div className="space-y-2">
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-xs text-green-800 font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Handover verified. Trip is active!
                              </div>
                              <button
                                onClick={() => {
                                  if (isSimulating) {
                                    setSimulatingBookingId(null);
                                  } else {
                                    setSimulatingBookingId(booking._id);
                                    // Start tracking at item coordinates
                                    if (booking.listingId?.location?.coordinates) {
                                      setSimulatedCoords([
                                        booking.listingId.location.coordinates[1],
                                        booking.listingId.location.coordinates[0]
                                      ]);
                                    }
                                  }
                                }}
                                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                  isSimulating
                                    ? 'bg-red-50 text-accent border-red-200 hover:bg-red-100'
                                    : 'bg-accent text-white border-transparent hover:bg-accent-hover shadow-sm shadow-accent/10'
                                }`}
                              >
                                {isSimulating ? 'Stop Simulator' : 'Open Delivery Simulator Map'}
                              </button>
                            </div>
                          )}

                        </div>

                        {/* Right column: Simulator console map */}
                        <div className="lg:col-span-2 flex flex-col h-[280px] lg:h-auto min-h-[250px] relative">
                          {isSimulating ? (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                  <Truck className="h-4 w-4 text-accent" />
                                  Delivery Location Simulator (Click on map to move vehicle)
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-accent text-white font-bold rounded animate-pulse">
                                  Simulator Streaming
                                </span>
                              </div>
                              <div className="flex-1 w-full rounded-xl overflow-hidden border border-accent/20 shadow-md">
                                <MapContainer center={simulatedCoords} zoom={14} className="w-full h-full">
                                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                  <ChangeView center={simulatedCoords} />
                                  <MapSimulationEmitter onSimulateClick={handleSimulateMovement} />
                                  
                                  {/* User Delivery Vehicle Pin */}
                                  <Marker position={simulatedCoords} icon={hostIcon}>
                                    <Popup>
                                      <div className="text-xs font-bold">Simulated Vehicle Pin</div>
                                    </Popup>
                                  </Marker>
                                </MapContainer>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-center p-6">
                              <div className="space-y-2 max-w-sm">
                                <Truck className="h-10 w-10 text-gray-300 mx-auto" />
                                <p className="text-xs font-bold text-gray-500">Coordinate Simulator Map</p>
                                <p className="text-[10px] text-gray-400">Verify a requested handover to activate the delivery console. Click on the map to stream real-time telemetry coordinates to the renter.</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My listed items list */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Grid className="h-5 w-5 text-accent" />
                Your Listed Rental Products ({hostListings.length})
              </h3>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : hostListings.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-150 shadow-md max-w-md mx-auto">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-bold text-gray-600">You haven't listed any items.</p>
                  <p className="text-sm text-gray-400 mt-2">Add your first camera, laptop, or vehicle to start earning!</p>
                  <button
                    onClick={() => setActiveTab('add-listing')}
                    className="mt-6 px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all"
                  >
                    List an Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostListings.map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl border border-gray-150 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                      
                      {/* Product Image preview */}
                      {item.images && item.images.length > 0 ? (
                        <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-gray-50 flex items-center justify-center border-b border-gray-100">
                          <Package className="h-10 w-10 text-gray-300" />
                        </div>
                      )}

                      <div className="p-4 space-y-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded uppercase">
                            {item.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' :
                            item.status === 'RENTED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-baseline">
                        <div>
                          <p className="text-[10px] text-gray-400">Daily Rental</p>
                          <p className="text-sm font-bold text-accent">₹{item.dailyRent}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 text-right">Retail Value</p>
                          <p className="text-xs font-semibold text-gray-700 text-right">₹{item.mrp}</p>
                        </div>
                      </div>

                      {/* Edit & Delete Action Bar */}
                      <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex-1 py-1.5 border border-gray-200 hover:border-accent hover:text-accent rounded-lg text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Add new listing form with location map picker */}
          {activeTab === 'add-listing' && (
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
          )}
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && editingItem && (
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
                    className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-accent/15"
                  >
                    {editFormLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Right Column: Location map picker */}
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
                              setEditCoordinates([lng, lat]);
                              setEditMarkerPos([lat, lng]);
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
                      [{editCoordinates[0].toFixed(4)}, {editCoordinates[1].toFixed(4)}]
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <MapContainer center={editMarkerPos} zoom={12} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ChangeView center={editMarkerPos} />
                    <ListingLocationPicker setCoordinates={setEditCoordinates} setMarkerPos={setEditMarkerPos} />
                    <Marker position={editMarkerPos} icon={hostIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-center">Current location of listed asset</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="text-[10px] text-gray-400 italic mt-2">Click on the map above to update the storage or pickup location.</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE PRODUCT MODAL --- */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 bg-primary/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-650 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-primary">Delete Listing?</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-bold text-gray-800">"{deletingItem.title}"</span>? This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-left">
                  <p className="text-xs font-semibold text-red-700">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Delete Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

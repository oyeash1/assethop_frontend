// src/app/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../core/api/client';
import { useAuth } from '../../core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import { Plus, Grid, List, Package, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

import RenterBookingsList from '../../components/RenterBookingsList';
import HostBookingsList from '../../components/HostBookingsList';
import AddListingForm from '../../components/AddListingForm';
import EditListingModal from '../../components/EditListingModal';

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

  // Renter sequential step overrides
  const [renterSteps, setRenterSteps] = useState({});
  const [userLocations, setUserLocations] = useState({});
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [hostReturnPhotos, setHostReturnPhotos] = useState({});
  const [photoUploading, setPhotoUploading] = useState({});
  const [returnOtpFields, setReturnOtpFields] = useState({});
  const [now, setNow] = useState(new Date());

  // Active simulated booking for host
  const [simulatingBookingId, setSimulatingBookingId] = useState(null);
  const [simulatedCoords, setSimulatedCoords] = useState([19.0760, 72.8777]);

  // Real-time ticking clock for timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set user simulated location offset for navigation step
  useEffect(() => {
    if (rentals.length > 0) {
      rentals.forEach(booking => {
        if (booking.listingId?.location?.coordinates && !userLocations[booking._id]) {
          const [lng, lat] = booking.listingId.location.coordinates;
          // Set a slightly offset user location to simulate distance (~350 meters)
          setUserLocations(prev => ({
            ...prev,
            [booking._id]: [lat + 0.0022, lng - 0.0022] // [latitude, longitude]
          }));
        }
      });
    }
  }, [rentals]);

  // Automatic background polling to synchronize booking status updates
  useEffect(() => {
    let intervalId;
    if (isAuthenticated) {
      const hasPendingTransitions = 
        (user.role === 'USER' && rentals.some(r => r.status === 'REQUESTED' || r.status === 'ACTIVE')) ||
        (user.role === 'HOST' && hostRequests.some(r => r.status === 'REQUESTED' || r.status === 'ACTIVE'));

      if (hasPendingTransitions) {
        intervalId = setInterval(() => {
          silentLoadData();
        }, 4000);
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [rentals, hostRequests, isAuthenticated]);

  const silentLoadData = async () => {
    try {
      if (user.role === 'USER') {
        const res = await api.get('/bookings/my-rentals');
        if (res?.status === 'success') {
          setRentals(res.data);
        }
      } else if (user.role === 'HOST' && activeTab === 'bookings') {
        const res = await api.get('/bookings/host-requests');
        if (res?.status === 'success') {
          setHostRequests(res.data);
        }
      }
    } catch (err) {
      console.error('Silent data sync error:', err);
    }
  };

  const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  };

  const formatDuration = (ms) => {
    if (isNaN(ms) || ms < 0) return '00h 00m 00s';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handlePickupPhotoCapture = async (fileOrEvent, bookingId) => {
    let file = null;
    if (fileOrEvent?.target?.files) {
      file = fileOrEvent.target.files[0];
    } else if (fileOrEvent instanceof File || fileOrEvent instanceof Blob) {
      file = fileOrEvent instanceof File 
        ? fileOrEvent 
        : new File([fileOrEvent], `camera_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
    }

    if (!file) return;

    setPhotoUploading(prev => ({ ...prev, [bookingId]: true }));
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/listings/upload', formData);
      if (res?.status === 'success') {
        setCapturedPhotos(prev => {
          const current = prev[bookingId] || [];
          return {
            ...prev,
            [bookingId]: [...current, res.url]
          };
        });
      }
    } catch (err) {
      alert(`Photo capture failed to upload: ${err.message}`);
    } finally {
      setPhotoUploading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const removeCapturedPhoto = (bookingId, index) => {
    setCapturedPhotos(prev => {
      const current = prev[bookingId] || [];
      return {
        ...prev,
        [bookingId]: current.filter((_, i) => i !== index)
      };
    });
  };

  const handleUploadAndLockPhotos = async (bookingId) => {
    const photos = capturedPhotos[bookingId] || [];
    if (photos.length < 2) {
      alert('Please capture at least 2 live photos of the asset before proceeding.');
      return;
    }

    try {
      const res = await api.post('/bookings/upload-pickup-photos', { bookingId, photos });
      if (res?.status === 'success') {
        alert('🎉 Pickup photos uploaded and locked successfully.');
        loadData();
      }
    } catch (err) {
      alert(`Failed to save pickup photos: ${err.message}`);
    }
  };

  const handleReturnPhotoCapture = async (fileOrEvent, bookingId) => {
    let file = null;
    if (fileOrEvent?.target?.files) {
      file = fileOrEvent.target.files[0];
    } else if (fileOrEvent instanceof File || fileOrEvent instanceof Blob) {
      file = fileOrEvent instanceof File 
        ? fileOrEvent 
        : new File([fileOrEvent], `return_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
    }

    if (!file) return;

    setPhotoUploading(prev => ({ ...prev, [bookingId]: true }));
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/listings/upload', formData);
      if (res?.status === 'success') {
        setHostReturnPhotos(prev => {
          const current = prev[bookingId] || [];
          return {
            ...prev,
            [bookingId]: [...current, res.url]
          };
        });
      }
    } catch (err) {
      alert(`Return inspection photo failed to upload: ${err.message}`);
    } finally {
      setPhotoUploading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const removeReturnPhoto = (bookingId, index) => {
    setHostReturnPhotos(prev => {
      const current = prev[bookingId] || [];
      return {
        ...prev,
        [bookingId]: current.filter((_, i) => i !== index)
      };
    });
  };

  const handleUploadAndLockReturnPhotos = async (bookingId) => {
    const photos = hostReturnPhotos[bookingId] || [];
    if (photos.length < 2) {
      alert('Please capture at least 2 return inspection photos of the asset before proceeding.');
      return;
    }

    try {
      const res = await api.post('/bookings/upload-return-photos', { bookingId, photos });
      if (res?.status === 'success') {
        alert('🎉 Return inspection photos uploaded and locked successfully.');
        loadData();
      }
    } catch (err) {
      alert(`Failed to save return inspection photos: ${err.message}`);
    }
  };

  const handleVerifyReturnOtp = async (bookingId) => {
    const otp = returnOtpFields[bookingId];
    if (!otp) {
      alert('Please enter the 6-digit Return OTP.');
      return;
    }

    try {
      const res = await api.post('/bookings/verify-return', { bookingId, otp });
      if (res?.status === 'success') {
        alert('🎉 Return OTP Verified! Rental is now COMPLETED.');
        loadData();
      }
    } catch (err) {
      alert(`Return verification failed: ${err.message}`);
    }
  };

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

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Setup sockets and listeners
  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Socket client tunnel connected successfully.');
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
        const res = await api.get('/bookings/my-rentals');
        if (res?.status === 'success') {
          setRentals(res.data);
        }
      } else if (user.role === 'HOST') {
        if (activeTab === 'bookings') {
          const res = await api.get('/bookings/host-requests');
          if (res?.status === 'success') {
            setHostRequests(res.data);
          }
        } else if (activeTab === 'listings') {
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

  const handleSimulateMovement = (lat, lng) => {
    if (!simulatingBookingId) return;
    
    setSimulatedCoords([lat, lng]);
    
    if (socketRef.current) {
      socketRef.current.emit('update_location', {
        bookingId: simulatingBookingId,
        lat,
        lng
      });
    }
  };

  const handleAddListingSubmit = async (e) => {
    e.preventDefault();

    if (!user.payoutDetails?.isPayoutConfigured) {
      toast.error('Please configure your Payout Details in Profile Settings to receive rental earnings.', {
        duration: 6000,
      });
      return;
    }

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
        setTitle('');
        setDescription('');
        setMrp('');
        setDailyRent('');
        setImages([]);
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
        <RenterBookingsList
          rentals={rentals}
          loading={loading}
          navigate={navigate}
          liveLocations={liveLocations}
          renterSteps={renterSteps}
          setRenterSteps={setRenterSteps}
          userLocations={userLocations}
          capturedPhotos={capturedPhotos}
          handlePickupPhotoCapture={handlePickupPhotoCapture}
          removeCapturedPhoto={removeCapturedPhoto}
          photoUploading={photoUploading}
          handleUploadAndLockPhotos={handleUploadAndLockPhotos}
          returnOtpFields={returnOtpFields}
          setReturnOtpFields={setReturnOtpFields}
          handleVerifyReturnOtp={handleVerifyReturnOtp}
          now={now}
          formatDuration={formatDuration}
          getHaversineDistance={getHaversineDistance}
        />
      )}

      {/* --- HOST VIEW PANEL --- */}
      {user.role === 'HOST' && (
        <div>
          {/* Tab 1: Bookings Management */}
          {activeTab === 'bookings' && (
            <HostBookingsList
              hostRequests={hostRequests}
              loading={loading}
              simulatingBookingId={simulatingBookingId}
              setSimulatingBookingId={setSimulatingBookingId}
              simulatedCoords={simulatedCoords}
              setSimulatedCoords={setSimulatedCoords}
              handoverOtp={handoverOtp}
              setHandoverOtp={setHandoverOtp}
              handleVerifyOtp={handleVerifyOtp}
              returnOtpFields={returnOtpFields}
              setReturnOtpFields={setReturnOtpFields}
              handleVerifyReturnOtp={handleVerifyReturnOtp}
              handleSimulateMovement={handleSimulateMovement}
              hostReturnPhotos={hostReturnPhotos}
              handleReturnPhotoCapture={handleReturnPhotoCapture}
              removeReturnPhoto={removeReturnPhoto}
              photoUploading={photoUploading}
              handleUploadAndLockReturnPhotos={handleUploadAndLockReturnPhotos}
              loadData={loadData}
              now={now}
              formatDuration={formatDuration}
            />
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
                      
                      {item.images && item.images.length > 0 ? (
                        <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-gray-55 flex items-center justify-center border-b border-gray-100">
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

          {/* Tab 3: Add new listing form */}
          {activeTab === 'add-listing' && (
            <AddListingForm
              user={user}
              navigate={navigate}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              mrp={mrp}
              setMrp={setMrp}
              dailyRent={dailyRent}
              setDailyRent={setDailyRent}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              markerPos={markerPos}
              setMarkerPos={setMarkerPos}
              images={images}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              imageUploading={imageUploading}
              formLoading={formLoading}
              handleAddListingSubmit={handleAddListingSubmit}
            />
          )}
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      <EditListingModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingItem={editingItem}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editMrp={editMrp}
        setEditMrp={setEditMrp}
        editDailyRent={editDailyRent}
        setEditDailyRent={setEditDailyRent}
        editImages={editImages}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        imageUploading={imageUploading}
        editCoordinates={editCoordinates}
        setEditCoordinates={setEditCoordinates}
        editMarkerPos={editMarkerPos}
        setEditMarkerPos={setEditMarkerPos}
        editFormLoading={editFormLoading}
        handleEditSubmit={handleEditSubmit}
      />

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

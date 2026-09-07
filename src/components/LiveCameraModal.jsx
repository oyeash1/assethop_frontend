// src/components/LiveCameraModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Upload, MapPin, ShieldCheck } from 'lucide-react';

export default function LiveCameraModal({ isOpen, onClose, onCapture, bookingId }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [flashEffect, setFlashEffect] = useState(false);

  // Geo-location state
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);

  // File fallback input ref
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    // Start live high-accuracy geolocation stream
    let watchId = null;
    if (navigator.geolocation) {
      setGeoLoading(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGeoCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          setGeoLoading(false);
          setGeoError(null);
        },
        (err) => {
          console.warn('Geolocation acquisition error:', err.message);
          setGeoError('GPS Location unavailable or permission denied.');
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGeoError('Geolocation API not supported by browser.');
      setGeoLoading(false);
    }

    return () => {
      stopCamera();
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported by your browser.');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        // Fallback to basic video constraint if specific facingMode fails
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setLoading(false);
    } catch (err) {
      console.error('Webcam stream error:', err);
      setError(err.message || 'Unable to access camera. Please check camera permissions.');
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSnap = () => {
    if (!videoRef.current || loading || error) return;

    // Trigger visual camera shutter flash animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // --- Burn-in Geo-tag Watermark Banner on the Canvas ---
    const bannerHeight = Math.round(height * 0.12);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Dark slate overlay
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Top Orange Accent Line
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, height - bannerHeight, width, Math.max(3, Math.round(height * 0.005)));

    // Date & Time formatting
    const now = new Date();
    const timestampStr = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const latStr = geoCoords ? `${geoCoords.lat.toFixed(6)}° N` : 'LAT: N/A';
    const lngStr = geoCoords ? `${geoCoords.lng.toFixed(6)}° E` : 'LNG: N/A';
    const accStr = geoCoords ? `(±${Math.round(geoCoords.accuracy)}m)` : '';

    // Line 1: Branding & Timestamp
    const fontSizeMain = Math.max(12, Math.round(bannerHeight * 0.26));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSizeMain}px sans-serif`;
    ctx.fillText(`📍 ASSETHOP GEO-TAGGED VERIFICATION • ${timestampStr}`, 20, height - bannerHeight + Math.round(bannerHeight * 0.42));

    // Line 2: GPS Coordinates & Booking ID
    const fontSizeSub = Math.max(10, Math.round(bannerHeight * 0.22));
    ctx.fillStyle = '#34d399'; // Emerald text for GPS
    ctx.font = `bold ${fontSizeSub}px monospace`;
    ctx.fillText(`GPS: ${latStr}, ${lngStr} ${accStr} | REF ID: ${bookingId || 'ASSETHOP-LIVE'}`, 20, height - bannerHeight + Math.round(bannerHeight * 0.80));

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `geotagged_live_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file, bookingId, geoCoords);
          onClose();
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileFallbackChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onCapture(file, bookingId, geoCoords);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Flash Effect Overlay */}
        {flashEffect && <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />}

        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Live Asset Verification Camera
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> GeoTagged
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">Capture real-time physical condition with live GPS coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* Live Geo-tag Location Pill Overlay */}
          {!loading && !error && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white flex items-center gap-2 z-20 shadow-lg">
              <MapPin className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
              <div className="text-[11px] font-mono leading-tight">
                {geoLoading ? (
                  <span className="text-gray-300 animate-pulse">Acquiring GPS location...</span>
                ) : geoCoords ? (
                  <div>
                    <p className="font-bold text-emerald-300">
                      {geoCoords.lat.toFixed(5)}° N, {geoCoords.lng.toFixed(5)}° E
                    </p>
                    <p className="text-[9px] text-gray-400">GPS Accuracy: ±{Math.round(geoCoords.accuracy)}m</p>
                  </div>
                ) : (
                  <span className="text-amber-400 font-sans text-[10px]">Location Access Disabled</span>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
              <span className="text-xs font-semibold">Initializing live camera stream...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center max-w-md space-y-4">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Camera Unavailable</p>
                <p className="text-xs text-gray-400">{error}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent/20"
                >
                  <Upload className="h-4 w-4" />
                  Select Image File From Device
                </button>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Retry Camera Connection
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for Fallback */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileFallbackChange}
            className="hidden"
          />

          {/* Live Video Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${loading || error ? 'hidden' : 'block'}`}
          />

          {/* Camera Viewfinder Overlay UI */}
          {!loading && !error && (
            <>
              {/* Corner Viewfinder Guidelines */}
              <div className="absolute inset-6 pointer-events-none border-2 border-white/20 rounded-2xl flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl"></div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr"></div>
                </div>
                {/* Center target crosshair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-accent/50 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl"></div>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-accent rounded-br"></div>
                </div>
              </div>

              {/* Live watermark badge */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-gray-300 font-mono border border-white/10 pointer-events-none">
                ASSETHOP LIVE • GEOTAGGED
              </div>
            </>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="p-6 bg-gray-900 border-t border-gray-800 flex items-center justify-around">
          
          {/* Flip Camera Button */}
          <button
            onClick={handleToggleFacingMode}
            disabled={loading || error}
            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 rounded-full transition-all cursor-pointer"
            title="Switch Camera"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          {/* Shutter Snap Button */}
          <button
            onClick={handleSnap}
            disabled={loading || error}
            className="h-16 w-16 bg-accent hover:bg-accent-hover text-white disabled:opacity-40 rounded-full flex items-center justify-center shadow-lg shadow-accent/30 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/10"
            title="Snap Geo-Tagged Photo"
          >
            <Camera className="h-8 w-8" />
          </button>

          {/* File Picker Fallback Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-all cursor-pointer"
            title="Upload File Instead"
          >
            <Upload className="h-5 w-5" />
          </button>

        </div>

      </div>
    </div>
  );
}

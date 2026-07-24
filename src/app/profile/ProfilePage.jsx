// src/app/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { api } from '../../core/api/client';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, ShieldAlert, Sparkles, 
  Upload, FileText, CheckCircle, AlertTriangle, Eye, ArrowLeft, Loader2, Camera
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, cibil, updateUser } = useAuth();
  const navigate = useNavigate();

  // Navigation guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Profile fields state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // KYC submission form state
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState('');
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);

  const [panNumber, setPanNumber] = useState('');
  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState('');
  const [isUploadingPan, setIsUploadingPan] = useState(false);

  // Optional secondary document state
  const [otherDocType, setOtherDocType] = useState('');
  const [otherDocNumber, setOtherDocNumber] = useState('');
  const [otherDocFile, setOtherDocFile] = useState(null);
  const [otherDocPreview, setOtherDocPreview] = useState('');
  const [isUploadingOther, setIsUploadingOther] = useState(false);

  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSuccessMsg, setKycSuccessMsg] = useState('');
  const [kycErrorMsg, setKycErrorMsg] = useState('');

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load user data into form fields on component mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      
      // Pre-fill KYC details if they exist in PENDING or VERIFIED state
      if (user.kycDetails) {
        setAadharNumber(user.kycDetails.aadharNumber || '');
        setAadharPreview(user.kycDetails.aadharFile || '');
        setPanNumber(user.kycDetails.panNumber || '');
        setPanPreview(user.kycDetails.panFile || '');
        setOtherDocType(user.kycDetails.otherDocType || '');
        setOtherDocNumber(user.kycDetails.otherDocNumber || '');
        setOtherDocPreview(user.kycDetails.otherDocFile || '');
      }
    }
  }, [user]);

  // Handle general file upload helper
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file); // API expects field name 'image'

    try {
      const res = await api.post('/listings/upload', formData);
      if (res?.status === 'success' && res.url) {
        return res.url;
      }
      throw new Error('Upload request failed.');
    } catch (err) {
      console.error(err);
      throw new Error(`File upload failed: ${err.message}`);
    }
  };

  // Avatar profile image change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      const res = await api.put('/auth/profile', {
        profileImage: url
      });
      if (res?.status === 'success') {
        updateUser(res.data);
        setProfileSuccessMsg('🎉 Profile photo updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Avatar upload failed.');
      setTimeout(() => setProfileErrorMsg(''), 4000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle saving personal details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setProfileErrorMsg('Phone number must be exactly 10 digits.');
      setIsSavingProfile(false);
      return;
    }

    try {
      const res = await api.put('/auth/profile', {
        name,
        phoneNumber
      });

      if (res?.status === 'success') {
        updateUser(res.data);
        setProfileSuccessMsg('🎉 Profile details saved successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 3500);
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle document file inputs
  const handleDocFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'aadhar') {
      setIsUploadingAadhar(true);
      try {
        const url = await uploadFile(file);
        setAadharFile(file);
        setAadharPreview(url);
      } catch (err) {
        setKycErrorMsg(err.message);
      } finally {
        setIsUploadingAadhar(false);
      }
    } else if (type === 'pan') {
      setIsUploadingPan(true);
      try {
        const url = await uploadFile(file);
        setPanFile(file);
        setPanPreview(url);
      } catch (err) {
        setKycErrorMsg(err.message);
      } finally {
        setIsUploadingPan(false);
      }
    } else if (type === 'other') {
      setIsUploadingOther(true);
      try {
        const url = await uploadFile(file);
        setOtherDocFile(file);
        setOtherDocPreview(url);
      } catch (err) {
        setKycErrorMsg(err.message);
      } finally {
        setIsUploadingOther(false);
      }
    }
  };

  // Handle KYC Request Submit
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingKyc(true);
    setKycSuccessMsg('');
    setKycErrorMsg('');

    // Form validations
    if (!aadharNumber || !aadharPreview) {
      setKycErrorMsg('Aadhar number and document copy are required.');
      setIsSubmittingKyc(false);
      return;
    }

    if (!panNumber || !panPreview) {
      setKycErrorMsg('PAN number and document copy are required.');
      setIsSubmittingKyc(false);
      return;
    }

    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadharNumber)) {
      setKycErrorMsg('Aadhar Number must be exactly 12 digits.');
      setIsSubmittingKyc(false);
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panRegex.test(panNumber)) {
      setKycErrorMsg('PAN Number must be valid (e.g. ABCDE1234F).');
      setIsSubmittingKyc(false);
      return;
    }

    try {
      const payload = {
        aadharNumber,
        aadharFile: aadharPreview,
        panNumber: panNumber.toUpperCase(),
        panFile: panPreview,
        otherDocType,
        otherDocNumber,
        otherDocFile: otherDocPreview
      };

      const res = await api.post('/auth/kyc/submit', payload);
      if (res?.status === 'success') {
        updateUser(res.data);
        setKycSuccessMsg('🎉 KYC submitted successfully! Verification is now pending.');
      }
    } catch (err) {
      setKycErrorMsg(err.message || 'KYC submission failed.');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Helper to mask numbers for privacy
  const maskNumber = (num, visibleDigits = 4) => {
    if (!num) return '';
    const cleanNum = num.replace(/[^A-Za-z0-9]/g, '');
    if (cleanNum.length <= visibleDigits) return cleanNum;
    const masked = 'X'.repeat(cleanNum.length - visibleDigits);
    const visible = cleanNum.slice(-visibleDigits);
    
    // Format Aadhar specifically as XXXX-XXXX-1234
    if (cleanNum.length === 12) {
      return `XXXX-XXXX-${visible}`;
    }
    return `${masked}${visible}`;
  };

  if (!user) return null;

  // Decide KYC Status Visual Configurations
  const getKycStatusConfig = (status) => {
    switch (status) {
      case 'VERIFIED':
        return {
          bg: 'bg-green-50 border-green-200 text-green-800',
          badge: 'bg-green-600 text-white',
          icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
          title: 'KYC Verified (Trust Tier 1)',
          desc: 'Your account is verified. You have full privileges to add rental listings and rent products on AssetHop.'
        };
      case 'PENDING':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          badge: 'bg-amber-500 text-white',
          icon: <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />,
          title: 'KYC Verification Pending',
          desc: 'Documents submitted. Our moderation desk is currently validating your inputs. Usually completed within 24 hours.'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-50 border-red-200 text-red-800',
          badge: 'bg-red-600 text-white',
          icon: <ShieldAlert className="h-6 w-6 text-red-600" />,
          title: 'KYC Rejected / Action Required',
          desc: user.kycDetails?.rejectionReason 
            ? `Your verification failed. Reason: ${user.kycDetails.rejectionReason}. Please correct details and re-submit.`
            : 'Your verification failed. One or more documents were blurry or invalid. Please re-submit valid credentials.'
        };
      case 'NOT_SUBMITTED':
      default:
        return {
          bg: 'bg-gray-50 border-gray-200 text-gray-800',
          badge: 'bg-gray-500 text-white',
          icon: <AlertTriangle className="h-6 w-6 text-gray-500" />,
          title: 'KYC Submission Required',
          desc: 'Please submit Aadhar Card and PAN Card to unlock full rental and hosting capabilities.'
        };
    }
  };

  const kycConfig = getKycStatusConfig(user.kycStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-bgmain min-h-[calc(100vh-80px)]">
      
      {/* Back to Home Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-accent transition-all uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Identity Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-md flex flex-col items-center text-center space-y-6">
            
            {/* Profile Avatar Image Upload container */}
            <div className="relative group cursor-pointer">
              <div className="h-28 w-28 bg-gradient-to-tr from-accent to-accent-light text-white rounded-full flex items-center justify-center text-4xl font-black shadow-lg shadow-accent/15 border-2 border-white ring-4 ring-accent/10 overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                )}
              </div>
              {/* Overlay edit state */}
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 border-2 border-white">
                <Camera className="h-6 w-6 mb-0.5" />
                {isUploadingAvatar ? 'Saving...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>

              {/* Camera Icon Badge */}
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-accent hover:bg-accent-hover text-white rounded-full border border-white flex items-center justify-center cursor-pointer shadow-md transition-all duration-200">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user.name}</h3>
              <div className="flex gap-2 justify-center">
                <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-extrabold uppercase rounded-full tracking-widest">
                  {user.role}
                </span>
                <span className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-widest ${kycConfig.badge}`}>
                  {user.kycStatus}
                </span>
              </div>
            </div>

            {/* Dynamic Status Display Box */}
            <div className={`w-full p-4 border rounded-2xl flex gap-3 text-left ${kycConfig.bg}`}>
              <div className="shrink-0 pt-0.5">
                {kycConfig.icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wide">{kycConfig.title}</p>
                <p className="text-[11px] leading-relaxed text-gray-500 font-medium">{kycConfig.desc}</p>
              </div>
            </div>

            {/* CIBIL Score trust meter */}
            <div className="w-full pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-yellow-500 shrink-0" />
                  Simulated CIBIL Trust Score
                </span>
                <span className="font-extrabold text-gray-900">{cibil} / 900</span>
              </div>
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    cibil >= 750 ? 'bg-green-600' : cibil >= 650 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${((cibil - 300) / 600) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                <span>Poor (300)</span>
                <span>Excellent (900)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Tabular Edit Account Details and KYC Document Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Edit profile details */}
          <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-md">
            <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              Personal Profile Details
            </h3>

            {profileSuccessMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded-xl mb-4">
                {profileSuccessMsg}
              </div>
            )}
            
            {profileErrorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl mb-4">
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Email (Disabled for safety) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address (Non-Editable)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4.5 w-4.5" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Contact Number (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    maxLength="10"
                    placeholder="10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent/15 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Account Settings'}
                </button>
              </div>

            </form>
          </div>

          {/* Section 2: KYC submission center */}
          <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-md">
            <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Indian KYC Verification Document Center
            </h3>

            {kycSuccessMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded-xl mb-6">
                {kycSuccessMsg}
              </div>
            )}
            
            {kycErrorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl mb-6">
                {kycErrorMsg}
              </div>
            )}

            {/* KYC Render Switch based on Status */}
            {(user.kycStatus === 'NOT_SUBMITTED' || user.kycStatus === 'REJECTED') && (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                <p className="text-xs text-gray-500 font-medium">
                  Provide your government identifiers below. Uploaded scanned images must be clear, readable, and in JPEG/PNG/PDF formats.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Aadhar Number Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Aadhar Card Number (12 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength="12"
                      placeholder="e.g. 543298761234"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {/* Aadhar File Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Aadhar Card Copy Upload</label>
                    <div className="flex items-center gap-3">
                      <label className={`flex-1 py-2.5 px-4 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isUploadingAadhar ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="h-4 w-4 text-gray-400" />
                        {isUploadingAadhar ? 'Uploading...' : aadharPreview ? 'Change Document' : 'Upload Image/PDF'}
                        <input
                          type="file"
                          required={!aadharPreview}
                          accept="image/*,application/pdf"
                          onChange={(e) => handleDocFileUpload(e, 'aadhar')}
                          className="hidden"
                        />
                      </label>
                      
                      {aadharPreview && (
                        <a 
                          href={aadharPreview} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2.5 bg-gray-100 text-accent hover:bg-accent/10 border border-gray-250 rounded-xl"
                          title="View Uploaded File"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* PAN Number Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">PAN Card Number (10 Alphanumeric)</label>
                    <input
                      type="text"
                      required
                      maxLength="10"
                      placeholder="e.g. ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {/* PAN File Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">PAN Card Copy Upload</label>
                    <div className="flex items-center gap-3">
                      <label className={`flex-1 py-2.5 px-4 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isUploadingPan ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="h-4 w-4 text-gray-400" />
                        {isUploadingPan ? 'Uploading...' : panPreview ? 'Change Document' : 'Upload Image/PDF'}
                        <input
                          type="file"
                          required={!panPreview}
                          accept="image/*,application/pdf"
                          onChange={(e) => handleDocFileUpload(e, 'pan')}
                          className="hidden"
                        />
                      </label>
                      
                      {panPreview && (
                        <a 
                          href={panPreview} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2.5 bg-gray-100 text-accent hover:bg-accent/10 border border-gray-250 rounded-xl"
                          title="View Uploaded File"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Optional Secondary Document Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Other Identity Proof (Optional)</label>
                    <select
                      value={otherDocType}
                      onChange={(e) => setOtherDocType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">None / No Additional Document</option>
                      <option value="DRIVING_LICENSE">Driving License (DL)</option>
                      <option value="VOTER_ID">Voter ID Card</option>
                      <option value="PASSPORT">Indian Passport</option>
                    </select>
                  </div>

                  {/* Optional Document Fields */}
                  {otherDocType && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Document Card/ID Number</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter Card Number"
                          value={otherDocNumber}
                          onChange={(e) => setOtherDocNumber(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Upload Copy of Selected ID</label>
                        <div className="flex items-center gap-3 max-w-md">
                          <label className={`flex-1 py-2.5 px-4 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isUploadingOther ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="h-4 w-4 text-gray-400" />
                            {isUploadingOther ? 'Uploading...' : otherDocPreview ? 'Change Document' : 'Upload Copy (Image/PDF)'}
                            <input
                              type="file"
                              required={!otherDocPreview}
                              accept="image/*,application/pdf"
                              onChange={(e) => handleDocFileUpload(e, 'other')}
                              className="hidden"
                            />
                          </label>
                          
                          {otherDocPreview && (
                            <a 
                              href={otherDocPreview} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-2.5 bg-gray-100 text-accent hover:bg-accent/10 border border-gray-250 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingKyc || isUploadingAadhar || isUploadingPan || isUploadingOther}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md shadow-accent/15 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingKyc ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Documents...
                      </>
                    ) : 'Request KYC Verification'}
                  </button>
                </div>
              </form>
            )}

            {/* Under Review State */}
            {user.kycStatus === 'PENDING' && (
              <div className="space-y-6 text-left">
                <div className="bg-amber-50/50 p-4 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-xs font-semibold leading-relaxed">
                  <Loader2 className="h-5 w-5 text-amber-600 animate-spin shrink-0" />
                  <div>
                    <p className="font-extrabold uppercase">Documentation Submitted Successfully</p>
                    <p className="mt-1 text-gray-500 font-medium">
                      Our verification desk is currently validating your documents. We check details against NSDL (for PAN) and UIDAI databases. In the meantime, you can explore the marketplace but listings and renting commands are locked.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Submitted Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Aadhar Card Number</p>
                      <p className="text-gray-700 font-semibold mt-0.5">{maskNumber(aadharNumber)}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">PAN Card Number</p>
                      <p className="text-gray-700 font-semibold mt-0.5">{maskNumber(panNumber, 3)}</p>
                    </div>

                    {otherDocType && (
                      <div className="bg-white p-3 rounded-xl border border-gray-100 md:col-span-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Secondary Document ({otherDocType.replace('_', ' ')})</p>
                        <p className="text-gray-700 font-semibold mt-0.5">{maskNumber(otherDocNumber, 2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Verified Success State */}
            {user.kycStatus === 'VERIFIED' && (
              <div className="space-y-6 text-left">
                <div className="bg-green-50 p-4 border border-green-200 rounded-2xl flex gap-3 text-green-800 text-xs font-semibold leading-relaxed">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-extrabold uppercase">Verification Complete</p>
                    <p className="mt-1 text-gray-500 font-medium">
                      Your identity credentials were verified on {user.kycDetails?.submittedAt ? new Date(user.kycDetails.submittedAt).toLocaleDateString() : 'recent audit'}. You have been awarded Trust Tier 1 status.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Verified Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Aadhar Card Number</p>
                      <p className="text-gray-700 font-semibold mt-0.5">{maskNumber(aadharNumber)}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">PAN Card Number</p>
                      <p className="text-gray-700 font-semibold mt-0.5">{maskNumber(panNumber, 3)}</p>
                    </div>

                    {otherDocType && (
                      <div className="bg-white p-3 rounded-xl border border-gray-100 md:col-span-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Secondary Document</p>
                        <p className="text-gray-700 font-semibold mt-0.5">{otherDocType.replace('_', ' ')} verified</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './core/hooks/useAuth';
import { api } from './core/api/client';
import HomePage from './app/home/HomePage';
import LoginPage from './app/login/LoginPage';
import LandingPage from './app/landing/LandingPage';
import ListingDetailsPage from './app/listing/ListingDetailsPage';
import DashboardPage from './app/dashboard/DashboardPage';
import { Compass, User, LogOut, ShieldAlert, Sparkles, LayoutDashboard, Mail, ShieldCheck, X, Upload } from 'lucide-react';

function NavigationBar() {
  const { isAuthenticated, user, logout, cibil, setCibil, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/listings/upload', formData);
      if (res?.status === 'success') {
        const updateRes = await api.put('/auth/profile', {
          name: user.name,
          email: user.email,
          profileImage: res.url
        });
        if (updateRes?.status === 'success') {
          updateUser(updateRes.data);
          alert('🎉 Profile image updated successfully!');
        }
      }
    } catch (err) {
      alert(`Profile update failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <header className="bg-primary text-white border-b border-primary-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-accent-light transition-all flex items-center gap-1.5">
              <span className="text-accent text-3xl font-black">Asset</span>
              <span>Hop</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link to="/" className="text-sm font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-accent" />
                  Marketplace
                </Link>

                <Link to="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4 text-accent" />
                  Dashboard
                </Link>

                {/* CIBIL Score Trust Simulator widget in header */}
                <div className="bg-primary-light border border-gray-700/60 rounded-xl px-3 py-1.5 flex items-center gap-3">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Simulated CIBIL</p>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs font-bold">{cibil}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="900"
                    step="25"
                    value={cibil}
                    onChange={(e) => setCibil(parseInt(e.target.value))}
                    className="w-20 sm:w-24 accent-accent cursor-pointer h-1 bg-gray-700 rounded-lg appearance-none"
                  />
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    cibil >= 750 ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {cibil >= 750 ? 'Waiver' : 'Full Dep'}
                  </span>
                </div>
              </>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2.5 hover:opacity-90 transition-all focus:outline-none cursor-pointer group text-left"
                  title="View Profile"
                >
                  <div className="h-9 w-9 rounded-full bg-accent/25 hover:bg-accent/35 border border-accent/40 text-accent-light font-black flex items-center justify-center text-xs shadow-sm shadow-accent/15 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{user.name}</p>
                    <p className="text-[10px] text-accent font-bold group-hover:text-accent-light transition-colors uppercase tracking-wider">{user.role}</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 bg-primary-light hover:bg-accent/20 rounded-lg text-gray-300 hover:text-white transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-accent" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-accent/15"
              >
                Sign In
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-white text-primary rounded-3xl border border-gray-150 p-8 max-w-md w-full relative shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 border-b border-gray-100 pb-5">
              <div className="relative group">
                <div className="h-20 w-20 bg-gradient-to-tr from-accent to-accent-light text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-accent/15 border-2 border-white ring-4 ring-accent/10 overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                  )}
                </div>
                {/* Upload Hover Overlay */}
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 border-2 border-white">
                  <Upload className="h-4 w-4 mb-0.5" />
                  {isUploading ? 'Uploading...' : 'Change'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{user?.name}</h3>
                <span className="inline-flex mt-1 px-3 py-1 bg-accent/10 text-accent text-[10px] font-extrabold uppercase rounded-full tracking-widest">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-4 pt-1">
              {/* Email */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Simulated CIBIL */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                <Sparkles className="h-5 w-5 text-yellow-500 shrink-0 animate-pulse" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Simulated CIBIL Trust Score</p>
                  <p className="text-xs font-extrabold text-gray-700 mt-0.5">{cibil} / 900</p>
                </div>
              </div>

              {/* KYC Verification Status */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">KYC Status</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-extrabold rounded ${
                    cibil >= 750 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {cibil >= 750 ? 'VERIFIED (Tier 1 Trust)' : 'PENDING (Waiver Locked)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent/15 focus:outline-none"
              >
                Close Profile Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HomeRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.status === 'success' && res.data?.user) {
          login(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        // Do not force logout/clear store on network errors, only on actual 401/404 responses
        if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('not found'))) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgmain">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bgmain text-primary flex flex-col justify-between selection:bg-accent/30 selection:text-primary">
        <div>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/listing/:id" element={<ListingDetailsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>
        {!isAuthenticated && (
          <footer className="bg-primary text-gray-400 text-center py-6 border-t border-primary-dark text-xs font-semibold mt-12">
            &copy; {new Date().getFullYear()} AssetHop Rentals. Built for hyperlocal trust & lightning-fast handovers.
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;

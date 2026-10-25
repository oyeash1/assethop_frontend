import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './core/hooks/useAuth';
import { api } from './core/api/client';
import HomePage from './app/home/HomePage';
import LoginPage from './app/login/LoginPage';
import LandingPage from './app/landing/LandingPage';
import ListingDetailsPage from './app/listing/ListingDetailsPage';
import DashboardPage from './app/dashboard/DashboardPage';
import ProfilePage from './app/profile/ProfilePage';
import { Compass, User, LogOut, ShieldAlert, Sparkles, LayoutDashboard } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function NavigationBar() {
  const { isAuthenticated, user, logout, cibil, setCibil } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white text-slate-900 border-b border-rose-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 hover:opacity-90 transition-all flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-cherry-600 text-white flex items-center justify-center text-sm shadow-md shadow-cherry-600/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>Asset</span>
              <span className="text-cherry-600">Hop</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-cherry-600 transition-all flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-cherry-600" />
                  Marketplace
                </Link>

                <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-cherry-600 transition-all flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4 text-cherry-600" />
                  Dashboard
                </Link>

                {user?.role === 'SUPER_ADMIN' && (
                  <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="text-sm font-semibold text-cherry-700 hover:text-cherry-800 transition-all flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                    <ShieldAlert className="h-4 w-4 text-cherry-600" />
                    Admin Portal
                  </a>
                )}

                {/* CIBIL Score Trust Simulator widget in header */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl px-3 py-1.5 flex items-center gap-3">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulated CIBIL</p>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900">{cibil}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="900"
                    step="25"
                    value={cibil}
                    onChange={(e) => setCibil(parseInt(e.target.value))}
                    className="w-20 sm:w-24 accent-cherry-600 cursor-pointer h-1 bg-rose-200 rounded-lg appearance-none"
                  />
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    cibil >= 750 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {cibil >= 750 ? 'Waiver' : 'Full Dep'}
                  </span>
                </div>
              </>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-rose-200 pl-6">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2.5 hover:opacity-90 transition-all focus:outline-none cursor-pointer group text-left"
                  title="View Profile"
                >
                  <div className="h-9 w-9 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-300 text-cherry-700 font-black flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-cherry-600 transition-colors">{user.name}</p>
                    <p className="text-[10px] text-cherry-600 font-bold uppercase tracking-wider">{user.role}</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-slate-600 hover:text-cherry-600 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-cherry-600" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-cherry-600 hover:bg-cherry-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-cherry-600/20"
              >
                Sign In
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

function HomeRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-rose-100 selection:text-cherry-700">
      <div>
        {!isLandingPage && <NavigationBar />}
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/listing/:id" element={<ListingDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      {!isAuthenticated && !isLandingPage && (
        <footer className="bg-slate-900 text-gray-400 text-center py-6 border-t border-slate-800 text-xs font-semibold mt-12">
          &copy; {new Date().getFullYear()} AssetHop Rentals. Built for hyperlocal trust & lightning-fast handovers.
        </footer>
      )}
    </div>
  );
}

function App() {
  const { login, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cherry-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  );
}

export default App;

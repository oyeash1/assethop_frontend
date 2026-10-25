import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Shield, 
  ArrowRight, 
  Star, 
  Search, 
  User, 
  Calendar, 
  Package, 
  RefreshCw, 
  Camera, 
  Lock, 
  Headphones, 
  Coins, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Sliders,
  Menu,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Trust Simulator state
  const [demoCibil, setDemoCibil] = useState(780);

  const getWaiverPercentage = (score) => {
    if (score >= 750) return 100; // 100% waiver
    if (score >= 650) return 50;  // 50% waiver
    return 0;                     // 0% waiver (Full deposit)
  };

  const waiverPercent = getWaiverPercentage(demoCibil);
  const standardDeposit = 15000;
  const currentDeposit = Math.round(standardDeposit * (1 - waiverPercent / 100));

  // Category data matching the reference
  const categories = [
    {
      id: 'cameras',
      title: 'Cameras',
      image: '/images/cat_cameras.jpg',
      count: '140+ assets',
      desc: 'Cinema cameras, Sony Alpha, Canon R-series & prime lenses'
    },
    {
      id: 'drones',
      title: 'Drones',
      image: '/images/cat_drones.jpg',
      count: '85+ assets',
      desc: 'DJI Mavic 3 Pro, Mini 4 Pro, FPV & aerial rigs'
    },
    {
      id: 'laptops',
      title: 'Laptops',
      image: '/images/cat_laptops.jpg',
      count: '210+ assets',
      desc: 'Apple MacBook Pro M3, Razer Blade & workstations'
    },
    {
      id: 'gaming',
      title: 'Gaming Consoles',
      image: '/images/cat_gaming.jpg',
      count: '160+ assets',
      desc: 'PlayStation 5, Xbox Series X, VR headsets & controllers'
    },
    {
      id: 'audio',
      title: 'Audio Gear',
      image: '/images/cat_audio.jpg',
      count: '95+ assets',
      desc: 'Studio headphones, podcast microphones & PA systems'
    },
    {
      id: 'projectors',
      title: 'Projectors',
      image: '/images/cat_projectors.jpg',
      count: '70+ assets',
      desc: '4K laser home theater projectors & portable beamers'
    },
    {
      id: 'camping',
      title: 'Camping Gear',
      image: '/images/cat_camping.jpg',
      count: '120+ assets',
      desc: 'Geodesic tents, trekking rucksacks & outdoor stoves'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Rohan Mehta',
      role: 'Filmmaker',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      comment: 'Rented a Sony camera for my short film. Smooth process and the gear was in perfect condition. Highly recommended!'
    },
    {
      name: 'Sneha Kapoor',
      role: 'Content Creator',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      comment: 'The zero deposit thing is a game changer! Got my drone without any hassle. Will definitely use again.'
    },
    {
      name: 'Arjun Nair',
      role: 'College Student',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      comment: 'Rented a PS5 for the weekend. Super easy booking and great support. Loved it!'
    },
    {
      name: 'Meera Iyer',
      role: 'Event Planner',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      comment: 'Booked projectors for my college fest. Everything was on time and worked flawlessly. Great experience!'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen selection:bg-rose-100 selection:text-cherry-700 font-sans antialiased">
      
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR (White & Cherry Red)               */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center gap-1.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cherry-700 via-cherry-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-cherry-600/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  Asset<span className="text-cherry-600">Hop</span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#categories" className="hover:text-cherry-600 transition-colors">Explore Gear</a>
              <a href="#how-it-works" className="hover:text-cherry-600 transition-colors">How It Works</a>
              <a href="#for-hosts" className="hover:text-cherry-600 transition-colors">For Hosts</a>
              <a href="#safety" className="hover:text-cherry-600 transition-colors">Safety & Insurance</a>
              <a href="#about" className="hover:text-cherry-600 transition-colors">About</a>
            </nav>

            {/* Right Controls */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Search Icon */}
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="p-2.5 text-slate-600 hover:text-cherry-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Search Gear"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Profile Icon */}
              <button 
                onClick={() => navigate('/login')}
                className="p-2.5 text-slate-600 hover:text-cherry-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Login Link */}
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-slate-700 hover:text-cherry-600 px-3 py-2 transition-colors"
              >
                Login
              </button>

              {/* Get Started Pill Button */}
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-cherry-600 hover:bg-cherry-700 text-white text-sm font-bold rounded-full transition-all duration-300 shadow-md shadow-cherry-600/25 hover:shadow-lg hover:shadow-cherry-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-slate-700 hover:text-cherry-600"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-cherry-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-rose-100 px-4 pt-2 pb-6 space-y-3 shadow-xl">
            <a 
              href="#categories" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-cherry-600"
            >
              Explore Gear
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-cherry-600"
            >
              How It Works
            </a>
            <a 
              href="#for-hosts" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-cherry-600"
            >
              For Hosts
            </a>
            <a 
              href="#safety" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-cherry-600"
            >
              Safety & Insurance
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-cherry-600"
            >
              About
            </a>
            <div className="pt-4 border-t border-rose-100 flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2.5 border border-slate-200 text-slate-800 font-bold rounded-xl text-sm"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2.5 bg-cherry-600 text-white font-bold rounded-xl text-sm shadow-md shadow-cherry-600/30"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-rose-50/70 via-white to-white">
        {/* Soft Cherry Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-rose-200/40 via-cherry-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-cherry-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-cherry-700 text-xs font-bold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cherry-600 animate-pulse"></span>
                <span>The Zero-Deposit Rental Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Rent Premium Gear. <br />
                <span className="text-cherry-600">Zero Deposit</span> <br className="hidden sm:inline" />
                for Eligible Users.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Cameras, drones, consoles, laptops, audio gear and more — rented from verified people near you.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#categories"
                  className="px-8 py-3.5 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-cherry-600/30 hover:shadow-xl hover:shadow-cherry-600/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  Explore Gear
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 bg-white hover:bg-rose-50/60 text-slate-800 hover:text-cherry-700 border-2 border-slate-200 hover:border-cherry-300 font-bold rounded-full transition-all duration-300 shadow-sm text-sm"
                >
                  List Your Gear
                </button>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-8 border-t border-rose-100/80">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-none">4.9/5</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">from 12k+ rentals</p>
                    </div>
                  </div>

                  {/* Verified Hosts */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-cherry-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-cherry-600" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-none">Verified Hosts</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">KYC Checked</p>
                    </div>
                  </div>

                  {/* Secure Payments */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-cherry-600 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-cherry-600" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-none">Secure Payments</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Held Until Return</p>
                    </div>
                  </div>

                  {/* Damage Protection */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-cherry-600 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-cherry-600" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-none">Damage Protection</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Clear Policies</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Glow ring behind gear */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cherry-500/20 via-rose-300/30 to-amber-200/20 rounded-3xl blur-2xl -z-10" />

                {/* Hero Showcase Image */}
                <div className="relative rounded-3xl overflow-hidden border border-rose-100 shadow-2xl shadow-rose-950/10 group bg-white">
                  <img 
                    src="/images/hero_gear_showcase.jpg" 
                    alt="Rent Premium Gear - AssetHop" 
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle cherry gradient edge overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Handwritten Style Annotation badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-rose-100 shadow-lg text-slate-900 flex items-center gap-1.5 transform rotate-2">
                    <span className="font-handwriting text-base font-bold text-cherry-700">More Possibilities. Less Ownership.</span>
                    <span className="text-sm">👑</span>
                  </div>

                  {/* Floating Live Trust Approval Widget */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-rose-100 shadow-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cherry-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-cherry-600/30">
                      ₹0
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-black text-slate-900">Instant Zero-Deposit Approved</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Hyperlocal CIBIL Trust Underwriting</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. POPULAR CATEGORIES SECTION                            */}
      {/* ======================================================== */}
      <section id="categories" className="py-20 bg-white border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-cherry-700 text-xs font-extrabold uppercase tracking-wider mb-3">
                Popular Categories
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Find What You Need
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
                From creative shoots to epic gaming sessions — rent exactly what you need, when you need it.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="mt-4 md:mt-0 text-sm font-bold text-cherry-600 hover:text-cherry-700 flex items-center gap-1.5 transition-colors group"
            >
              View All Categories 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 7 Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="group relative bg-white rounded-2xl p-3 border border-rose-100/90 hover:border-cherry-300 shadow-sm hover:shadow-xl hover:shadow-cherry-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image */}
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-rose-50/50 flex items-center justify-center relative mb-3">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-cherry-600 transition-colors">
                    {cat.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-cherry-600 group-hover:text-cherry-700">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW ASSETHOP WORKS SECTION                            */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 bg-rose-50/40 border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-rose-200 text-cherry-700 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              Simple & Secure
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              How AssetHop Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Get the gear you need in just 3 easy steps.
            </p>
          </div>

          {/* 3 Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            
            {/* Step 01: Find */}
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-cherry-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Search className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 bg-rose-100 text-cherry-800 text-[11px] font-black rounded-full uppercase">
                Step 01
              </div>
              <h3 className="text-xl font-bold text-slate-900">Find</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse from 1000+ verified assets near you.
              </p>
            </div>

            {/* Step 02: Book */}
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-cherry-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 bg-rose-100 text-cherry-800 text-[11px] font-black rounded-full uppercase">
                Step 02
              </div>
              <h3 className="text-xl font-bold text-slate-900">Book</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your dates, complete verification and book securely.
              </p>
            </div>

            {/* Step 03: Use & Return */}
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-cherry-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Package className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 bg-rose-100 text-cherry-800 text-[11px] font-black rounded-full uppercase">
                Step 03
              </div>
              <h3 className="text-xl font-bold text-slate-900">Use & Return</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick up the asset, use it and return it on time.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. THE ZERO-DEPOSIT PROTOCOL                             */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-cherry-700 text-xs font-extrabold uppercase tracking-wider">
                Built For Trust
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                The Zero-Deposit Protocol
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Advanced verification. Smarter underwriting. Safer rentals.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setTrustModalOpen(true)}
                  className="px-6 py-3 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-full text-sm shadow-md shadow-cherry-600/25 transition-all flex items-center gap-2 w-fit"
                >
                  <Sliders className="w-4 h-4" />
                  Simulate CIBIL Waiver
                </button>

                <a
                  href="#how-it-works"
                  className="px-6 py-3 border border-slate-200 hover:border-cherry-300 text-slate-700 hover:text-cherry-600 font-bold rounded-full text-sm transition-all flex items-center gap-1.5 w-fit"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: 4 Cards (2x2 Grid) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Protocol 01 */}
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-cherry-300 shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-cherry-600 border border-rose-200 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-cherry-600">01</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">KYC Verification</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Identity & address verified in minutes.
                  </p>
                </div>

                {/* Protocol 02 */}
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-cherry-300 shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-cherry-600 border border-rose-200 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-cherry-600">02</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Smart Trust Check</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI-powered risk assessment & trust score.
                  </p>
                </div>

                {/* Protocol 03 */}
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-cherry-300 shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-cherry-600 border border-rose-200 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-cherry-600">03</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Secure Handover</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    OTP verification & digital agreement.
                  </p>
                </div>

                {/* Protocol 04 */}
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-cherry-300 shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-cherry-600 border border-rose-200 flex items-center justify-center font-bold">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-cherry-600">04</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Automatic Return & Refund</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Item verified — payment released.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. RENT WITHOUT THE STRESS (Safety & Priority)           */}
      {/* ======================================================== */}
      <section id="safety" className="py-20 bg-rose-50/40 border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: 5 Features */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-rose-200 text-cherry-700 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-sm">
                  Your Safety, Our Priority
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Rent Without the Stress
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                  We've got you covered, so you can focus on what matters.
                </p>
              </div>

              {/* 5 Feature Badges/Cards */}
              <div className="space-y-3 pt-2">
                
                {/* 1 */}
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3.5 hover:border-cherry-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Verified Hosts</h4>
                    <p className="text-xs text-slate-500">KYC & ID checked.</p>
                  </div>
                </div>

                {/* 2 */}
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3.5 hover:border-cherry-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Condition Photos</h4>
                    <p className="text-xs text-slate-500">Pre & post handover photos.</p>
                  </div>
                </div>

                {/* 3 */}
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3.5 hover:border-cherry-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Secure Payments</h4>
                    <p className="text-xs text-slate-500">Held until booking conditions are met.</p>
                  </div>
                </div>

                {/* 4 */}
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3.5 hover:border-cherry-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Damage Protection</h4>
                    <p className="text-xs text-slate-500">Clear policies for damage, theft & disputes.</p>
                  </div>
                </div>

                {/* 5 */}
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3.5 hover:border-cherry-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">24/7 Support</h4>
                    <p className="text-xs text-slate-500">We're here when you need us.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Smartphone Mockup with Handover Screen */}
            <div className="lg:col-span-6 flex justify-center relative">
              <div className="relative w-full max-w-sm">
                
                {/* Glowing Cherry Aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cherry-500/20 via-rose-300/30 to-amber-200/20 rounded-[40px] blur-2xl -z-10" />

                {/* Smartphone Container */}
                <div className="bg-slate-950 p-4 rounded-[42px] shadow-2xl border-4 border-slate-800 shadow-rose-950/20 text-white relative">
                  
                  {/* Speaker notch */}
                  <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-950" />
                  </div>

                  {/* Mobile Screen App UI */}
                  <div className="bg-slate-900 rounded-[30px] p-6 space-y-6 border border-slate-800 text-center">
                    
                    {/* Animated green check circle */}
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Booking Confirmed!</h3>
                      <p className="text-xs text-slate-400">Your gear is all set. Happy creating!</p>
                    </div>

                    {/* Rental Asset Mini Card */}
                    <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 text-left flex items-center gap-3">
                      <img 
                        src="/images/cat_cameras.jpg" 
                        alt="Sony A7 IV" 
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs font-bold text-white">Sony Alpha 7 IV</p>
                          <span className="text-[10px] text-cherry-400 font-extrabold">₹0 Dep</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Handover OTP: <strong className="text-emerald-400 tracking-wider">8492</strong></p>
                      </div>
                    </div>

                    {/* Live Handover Status */}
                    <div className="py-2 px-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      100% Identity & Damage Protected
                    </div>

                  </div>

                </div>

                {/* Floating Handwritten Style Sticker */}
                <div className="absolute -top-3 -right-3 bg-white px-3.5 py-1.5 rounded-2xl border border-rose-200 shadow-xl text-slate-900 flex items-center gap-1 transform rotate-6">
                  <span className="font-handwriting text-base font-bold text-cherry-600">Gear on the go!</span>
                  <span className="text-sm">👑</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FOR HOSTS BANNER                                      */}
      {/* ======================================================== */}
      <section id="for-hosts" className="py-20 bg-white border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white shadow-2xl border border-rose-900/40">
            
            {/* Background Studio Image with Cherry Overlay */}
            <div className="absolute inset-0 opacity-25 mix-blend-overlay">
              <img 
                src="/images/host_gear_table.jpg" 
                alt="Studio creator gear" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Side: Host Headline & CTA */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cherry-600/30 border border-cherry-400/40 text-cherry-300 text-xs font-bold uppercase tracking-wider">
                  For Hosts
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Your Gear Could Be Earning While You're Not Using It.
                </h2>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Camera sitting in your bag? Projector at home? Gaming console collecting dust? List it on AssetHop and earn from it.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3.5 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-cherry-600/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                  >
                    List Your Gear — Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Side: 3 Host Benefits */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Benefit 1 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cherry-600/30 border border-cherry-400/40 text-cherry-300 flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Earn Extra Income</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Set your own rates</p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cherry-600/30 border border-cherry-400/40 text-cherry-300 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Reach 1000+ Users</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Creators, gamers & more</p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cherry-600/30 border border-cherry-400/40 text-cherry-300 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Easy Management</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Track bookings & earnings</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. WHAT OUR USERS SAY (Testimonials)                     */}
      {/* ======================================================== */}
      <section className="py-20 bg-rose-50/40 border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-rose-200 text-cherry-700 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-sm">
                Real People, Real Rentals
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                What Our Users Say
              </h2>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="mt-4 md:mt-0 text-sm font-bold text-cherry-600 hover:text-cherry-700 flex items-center gap-1.5 transition-colors group"
            >
              View All Reviews
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 4 Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{item.comment}"
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-rose-100">
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-full object-cover border border-rose-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-cherry-600 font-semibold">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. PRE-FOOTER CTA BANNER ("More Gear. More Possibilities") */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden py-24 border-t border-rose-100">
        
        {/* Background Mountain Vista Image with Cherry Glow */}
        <div className="absolute inset-0 -z-10">
          <img 
            src="/images/cta_mountain_banner.jpg" 
            alt="More Possibilities" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-cherry-950/80 to-slate-950/80" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cherry-600/40 border border-cherry-400/50 text-white text-xs font-bold uppercase tracking-wider">
            Ready to get started?
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            More Gear. More Possibilities.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of creators, students and professionals already using AssetHop.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#categories"
              className="px-8 py-3.5 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-cherry-600/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
            >
              Explore Gear
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-full transition-all duration-300 text-sm backdrop-blur-md"
            >
              List Your Gear
            </button>
          </div>

          {/* Handwritten Annotation */}
          <div className="pt-4">
            <span className="font-handwriting text-xl text-rose-200">Same gear. Bigger dreams. ✨</span>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. COMPREHENSIVE FOOTER                                 */}
      {/* ======================================================== */}
      <footer id="about" className="bg-white border-t border-rose-200 pt-16 pb-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-rose-100">
            
            {/* Column 1: Brand & Tagline */}
            <div className="lg:col-span-1 space-y-4 text-left">
              <a href="#" className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-cherry-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-slate-900">Asset<span className="text-cherry-600">Hop</span></span>
              </a>

              <p className="text-xs text-slate-500 leading-relaxed">
                Rent premium gear. Zero deposit. More possibilities.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-rose-50 hover:bg-cherry-600 text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold" title="X">
                  𝕏
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-rose-50 hover:bg-cherry-600 text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold" title="Instagram">
                  IG
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-rose-50 hover:bg-cherry-600 text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold" title="YouTube">
                  YT
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-rose-50 hover:bg-cherry-600 text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold" title="LinkedIn">
                  IN
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-cherry-600 transition-colors">Home</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Explore Gear</a></li>
                <li><a href="#how-it-works" className="hover:text-cherry-600 transition-colors">How It Works</a></li>
                <li><a href="#for-hosts" className="hover:text-cherry-600 transition-colors">List Your Gear</a></li>
                <li><a href="#safety" className="hover:text-cherry-600 transition-colors">Safety & Insurance</a></li>
                <li><a href="#about" className="hover:text-cherry-600 transition-colors">About Us</a></li>
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Cameras</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Drones</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Laptops</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Gaming Consoles</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Audio Gear</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Projectors</a></li>
                <li><a href="#categories" className="hover:text-cherry-600 transition-colors">Camping Gear</a></li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-cherry-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-cherry-600 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-cherry-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cherry-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 5: Download Our App */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Download Our App</h4>
              <p className="text-xs text-slate-500">
                Get the best rental experience on your mobile.
              </p>
              
              <div className="space-y-2 pt-1">
                {/* App Store button */}
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-rose-300" />
                  <span>Download for iOS</span>
                </button>
                {/* Google Play button */}
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Get on Android</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; 2025 AssetHop. All rights reserved.</p>
            <p className="flex items-center gap-1 font-medium">
              Built for creators. Made for everyone. <span className="text-cherry-600">❤️</span>
            </p>
          </div>

        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL 1: SEARCH MODAL                                    */}
      {/* ======================================================== */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-rose-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-rose-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-cherry-600" />
                Search Rental Gear
              </h3>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="E.g., Sony A7 IV, DJI Drone, PS5, MacBook Pro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-200 focus:border-cherry-600 focus:bg-white rounded-2xl text-sm outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {['Sony Camera', 'DJI Mavic Drone', 'PS5 Console', 'Apple MacBook', '4K Projector'].map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-cherry-700 rounded-full font-semibold transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cherry-600/30"
                >
                  Search Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TRUST / CIBIL SIMULATOR MODAL                   */}
      {/* ======================================================== */}
      {trustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-100 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            
            <div className="flex justify-between items-center pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-cherry-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Trust Waiver Calculator</h3>
                  <p className="text-[10px] text-slate-400">Zero-Deposit Protocol Simulator</p>
                </div>
              </div>
              <button 
                onClick={() => setTrustModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slider */}
            <div className="space-y-3 bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-600">Simulate CIBIL Score</span>
                <span className="text-xl font-black text-cherry-600">{demoCibil}</span>
              </div>
              
              <input
                type="range"
                min="300"
                max="900"
                step="25"
                value={demoCibil}
                onChange={(e) => setDemoCibil(parseInt(e.target.value))}
                className="w-full accent-cherry-600 cursor-pointer h-2 bg-rose-200 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>300 (POOR)</span>
                <span>750+ (EXCELLENT)</span>
                <span>900</span>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Sample Asset Value</span>
                <span className="font-semibold text-slate-800">₹60,000 (Sony Camera)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Standard Security Deposit</span>
                <span className="font-semibold text-slate-400 line-through">₹{standardDeposit}</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Security Deposit</p>
                  <p className="text-2xl font-black text-cherry-600">₹{currentDeposit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trust Waiver</p>
                  <p className="text-sm font-extrabold text-emerald-600">{waiverPercent}% OFF</p>
                </div>
              </div>

              {waiverPercent === 100 ? (
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 justify-center bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  Awesome! You qualify for a 100% Deposit Waiver.
                </div>
              ) : waiverPercent === 50 ? (
                <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5 justify-center bg-amber-50 py-2 rounded-xl border border-amber-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                  Great! You qualify for a 50% Deposit Waiver.
                </div>
              ) : (
                <div className="text-xs text-rose-700 font-semibold flex items-center gap-1.5 justify-center bg-rose-50 py-2 rounded-xl border border-rose-200">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-cherry-600" />
                  Score under 650 requires standard security deposit.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setTrustModalOpen(false);
                navigate('/login');
              }}
              className="w-full py-3 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-cherry-600/30 transition-colors"
            >
              Sign In to Verify Your Score
            </button>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CATEGORY PREVIEW MODAL                          */}
      {/* ======================================================== */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-rose-100">
              <h3 className="font-extrabold text-slate-900 text-base">{selectedCategory.title}</h3>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-rose-50 border border-rose-100">
              <img 
                src={selectedCategory.image} 
                alt={selectedCategory.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-cherry-600">{selectedCategory.count}</p>
              <p className="text-xs text-slate-600">{selectedCategory.desc}</p>
            </div>

            <button
              onClick={() => {
                setSelectedCategory(null);
                navigate('/login');
              }}
              className="w-full py-3 bg-cherry-600 hover:bg-cherry-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-cherry-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore {selectedCategory.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

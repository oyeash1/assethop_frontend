import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  ArrowRight, 
  Laptop, 
  Car, 
  Shirt, 
  Shield, 
  CheckCircle,
  Truck,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoCibil, setDemoCibil] = useState(780);

  // Compute simulated deposit waiver percentage
  const getWaiverPercentage = (score) => {
    if (score >= 750) return 100; // 100% waiver
    if (score >= 650) return 50;  // 50% waiver
    return 0;                     // 0% waiver (Full deposit)
  };

  const waiverPercent = getWaiverPercentage(demoCibil);
  const standardDeposit = 15000;
  const currentDeposit = Math.round(standardDeposit * (1 - waiverPercent / 100));

  return (
    <div className="bg-bgmain min-h-screen text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent/40 text-white py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/30 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent-light/35 text-accent-light text-xs font-bold uppercase tracking-wider animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
              Revolutionizing Hyperlocal Rentals
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Rent Premium Assets. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-white">
                Zero Security Deposit.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
              AssetHop is the ultimate peer-to-peer rental network. Leverage your CIBIL score to waive high security deposits, find verified gear nearby, and experience seamless, OTP-secure handovers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/45 flex items-center justify-center gap-2 text-sm"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-bold rounded-xl transition-all duration-300 text-center text-sm backdrop-blur-sm"
              >
                How it Works
              </a>
            </div>

            {/* Quick stats badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md">
              <div>
                <p className="text-2xl font-black text-white">0%</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Deposit Options</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">OTP Protected</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">Live</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">GPS Handover</p>
              </div>
            </div>
          </div>

          {/* Hero right: Glassmorphic interactive widget */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent-light" />
                  <span className="font-bold text-sm tracking-wide">Trust Waiver Calculator</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-accent/30 text-accent-light rounded font-extrabold uppercase">Live Demo</span>
              </div>

              {/* Slider widget */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-300">Simulate CIBIL Score</span>
                  <span className="text-lg font-black text-accent-light">{demoCibil}</span>
                </div>
                
                <input
                  type="range"
                  min="300"
                  max="900"
                  step="25"
                  value={demoCibil}
                  onChange={(e) => setDemoCibil(parseInt(e.target.value))}
                  className="w-full accent-accent-light cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>300 (POOR)</span>
                  <span>750+ (EXCELLENT)</span>
                  <span>900</span>
                </div>
              </div>

              {/* Simulation Result */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Item Retail Value</span>
                  <span className="font-semibold">₹60,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Standard Security Deposit</span>
                  <span className="font-semibold text-gray-400 line-through">₹{standardDeposit}</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Your Security Deposit</p>
                    <p className="text-xl font-black text-white">₹{currentDeposit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Trust Waiver</p>
                    <p className="text-xs font-extrabold text-green-400">{waiverPercent}% OFF</p>
                  </div>
                </div>

                {waiverPercent === 100 ? (
                  <div className="text-xs text-green-400 font-semibold flex items-center gap-1.5 justify-center bg-green-950/30 py-1.5 rounded-lg border border-green-800/40">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Awesome! You qualify for a 100% Deposit Waiver.
                  </div>
                ) : waiverPercent === 50 ? (
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 justify-center bg-amber-950/30 py-1.5 rounded-lg border border-amber-800/40">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Great! You qualify for a 50% Deposit Waiver.
                  </div>
                ) : (
                  <div className="text-xs text-red-400 font-semibold flex items-center gap-1.5 justify-center bg-red-950/30 py-1.5 rounded-lg border border-red-800/40">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    Score under 650 requires standard security deposit.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase Section */}
      <section className="py-20 bg-white border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-primary">Discover Endless Possibilities</h2>
            <p className="text-sm text-gray-500">
              Rent high-value electronics, professional tools, stylish gear, and vehicles from trusted locals right in your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <div className="group bg-bgmain p-8 rounded-2xl border border-gray-200/60 hover:border-accent/40 shadow-sm hover:shadow-md transition-all duration-300 text-left space-y-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent w-fit group-hover:scale-110 transition-transform">
                <Laptop className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Electronics & Photography</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Need a 4K cinema camera, prime lenses, drone, or high-performance gaming laptop for the weekend? Find it instantly.
              </p>
              <div className="text-xs font-semibold text-accent flex items-center gap-1.5 pt-2">
                Browse DSLR, Laptops, Projectors <ArrowRight className="h-3 w-3" />
              </div>
            </div>

            {/* Category 2 */}
            <div className="group bg-bgmain p-8 rounded-2xl border border-gray-200/60 hover:border-accent/40 shadow-sm hover:shadow-md transition-all duration-300 text-left space-y-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent w-fit group-hover:scale-110 transition-transform">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Vehicles & Transport</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Rent cruiser bikes, electronic scooters, or camping vehicles for your upcoming outstation roadtrip with friends.
              </p>
              <div className="text-xs font-semibold text-accent flex items-center gap-1.5 pt-2">
                Browse Scooters, Motorcycles <ArrowRight className="h-3 w-3" />
              </div>
            </div>

            {/* Category 3 */}
            <div className="group bg-bgmain p-8 rounded-2xl border border-gray-200/60 hover:border-accent/40 shadow-sm hover:shadow-md transition-all duration-300 text-left space-y-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent w-fit group-hover:scale-110 transition-transform">
                <Shirt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Lifestyle & Travel</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Heading to a wedding or conference? Rent premium suits, designer clothing, trekking backpacks, and outdoor tents.
              </p>
              <div className="text-xs font-semibold text-accent flex items-center gap-1.5 pt-2">
                Browse Clothes, Tents, Accessories <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-bgmain border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-primary">How AssetHop Works</h2>
            <p className="text-sm text-gray-500">
              Four simple, secure checkpoints designed for absolute peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-center">
              <div className="w-10 h-10 bg-accent text-white font-extrabold flex items-center justify-center rounded-full mx-auto text-sm">
                1
              </div>
              <h4 className="font-bold text-primary text-sm">Browse Nearby</h4>
              <p className="text-xs text-gray-500">
                Search locally and filter items by category or distance on our interactive map.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-center">
              <div className="w-10 h-10 bg-accent text-white font-extrabold flex items-center justify-center rounded-full mx-auto text-sm">
                2
              </div>
              <h4 className="font-bold text-primary text-sm">Verify Trust Level</h4>
              <p className="text-xs text-gray-500">
                Connect your profile and simulate your CIBIL score to immediately unlock security deposit waivers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-center">
              <div className="w-10 h-10 bg-accent text-white font-extrabold flex items-center justify-center rounded-full mx-auto text-sm">
                3
              </div>
              <h4 className="font-bold text-primary text-sm">OTP Check-In</h4>
              <p className="text-xs text-gray-500">
                Meet the host and verify the handover using our cryptographically generated secure OTP codes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-center">
              <div className="w-10 h-10 bg-accent text-white font-extrabold flex items-center justify-center rounded-full mx-auto text-sm">
                4
              </div>
              <h4 className="font-bold text-primary text-sm">Live GPS Telemetry</h4>
              <p className="text-xs text-gray-500">
                Track delivery coordinates in real time directly from your user dashboard trip panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification CTA Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          <Shield className="h-16 w-16 text-accent-light mx-auto animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Ready to list your assets or start renting today?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Join thousands of hosts and renters building local peer-to-peer trust. List your idle assets to earn passive income, or search the marketplace for gear near you.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent/25 flex items-center gap-2 mx-auto text-sm"
            >
              Sign In or Register Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

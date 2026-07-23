// src/app/login/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { api } from '../../core/api/client';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, User as UserIcon, Shield, Eye, EyeOff, Phone } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); // USER, HOST, SUPER_ADMIN
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [suggestionFeedback, setSuggestionFeedback] = useState(false);

  // If already authenticated, go home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getPasswordValidationStates = (pass) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@$!%*?&#]/.test(pass)
    };
  };

  const validationStates = getPasswordValidationStates(password);
  const metCount = Object.values(validationStates).filter(Boolean).length;

  const handleSuggestPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&#';
    
    let generated = '';
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += special[Math.floor(Math.random() * special.length)];
    
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 14; i++) {
      generated += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(shuffled);
    setShowPassword(true);
    
    navigator.clipboard.writeText(shuffled)
      .then(() => {
        setSuggestionFeedback(true);
        setTimeout(() => setSuggestionFeedback(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy password:', err);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (phoneNumber.length !== 10) {
          throw new Error('Please enter a valid 10-digit phone number.');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error('Password does not meet the strength requirements.');
        }

        // Sign Up
        const response = await api.post('/auth/signup', { name, email, password, role, phoneNumber });
        login(response.data.user);
      } else {
        // Login
        const response = await api.post('/auth/login', { email, password });
        login(response.data.user);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-bgmain px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            {isSignUp ? 'Create your AssetHop account' : 'Welcome back to AssetHop'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            {isSignUp ? 'Join the premium hyperlocal rental network' : 'Sign in to access your dashboard and active rentals'}
          </p>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
              !isSignUp ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
              isSignUp ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                    placeholder="10-digit number"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {isSignUp && (
                  <div className="flex items-center gap-2">
                    {suggestionFeedback && (
                      <span className="text-[10px] text-emerald-600 font-medium animate-pulse">Suggested & Copied!</span>
                    )}
                    <button
                      type="button"
                      onClick={handleSuggestPassword}
                      className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors focus:outline-none"
                    >
                      Suggest Strong Password
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {isSignUp && password && (
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Strength:</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full transition-all duration-300 ${
                        metCount <= 2 ? 'bg-red-500 w-1/3' : metCount <= 4 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      metCount <= 2 ? 'text-red-500' : metCount <= 4 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div className={`flex items-center gap-1.5 ${validationStates.length ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className="text-sm font-bold">{validationStates.length ? '✓' : '○'}</span>
                      <span>Min 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${validationStates.uppercase ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className="text-sm font-bold">{validationStates.uppercase ? '✓' : '○'}</span>
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${validationStates.lowercase ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className="text-sm font-bold">{validationStates.lowercase ? '✓' : '○'}</span>
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${validationStates.number ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className="text-sm font-bold">{validationStates.number ? '✓' : '○'}</span>
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${validationStates.special ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className="text-sm font-bold">{validationStates.special ? '✓' : '○'}</span>
                      <span>Special (@$!%*?&#)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choose Role</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                      role === 'USER'
                        ? 'border-accent bg-accent/5 text-accent font-semibold'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="text-xs">Renter (User)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('HOST')}
                    className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                      role === 'HOST'
                        ? 'border-accent bg-accent/5 text-accent font-semibold'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">Owner (Host)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-all duration-200 shadow-md shadow-accent/20"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

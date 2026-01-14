import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check for session expired message
  useEffect(() => {
    const sessionExpired = searchParams.get('sessionExpired') === 'true' || sessionStorage.getItem('sessionExpired') === 'true';
    if (sessionExpired) {
      toast.error('Session expired. Please login again.', { duration: 5000 });
      sessionStorage.removeItem('sessionExpired');
      // Remove query param from URL
      if (searchParams.get('sessionExpired')) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('sessionExpired');
        navigate(`/login?${newParams.toString()}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please enter organization name, email, and password');
      return;
    }

    setLoading(true);

    try {
      await login(organizationName.trim(), email.trim(), password);
      // Navigate only on successful login
      navigate('/');
    } catch (error: any) {
      // Error message already shown in AuthContext
      // Don't navigate on error
      if (error?.isNetworkError) {
        toast.error('Cannot connect to backend server. Please make sure backend is running on http://localhost:4000');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim() || !email.trim() || !password.trim() || !newOrganizationName.trim()) {
      toast.error('Please fill in all required fields including organization name');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Organization name validation
    if (newOrganizationName.trim().length < 2) {
      toast.error('Organization name must be at least 2 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        email: email.trim(),
        password,
        name: name.trim(),
        organizationName: newOrganizationName.trim(),
      });
      
      // If register returns access_token, use it directly
      if (response.access_token) {
        // Store token and user
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success(`Organization "${newOrganizationName.trim()}" created successfully!`);
        navigate('/');
        // Reload to update auth context
        window.location.reload();
      } else {
        // Fallback: auto login after signup
        await login(newOrganizationName.trim(), email.trim(), password);
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      // Show specific error message
      const errorMessage = error?.message || error?.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(errorMessage);
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-800/30 to-blue-600/20"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(15, 76, 117, 0.5) 0%, transparent 50%),
                         radial-gradient(circle at 70% 70%, rgba(50, 130, 184, 0.4) 0%, transparent 50%)`
      }}></div>
      <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
        <div className="glass-effect rounded-3xl shadow-2xl p-10 border border-blue-400/40">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-2xl glow-effect transform hover:scale-110 transition-all duration-300 overflow-hidden">
              <img 
                src="/logo.svg" 
                alt="Inventory Logo" 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<span class="text-blue-50 text-5xl">📦</span>';
                }}
              />
            </div>
            <h2 className="text-5xl font-extrabold text-gradient mb-2 drop-shadow-lg">
              Inventory Hub
            </h2>
            <p className="mt-2 text-blue-100/95 font-bold text-lg">
              {isLogin ? 'Sign in to access your dashboard' : 'Create your account to get started'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 bg-blue-600/20 rounded-2xl p-1.5 border border-blue-400/30">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all duration-200 ${
                isLogin
                  ? 'gradient-accent text-blue-50 shadow-lg'
                  : 'text-blue-200/70 hover:text-blue-100 hover:bg-blue-600/20'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all duration-200 ${
                !isLogin
                  ? 'gradient-accent text-blue-50 shadow-lg'
                  : 'text-blue-200/70 hover:text-blue-100 hover:bg-blue-600/20'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-6" onSubmit={isLogin ? handleLogin : handleSignUp}>
            <div className="space-y-5">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-extrabold text-blue-100 mb-2 drop-shadow-md">
                  Organization Name {isLogin ? '*' : '(Required for Sign Up)'}
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  autoComplete="organization"
                  className="appearance-none relative block w-full px-5 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl placeholder-blue-200/70 text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all sm:text-sm font-bold shadow-lg"
                  placeholder={isLogin ? "Enter your organization name" : "Enter your organization name"}
                  value={isLogin ? organizationName : newOrganizationName}
                  onChange={(e) => isLogin ? setOrganizationName(e.target.value) : setNewOrganizationName(e.target.value)}
                />
                {isLogin && (
                  <p className="mt-1 text-xs text-blue-200/70 italic">Enter the exact organization name you registered with</p>
                )}
              </div>
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-extrabold text-blue-100 mb-2 drop-shadow-md">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none relative block w-full px-5 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl placeholder-blue-200/70 text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all sm:text-sm font-bold shadow-lg"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-extrabold text-blue-100 mb-2 drop-shadow-md">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-5 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl placeholder-blue-200/70 text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all sm:text-sm font-bold shadow-lg"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-extrabold text-blue-100 mb-2 drop-shadow-md">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  className="appearance-none relative block w-full px-5 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl placeholder-blue-200/70 text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all sm:text-sm font-bold shadow-lg"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-blue-50 gradient-accent hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect border border-blue-400/40"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign in' : 'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../api/axiosInstance';
import { setCredentials } from '../../store/authSlice';

type AuthMode = 'password' | 'otp' | 'forgot';

const Login = () => {
  const [mode, setMode] = useState<AuthMode>('password');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resetMessages = () => {
    setError('');
    setMessage('');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await api.post('/auth/send-login-otp', { email });
      setMessage('OTP sent to your email');
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) return handleSendLoginOtp();

    setLoading(true);
    resetMessages();
    try {
      const { data } = await api.post('/auth/login-otp', { email, otp });
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset OTP sent to your email');
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) return handleSendForgotOtp();

    setLoading(true);
    resetMessages();
    try {
      await api.post('/auth/reset-password', { email, otp, password: newPassword });
      setMessage('Password reset successful! Please login.');
      setMode('password');
      setPassword('');
      setNewPassword('');
      setOtp('');
      setOtpSent(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setOtpSent(false);
    setOtp('');
    resetMessages();
  };

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Gabha Studio Setup" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 to-zinc-950"></div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
              Gabha Studio
            </h1>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Elevate your art studio with our powerful CRM & CMS platform. Manage client leads, track expenses, and showcase your stunning statue designs effortlessly.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-emerald-400">
            <ShieldCheck size={20} />
            <span>Secure Access Gateway</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {mode === 'password' && 'Welcome Back'}
              {mode === 'otp' && 'OTP Login'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              {mode === 'password' && 'Enter your credentials to access your account'}
              {mode === 'otp' && 'Sign in securely without a password'}
              {mode === 'forgot' && 'We will send you an OTP to reset your password'}
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm backdrop-blur-md">{error}</div>}
          {message && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm backdrop-blur-md">{message}</div>}

          {/* Form Container */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl">
            
            {/* PASSWORD LOGIN MODE */}
            {mode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 transition-all"
                      placeholder="admin@gabhastudio.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-zinc-300">Password</label>
                    <button 
                      type="button" 
                      onClick={() => switchMode('forgot')}
                      className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20 mt-6"
                >
                  {loading ? 'Signing in...' : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
                </button>
              </form>
            )}

            {/* OTP LOGIN MODE */}
            {mode === 'otp' && (
              <form onSubmit={handleOtpLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={otpSent}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 transition-all disabled:opacity-50"
                      placeholder="admin@gabhastudio.com"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Enter OTP</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 py-3 transition-all tracking-[0.5em] font-mono text-lg"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20 mt-6"
                >
                  {loading ? 'Processing...' : otpSent ? 'Verify & Login' : 'Send Login OTP'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={otpSent}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 transition-all disabled:opacity-50"
                      placeholder="Enter your registered email"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Enter OTP</label>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 transition-all tracking-[0.5em] font-mono text-center text-lg"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-11 bg-zinc-950/50 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 transition-all"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20 mt-6"
                >
                  {loading ? 'Processing...' : otpSent ? 'Reset Password' : 'Send Reset OTP'}
                </button>
              </form>
            )}
          </div>

          {/* Toggle Buttons */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {mode === 'password' && (
              <button
                onClick={() => switchMode('otp')}
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Login via OTP instead
              </button>
            )}
            
            {mode !== 'password' && (
              <button
                onClick={() => switchMode('password')}
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Password Login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

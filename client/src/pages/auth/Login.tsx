import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      {/* Golden Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg p-8 sm:p-12 relative z-10 flex flex-col justify-center min-h-[600px]">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-amber-500/80 text-[10px] tracking-[0.4em] uppercase mb-4">The Collection</p>
          <h1 className="text-4xl font-light text-white tracking-widest uppercase leading-snug mb-8">
            Gabha Studio
          </h1>
          
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-8 bg-zinc-800"></div>
            <h2 className="mx-4 text-xs font-light text-amber-400 tracking-[0.2em] uppercase">
              {mode === 'password' && 'Studio Access'}
              {mode === 'otp' && 'Verify Identity'}
              {mode === 'forgot' && 'Key Recovery'}
            </h2>
            <div className="h-px w-8 bg-zinc-800"></div>
          </div>
          
          <p className="text-zinc-500 text-[10px] tracking-widest uppercase leading-relaxed">
            {mode === 'password' && 'Enter your credentials to enter the dashboard.'}
            {mode === 'otp' && 'Secure token access.'}
            {mode === 'forgot' && 'Authenticate to reset your secure key.'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-950/20 border border-red-900/50 text-red-400 text-[10px] text-center tracking-widest uppercase animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-8 p-4 bg-amber-950/20 border border-amber-900/50 text-amber-400 text-[10px] text-center tracking-widest uppercase animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* PASSWORD LOGIN MODE */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-sm transition-colors placeholder:text-zinc-700 text-center"
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-sm transition-colors placeholder:text-zinc-700 text-center"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="button" 
                  onClick={() => switchMode('forgot')}
                  className="text-[9px] text-zinc-500 hover:text-amber-400 uppercase tracking-[0.2em] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 text-[10px] tracking-[0.3em] uppercase font-medium text-black bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-300"
              >
                {loading ? 'Authenticating...' : 'Enter Studio'}
              </button>
            </form>
          )}

          {/* OTP LOGIN MODE */}
          {mode === 'otp' && (
            <form onSubmit={handleOtpLogin} className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={otpSent}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-sm transition-colors placeholder:text-zinc-700 text-center disabled:opacity-50"
                    placeholder="Email Address"
                  />
                </div>

                {otpSent && (
                  <div className="relative animate-in fade-in slide-in-from-top-4 duration-500">
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-xl tracking-[1em] text-center font-light transition-colors placeholder:text-zinc-800"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 text-[10px] tracking-[0.3em] uppercase font-medium text-black bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-300"
              >
                {loading ? 'Processing...' : otpSent ? 'Verify Token' : 'Request Token'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={otpSent}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-sm transition-colors placeholder:text-zinc-700 text-center disabled:opacity-50"
                    placeholder="Registered Email"
                  />
                </div>

                {otpSent && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-xl tracking-[1em] text-center font-light transition-colors placeholder:text-zinc-800"
                        placeholder="••••••"
                        maxLength={6}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full bg-transparent border-0 border-b border-zinc-800 text-white focus:border-amber-500 focus:ring-0 px-0 py-3 text-sm transition-colors placeholder:text-zinc-700 text-center"
                        placeholder="New Password"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 text-[10px] tracking-[0.3em] uppercase font-medium text-black bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-300"
              >
                {loading ? 'Processing...' : otpSent ? 'Confirm New Key' : 'Request Recovery'}
              </button>
            </form>
          )}
        </div>

        {/* Toggle Buttons Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col items-center gap-6">
          {mode === 'password' && (
            <button
              onClick={() => switchMode('otp')}
              className="text-[9px] text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
            >
              Authenticate via Token Instead
            </button>
          )}
          
          {mode !== 'password' && (
            <button
              onClick={() => switchMode('password')}
              className="text-[9px] text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center group"
            >
              <ArrowLeft className="h-3 w-3 mr-3 group-hover:-translate-x-1 transition-transform" />
              Return to Standard Access
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;

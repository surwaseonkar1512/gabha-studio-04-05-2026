import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { Key, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { setCredentials, logout } from '../../store/authSlice';
import api from '../../api/axiosInstance';
import type { RootState } from '../../store/store';
import toast, { Toaster } from 'react-hot-toast';

const ForceChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If no user is logged in, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If they do not need to change password, redirect to admin
  if (!user.mustChangePassword) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', { newPassword });
      toast.success('Password changed successfully! Welcoming you...');
      
      // Update credentials with the updated user data
      dispatch(setCredentials({ user: data, token }));
      
      // Redirect to admin dashboard after short timeout
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      <Toaster />
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Security Action Required</h2>
          <p className="text-zinc-400 text-sm text-center mt-2 px-4">
            This is your first login. Please choose a strong new password to activate your CRM account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Key size={18} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Key size={18} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-semibold rounded-xl py-3 text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Updating Password...' : 'Save & Proceed'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/60 flex justify-between items-center text-xs">
          <span className="text-zinc-500">Logged in as {user.email}</span>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Cancel & Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForceChangePassword;

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, Key, ShieldCheck, History, Upload, Save, RefreshCw } from 'lucide-react';
import { setUser } from '../../store/authSlice';
import api from '../../api/axiosInstance';
import type { RootState } from '../../store/store';
import toast, { Toaster } from 'react-hot-toast';
import ImageUpload from '../../components/cms/ImageUpload';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Profile fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Tab for Right Panel
  const [activeTab, setActiveTab] = useState<'permissions' | 'password' | 'history'>('permissions');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        phone,
        profileImage,
      });
      dispatch(setUser(data));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        phone,
        profileImage,
        currentPassword,
        newPassword,
      });
      dispatch(setUser(data));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Helper to check standard human-friendly permission label
  const getModulePermissionLabel = (moduleKey: string) => {
    const labels: Record<string, string> = {
      products: 'Products',
      categories: 'Categories',
      orders: 'Bookings & Orders',
      crm: 'CRM (Leads & Contacts)',
      quotations: 'Quotations',
      employees: 'Employee Management',
      reports: 'Reports & Analytics',
      cms: 'Website CMS',
      expenses: 'Expenses',
      dashboard: 'Dashboard View',
    };
    return labels[moduleKey] || moduleKey.toUpperCase();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto selection:bg-amber-500 selection:text-black">
      <Toaster />

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 transition-colors">
        <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-3xl font-extrabold shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 self-center md:self-auto">
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role}
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 text-xs font-medium text-zinc-400">
            {user.employeeId && (
              <span className="bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border dark:border-zinc-700">
                Employee ID: <strong className="text-gray-900 dark:text-white">{user.employeeId}</strong>
              </span>
            )}
            {user.department && (
              <span className="bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border dark:border-zinc-700">
                Dept: <strong className="text-gray-900 dark:text-white">{user.department}</strong>
              </span>
            )}
            {user.designation && (
              <span className="bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border dark:border-zinc-700">
                Title: <strong className="text-gray-900 dark:text-white">{user.designation}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Form */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm h-fit space-y-6 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-4 border-b dark:border-zinc-800">
            <User size={18} className="text-amber-500" />
            Personal Details
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <ImageUpload
                label="Profile Image"
                value={profileImage}
                onChange={setProfileImage}
                aspectRatio="aspect-square"
                placeholder="Upload Photo (JPG, PNG. Max 5MB)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {profileLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabbed Interactive Section */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col transition-colors overflow-hidden">
          {/* Tabs Nav */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 p-2 gap-2">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={16} />
              My Permissions
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              <Key size={16} />
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              <History size={16} />
              Login History
            </button>
          </div>

          {/* Tab Panel Contents */}
          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b dark:border-zinc-800">
                  <h4 className="font-bold text-gray-900 dark:text-white">Assigned Permissions Grid</h4>
                  <p className="text-xs text-zinc-400">
                    {user.role === 'SUPER_ADMIN' ? 'Full Administrator Access' : 'Custom Permission Gated'}
                  </p>
                </div>

                {user.role === 'SUPER_ADMIN' ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 text-sm font-medium">
                    As Super Admin, you possess unrestricted access to create, view, edit, delete, archive, assign, approve, and export records across all modules.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(user.permissions || {}).map((modKey) => {
                      const actions = user.permissions[modKey] || [];
                      return (
                        <div key={modKey} className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-900/30">
                          <h5 className="font-bold text-sm text-gray-950 dark:text-white mb-2">
                            {getModulePermissionLabel(modKey)}
                          </h5>
                          {actions.length === 0 ? (
                            <span className="text-xs text-zinc-500 italic">No access</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {actions.map((act) => (
                                <span key={act} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                                  {act}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <h4 className="font-bold text-gray-900 dark:text-white pb-3 border-b dark:border-zinc-800">
                  Update Password
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="•••••••• (Min 6 chars)"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-gray-950 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Key size={16} /> Save New Password
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white pb-3 border-b dark:border-zinc-800">
                  Recent Login Activity Audit
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">User Agent / Device</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50 text-xs">
                      {!user.loginActivity || user.loginActivity.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-zinc-500 italic">
                            No login logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        [...user.loginActivity]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((log, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-850/40 text-gray-700 dark:text-zinc-300">
                              <td className="py-3 px-4 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-amber-600 dark:text-amber-500">
                                {log.ipAddress || 'unknown'}
                              </td>
                              <td className="py-3 px-4 max-w-xs truncate" title={log.userAgent}>
                                {log.userAgent || 'unknown'}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

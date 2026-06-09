import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Layers, User, LogOut, Sun, Moon, Bell, Check, CheckCheck, UserPlus, Info, AlertCircle, Calendar, FileText, Copy, Image, Settings, Palette } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axiosInstance';
import type { RootState } from '../store/store';
import ConfirmModal from '../components/ui/ConfirmModal';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Auth state for initial if needed
  const { user } = useSelector((state: RootState) => state.auth);

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Logout Confirm Modal State
  const [logoutConfirmState, setLogoutConfirmState] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Connect to Socket.io server
    const socket = io('http://localhost:5000');

    socket.on('new_lead', (lead) => {
      // Optimistically add notification or refetch
      const newNotif: NotificationItem = {
        _id: Math.random().toString(36).substr(2, 9),
        title: 'New Lead Received!',
        message: `${lead.name} just sent an inquiry.`,
        type: 'lead',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Play audio notification
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio autoplay prevented by browser', e));
      } catch (e) {
        console.error('Failed to play audio', e);
      }

      toast.success(
        <div>
          <strong>New Lead Received!</strong>
          <br />
          {lead.name} just sent an inquiry.
        </div>,
        { duration: 5000, position: 'top-right' }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const crmItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Leads Pipeline', path: '/admin/crm', icon: <Users size={18} /> },
    { name: 'Quotation Masters', path: '/admin/quotation-masters', icon: <Copy size={18} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Calendar size={18} /> },
    { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={18} /> },
  ];

  const cmsItems = [
    { name: 'Banners', path: '/admin/cms/banners', icon: <Layers size={18} /> },
    { name: 'About Us', path: '/admin/cms/about', icon: <Info size={18} /> },
    { name: 'Gallery', path: '/admin/cms/gallery', icon: <Image size={18} /> },
    { name: 'Categories', path: '/admin/cms/categories', icon: <Palette size={18} /> },
    { name: 'Products', path: '/admin/cms/products', icon: <CreditCard size={18} /> },
    { name: 'Instagram Gallery', path: '/admin/cms/instagram', icon: <FileText size={18} /> },
    { name: 'Testimonials', path: '/admin/cms/testimonials', icon: <FileText size={18} /> },
    { name: 'Site Settings', path: '/admin/cms/settings', icon: <Settings size={18} /> },
  ];

  const mobileNavItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Leads', path: '/admin/crm', icon: <Users size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Calendar size={20} /> },
    { name: 'CMS Settings', path: '/admin/cms', icon: <Layers size={20} /> },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return <UserPlus size={18} className="text-blue-500" />;
      case 'alert': return <AlertCircle size={18} className="text-red-500" />;
      case 'task': return <Calendar size={18} className="text-amber-500" />;
      default: return <Info size={18} className="text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row transition-colors duration-200">
      <Toaster />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-zinc-900 dark:bg-zinc-900/50 dark:border-r dark:border-zinc-800 text-white fixed h-full shadow-2xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Gabha Studio
          </h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {/* CRM Section */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">CRM System</p>
            <div className="space-y-1">
              {crmItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg transition-colors group ${isActive
                      ? 'bg-amber-600/10 text-amber-500'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* CMS Section */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">CMS System</p>
            <div className="space-y-1">
              {cmsItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg transition-colors group ${isActive
                      ? 'bg-amber-600/10 text-amber-500'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-1 shrink-0">
          <button className="flex w-full items-center px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <User size={18} className="mr-3" />
            <span className="font-medium text-sm">Profile</span>
          </button>
          <button
            onClick={() => setLogoutConfirmState(true)}
            className="flex w-full items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-64 pb-16 md:pb-0 min-h-screen flex flex-col">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-colors duration-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 md:hidden">Gabha Studio</h2>
          <div className="flex-1"></div>

          <div className="flex items-center gap-2 md:gap-4">

            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`relative p-2 rounded-full transition-colors ${isDropdownOpen ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isDropdownOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-2 w-[320px] sm:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 font-medium flex items-center"
                      >
                        <CheckCheck size={14} className="mr-1" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">You have no new notifications.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={`p-4 flex gap-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${!notif.isRead ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-transparent'
                              }`}
                          >
                            <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 uppercase tracking-wider font-medium">
                                {getTimeAgo(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="flex-shrink-0 flex items-center">
                                <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-center">
                    <button className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                      View Notification History
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800 shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-around items-center h-16 z-50 px-2 pb-safe transition-colors duration-200">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT CONFIRM MODAL */}
      <ConfirmModal
        isOpen={logoutConfirmState}
        onClose={() => setLogoutConfirmState(false)}
        onConfirm={() => {
          setLogoutConfirmState(false);
          handleLogout();
        }}
        title="Sign Out"
        message="Are you sure you want to sign out of Gabha Studio CRM?"
        confirmText="Sign Out"
        type="warning"
      />
    </div>
  );
};

export default DashboardLayout;

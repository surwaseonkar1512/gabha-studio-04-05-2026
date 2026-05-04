import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Layers, User, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io('http://localhost:5000');

    socket.on('new_lead', (lead) => {
      setNotifications((prev) => prev + 1);
      
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
          <br/>
          {lead.name} just sent an inquiry.
        </div>, 
        { duration: 5000, position: 'top-right' }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'CRM', path: '/admin/crm', icon: <Users size={20} /> },
    { name: 'Expenses', path: '/admin/expenses', icon: <CreditCard size={20} /> },
    { name: 'CMS', path: '/admin/cms', icon: <Layers size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row transition-colors duration-200">
      <Toaster />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-zinc-900 dark:bg-zinc-900/50 dark:border-r dark:border-zinc-800 text-white fixed h-full shadow-2xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Gabha Studio
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-1">
          <button className="flex w-full items-center px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <User size={20} className="mr-3" />
            <span className="font-medium">Profile</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-64 pb-16 md:pb-0 min-h-screen flex flex-col">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 md:hidden">Gabha Studio</h2>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
              )}
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
              A
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-around items-center h-16 z-50 px-2 pb-safe transition-colors duration-200">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;

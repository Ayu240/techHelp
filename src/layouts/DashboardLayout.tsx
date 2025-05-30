import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, DollarSign, Stethoscope, Building2, File, User,
  BellRing, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabase } from '../contexts/SupabaseContext';
import type { Announcement } from '../lib/supabase';

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { supabase } = useSupabase();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setAnnouncements(data as Announcement[]);
        
        // Set unread count based on localStorage
        const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
        setUnreadCount(data.filter(a => !readAnnouncements.includes(a.id)).length);
      }
    };

    fetchAnnouncements();

    // Subscribe to new announcements
    const subscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'announcements' 
      }, (payload) => {
        setAnnouncements(prev => [payload.new as Announcement, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  const handleAnnouncementClick = () => {
    setShowAnnouncements(!showAnnouncements);
    
    if (!showAnnouncements && unreadCount > 0) {
      // Mark all as read
      const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
      const newReadAnnouncements = [
        ...readAnnouncements,
        ...announcements.map(a => a.id)
      ];
      localStorage.setItem('readAnnouncements', JSON.stringify([...new Set(newReadAnnouncements)]));
      setUnreadCount(0);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/finance', icon: <DollarSign className="w-5 h-5" />, label: 'Finance' },
    { path: '/health', icon: <Stethoscope className="w-5 h-5" />, label: 'Health' },
    { path: '/government', icon: <Building2 className="w-5 h-5" />, label: 'Government' },
    { path: '/documents', icon: <File className="w-5 h-5" />, label: 'Documents' },
    { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 ml-2 lg:ml-0">techHelp</span>
            </Link>
          </div>

          {/* User menu and notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleAnnouncementClick}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BellRing className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Announcements dropdown */}
              <AnimatePresence>
                {showAnnouncements && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1 divide-y divide-gray-100">
                      <div className="px-4 py-3">
                        <h3 className="text-sm font-medium text-gray-900">Announcements</h3>
                      </div>
                      {announcements.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No announcements at this time.
                        </div>
                      ) : (
                        announcements.map((announcement) => (
                          <div key={announcement.id} className="px-4 py-3">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                announcement.category === 'financial' ? 'bg-blue-100 text-blue-800' :
                                announcement.category === 'medical' ? 'bg-green-100 text-green-800' :
                                announcement.category === 'government' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {announcement.category}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="hidden sm:inline-block mr-2 text-sm font-medium text-gray-700">
                  {profile?.full_name || 'User'}
                </span>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
              </div>
              <button
                onClick={signOut}
                className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeMobileMenu} />
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={closeMobileMenu}
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <span className="text-2xl font-bold text-blue-600">techHelp</span>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {navLinks.map(({ path, icon, label }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                        onClick={closeMobileMenu}
                      >
                        {icon}
                        <span className="ml-3">{label}</span>
                        {path === location.pathname && (
                          <span className="ml-auto">
                            <ChevronRight className="w-5 h-5" />
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navLinks.map(({ path, icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {icon}
                    <span className="ml-3">{label}</span>
                    {path === location.pathname && (
                      <span className="ml-auto">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
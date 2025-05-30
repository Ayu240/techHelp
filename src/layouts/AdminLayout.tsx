import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LayoutDashboard, Users, FileText, Bell, BarChart, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/requests', icon: <FileText className="w-5 h-5" />, label: 'Requests' },
    { path: '/admin/announcements', icon: <Bell className="w-5 h-5" />, label: 'Announcements' },
    { path: '/admin/analytics', icon: <BarChart className="w-5 h-5" />, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="bg-indigo-600 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
            <Link to="/admin" className="flex items-center">
              <span className="text-2xl font-bold text-white ml-2 lg:ml-0">techHelp Admin</span>
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="hidden sm:inline-block mr-2 text-sm font-medium text-white">
                {profile?.full_name || 'Admin'}
              </span>
              <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white font-medium">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
            <button
              onClick={signOut}
              className="ml-4 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
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
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
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
                    <span className="text-2xl font-bold text-white">techHelp Admin</span>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {navLinks.map(({ path, icon, label }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive
                              ? 'bg-indigo-800 text-white'
                              : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                          }`
                        }
                        onClick={closeMobileMenu}
                      >
                        {icon}
                        <span className="ml-3">{label}</span>
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
          <div className="flex flex-col w-64 border-r border-indigo-800 bg-indigo-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navLinks.map(({ path, icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
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
            
            {/* Switch to user view */}
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <Link 
                to="/dashboard" 
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <div className="h-9 w-9 rounded bg-indigo-600 flex items-center justify-center text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      Switch to User View
                    </p>
                  </div>
                </div>
              </Link>
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
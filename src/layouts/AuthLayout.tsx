import { Outlet } from 'react-router-dom';
import { LogIn, HelpCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Right side - Colorful Background with Features */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 p-8 text-white">
        <div className="flex flex-col justify-center space-y-16 max-w-lg mx-auto">
          <div>
            <motion.h1 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              techHelp
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unified platform for all your essential services
            </motion.p>
          </div>

          <div className="space-y-8">
            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <LogIn className="w-8 h-8 text-blue-200 mt-1" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Single Access Point</h3>
                <p className="text-blue-100">Manage finance, healthcare, and government services from one dashboard</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <HelpCircle className="w-8 h-8 text-blue-200 mt-1" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Real-time Support</h3>
                <p className="text-blue-100">Get instant updates on your requests and submissions</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Shield className="w-8 h-8 text-blue-200 mt-1" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Secure & Reliable</h3>
                <p className="text-blue-100">Your data is protected with industry-standard security measures</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
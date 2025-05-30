import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, Stethoscope, Building2, Shield, Clock, Globe, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const features = [
    {
      icon: <DollarSign className="h-8 w-8 text-blue-500" />,
      title: "Financial Management",
      description: "Track expenses, manage budgets, and store financial documents securely in one place."
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-blue-500" />,
      title: "Healthcare Access",
      description: "Book appointments, manage medical records, and track health history for you and your family."
    },
    {
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      title: "Government Services",
      description: "Request certificates, submit applications, and track status of government requests."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Secure Storage",
      description: "Keep all your important documents safe with enterprise-grade security and encryption."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      title: "Real-time Updates",
      description: "Get instant notifications about your requests, appointments, and document statuses."
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Unified Dashboard",
      description: "Access all your essential services from a single, intuitive dashboard interface."
    }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">techHelp</span>
              </div>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <Link 
                to="/login" 
                className="btn btn-outline btn-md"
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary btn-md"
              >
                Get Started
              </Link>
            </div>
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a 
                href="#features" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </a>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="text-center">
                <motion.h1 
                  className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="block">Unified platform for</span>
                  <span className="block text-blue-200">essential services</span>
                </motion.h1>
                <motion.p 
                  className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Manage your finances, healthcare, and government services all in one place.
                  Secure, real-time, and accessible anywhere.
                </motion.p>
                <motion.div 
                  className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 md:py-4 md:text-lg md:px-10"
                    >
                      Sign in
                    </Link>
                  </div>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-blue-800 sm:h-72 md:h-96 lg:w-full lg:h-full opacity-50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need in one place
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              techHelp brings together essential services for a seamless experience
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="h-full rounded-lg border border-gray-200 bg-white px-6 py-8 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-white">
                        {feature.icon}
                      </div>
                      <h3 className="mt-5 text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">How it works</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Simple, intuitive, effective
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              techHelp is designed to make your life easier with a straightforward workflow
            </p>
          </div>

          <div className="mt-12">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Create an account</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Sign up with your email and password to get started with techHelp.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="mt-10 text-center lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Access services</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Use the unified dashboard to manage finances, healthcare, and government services.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="mt-10 text-center lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Track progress</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Monitor the status of your requests, documents, and appointments in real-time.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Create your account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <span className="text-xl font-bold text-blue-600">techHelp</span>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-500">
                &copy; 2025 techHelp. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
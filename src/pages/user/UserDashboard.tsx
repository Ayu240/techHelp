import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { motion } from 'framer-motion';
import { 
  DollarSign, Stethoscope, Building2, File, Clock, AlertCircle
} from 'lucide-react';
import type { 
  FinancialTransaction, 
  MedicalAppointment, 
  CertificateRequest, 
  Announcement 
} from '../../lib/supabase';

export default function UserDashboard() {
  const { profile } = useAuth();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<MedicalAppointment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<CertificateRequest[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from('financial_transactions')
          .select('*')
          .order('transaction_date', { ascending: false })
          .limit(3);
        
        if (transactions) {
          setRecentTransactions(transactions as FinancialTransaction[]);
        }

        // Fetch upcoming appointments
        const { data: appointments } = await supabase
          .from('medical_appointments')
          .select('*')
          .eq('status', 'pending')
          .order('appointment_date', { ascending: true })
          .limit(3);
        
        if (appointments) {
          setUpcomingAppointments(appointments as MedicalAppointment[]);
        }

        // Fetch pending certificate requests
        const { data: requests } = await supabase
          .from('certificate_requests')
          .select('*')
          .eq('status', 'pending')
          .order('requested_at', { ascending: false })
          .limit(3);
        
        if (requests) {
          setPendingRequests(requests as CertificateRequest[]);
        }

        // Fetch recent announcements
        const { data: announcements } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (announcements) {
          setRecentAnnouncements(announcements as Announcement[]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const serviceCards = [
    {
      title: 'Financial Services',
      icon: <DollarSign className="h-8 w-8 text-blue-500" />,
      description: 'Manage your finances, track expenses, and store financial documents.',
      color: 'bg-blue-50 border-blue-200',
      link: '/finance'
    },
    {
      title: 'Healthcare Services',
      icon: <Stethoscope className="h-8 w-8 text-emerald-500" />,
      description: 'Book appointments, manage medical records, and track health history.',
      color: 'bg-emerald-50 border-emerald-200',
      link: '/health'
    },
    {
      title: 'Government Services',
      icon: <Building2 className="h-8 w-8 text-indigo-500" />,
      description: 'Request certificates, submit applications, and track status.',
      color: 'bg-indigo-50 border-indigo-200',
      link: '/government'
    },
    {
      title: 'Document Management',
      icon: <File className="h-8 w-8 text-amber-500" />,
      description: 'Securely store and manage all your important documents in one place.',
      color: 'bg-amber-50 border-amber-200',
      link: '/documents'
    }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your activities and services
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {serviceCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link 
                to={card.link}
                className={`block h-full rounded-lg border ${card.color} p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Recent Financial Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <Link to="/finance" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.transaction_type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.category}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${
                      transaction.transaction_type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      ${transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No recent transactions</p>
                <Link 
                  to="/finance" 
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Add your first transaction
                </Link>
              </div>
            )}
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
              <Link to="/health" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Dr. {appointment.doctor_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="badge badge-primary">
                      {appointment.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No upcoming appointments</p>
                <Link 
                  to="/health" 
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Book an appointment
                </Link>
              </div>
            )}
          </motion.div>

          {/* Pending Certificate Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Certificate Requests</h2>
              <Link to="/government" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{request.certificate_type}</p>
                        <p className="text-xs text-gray-500">
                          Requested on {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="badge badge-warning">
                      {request.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No pending requests</p>
                <Link 
                  to="/government" 
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Request a certificate
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-8"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Announcements</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">{recentAnnouncements[0].title}</h3>
                  <p className="mt-2 text-sm text-blue-700">{recentAnnouncements[0].content}</p>
                  <p className="mt-1 text-xs text-blue-500">
                    Posted on {new Date(recentAnnouncements[0].created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
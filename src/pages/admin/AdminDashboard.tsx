import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { 
  Users, FileText, Bell, BarChart, ArrowUpRight,
  ArrowDownRight, Clock, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import type { 
  Profile, 
  CertificateRequest, 
  MedicalAppointment,
  FinancialTransaction 
} from '../../lib/supabase';

export default function AdminDashboard() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    totalAppointments: 0,
    totalTransactions: 0,
    pendingRequests: 0,
    pendingAppointments: 0,
    recentUsers: [] as Profile[],
    recentRequests: [] as CertificateRequest[],
    dailyStats: {
      labels: [] as string[],
      requests: [] as number[],
      appointments: [] as number[],
      transactions: [] as number[],
    },
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('admin_dashboard')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public'
      }, () => {
        fetchDashboardData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch total counts
      const [
        { count: userCount },
        { count: requestCount },
        { count: appointmentCount },
        { count: transactionCount },
        { count: pendingRequestCount },
        { count: pendingAppointmentCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('certificate_requests').select('*', { count: 'exact' }),
        supabase.from('medical_appointments').select('*', { count: 'exact' }),
        supabase.from('financial_transactions').select('*', { count: 'exact' }),
        supabase.from('certificate_requests').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('medical_appointments').select('*', { count: 'exact' }).eq('status', 'pending'),
      ]);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent requests
      const { data: recentRequests } = await supabase
        .from('certificate_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(5);

      // Fetch daily stats for the last 7 days
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyStats = await Promise.all(dates.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [
          { count: requestCount },
          { count: appointmentCount },
          { count: transactionCount },
        ] = await Promise.all([
          supabase
            .from('certificate_requests')
            .select('*', { count: 'exact' })
            .gte('requested_at', date)
            .lt('requested_at', nextDate.toISOString()),
          supabase
            .from('medical_appointments')
            .select('*', { count: 'exact' })
            .gte('created_at', date)
            .lt('created_at', nextDate.toISOString()),
          supabase
            .from('financial_transactions')
            .select('*', { count: 'exact' })
            .gte('created_at', date)
            .lt('created_at', nextDate.toISOString()),
        ]);

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          requests: requestCount || 0,
          appointments: appointmentCount || 0,
          transactions: transactionCount || 0,
        };
      }));

      setStats({
        totalUsers: userCount || 0,
        totalRequests: requestCount || 0,
        totalAppointments: appointmentCount || 0,
        totalTransactions: transactionCount || 0,
        pendingRequests: pendingRequestCount || 0,
        pendingAppointments: pendingAppointmentCount || 0,
        recentUsers: recentUsers as Profile[],
        recentRequests: recentRequests as CertificateRequest[],
        dailyStats: {
          labels: dailyStats.map(stat => stat.date),
          requests: dailyStats.map(stat => stat.requests),
          appointments: dailyStats.map(stat => stat.appointments),
          transactions: dailyStats.map(stat => stat.transactions),
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: stats.dailyStats.labels,
    datasets: [
      {
        label: 'Certificate Requests',
        data: stats.dailyStats.requests,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Medical Appointments',
        data: stats.dailyStats.appointments,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Financial Transactions',
        data: stats.dailyStats.transactions,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Daily Activity Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of platform activity and statistics
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pendingRequests}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Appointments
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pendingAppointments}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Transactions
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalTransactions}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white shadow rounded-lg"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentUsers.map((user) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Recent Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white shadow rounded-lg"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentRequests.map((request) => (
                    <li key={request.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            request.status === 'approved' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <AlertCircle className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.certificate_type}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Requested {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
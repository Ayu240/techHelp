import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { 
  BarChart, PieChart, LineChart, TrendingUp, TrendingDown,
  DollarSign, Users, FileText, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import type { 
  Profile, 
  CertificateRequest, 
  MedicalAppointment,
  FinancialTransaction 
} from '../../lib/supabase';

export default function AdminAnalytics() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    userGrowth: [] as { date: string; count: number }[],
    requestDistribution: [] as { category: string; count: number }[],
    transactionVolume: [] as { date: string; income: number; expense: number }[],
    appointmentStatus: [] as { status: string; count: number }[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      // Fetch user growth
      const userGrowth = await Promise.all(dates.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .lte('created_at', nextDate.toISOString());

        return { date, count: count || 0 };
      }));

      // Fetch request distribution
      const { data: requests } = await supabase
        .from('certificate_requests')
        .select('certificate_type');

      const requestCounts = requests?.reduce((acc: any, req) => {
        acc[req.certificate_type] = (acc[req.certificate_type] || 0) + 1;
        return acc;
      }, {});

      const requestDistribution = Object.entries(requestCounts || {}).map(([category, count]) => ({
        category,
        count: count as number,
      }));

      // Fetch transaction volume
      const transactionVolume = await Promise.all(dates.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [{ data: income }, { data: expense }] = await Promise.all([
          supabase
            .from('financial_transactions')
            .select('amount')
            .eq('transaction_type', 'income')
            .gte('transaction_date', date)
            .lt('transaction_date', nextDate.toISOString()),
          supabase
            .from('financial_transactions')
            .select('amount')
            .eq('transaction_type', 'expense')
            .gte('transaction_date', date)
            .lt('transaction_date', nextDate.toISOString()),
        ]);

        return {
          date,
          income: income?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
          expense: expense?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        };
      }));

      // Fetch appointment status distribution
      const { data: appointments } = await supabase
        .from('medical_appointments')
        .select('status');

      const appointmentCounts = appointments?.reduce((acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      const appointmentStatus = Object.entries(appointmentCounts || {}).map(([status, count]) => ({
        status,
        count: count as number,
      }));

      setStats({
        userGrowth,
        requestDistribution,
        transactionVolume,
        appointmentStatus,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart configurations
  const userGrowthChart = {
    labels: stats.userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Total Users',
        data: stats.userGrowth.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const requestDistributionChart = {
    labels: stats.requestDistribution.map(item => item.category),
    datasets: [
      {
        data: stats.requestDistribution.map(item => item.count),
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
      },
    ],
  };

  const transactionVolumeChart = {
    labels: stats.transactionVolume.map(item => item.date),
    datasets: [
      {
        label: 'Income',
        data: stats.transactionVolume.map(item => item.income),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: stats.transactionVolume.map(item => item.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const appointmentStatusChart = {
    labels: stats.appointmentStatus.map(item => item.status),
    datasets: [
      {
        data: stats.appointmentStatus.map(item => item.count),
        backgroundColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Detailed insights and statistics about platform usage
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input py-1 px-3 h-9"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.userGrowth[stats.userGrowth.length - 1]?.count || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.requestDistribution.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Transaction Volume</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${stats.transactionVolume.reduce((sum, item) => sum + item.income + item.expense, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.appointmentStatus.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
            <div className="h-80">
              <Line data={userGrowthChart} options={chartOptions} />
            </div>
          </motion.div>

          {/* Request Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Distribution</h3>
            <div className="h-80">
              <Pie data={requestDistributionChart} options={chartOptions} />
            </div>
          </motion.div>

          {/* Transaction Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Volume</h3>
            <div className="h-80">
              <Line data={transactionVolumeChart} options={chartOptions} />
            </div>
          </motion.div>

          {/* Appointment Status Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Status</h3>
            <div className="h-80">
              <Pie data={appointmentStatusChart} options={chartOptions} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
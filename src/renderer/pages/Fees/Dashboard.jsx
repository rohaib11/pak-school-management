import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  CogIcon,
  PrinterIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function FeesDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    pendingFees: 0,
    completionRate: 0,
    outstandingBalance: 0
  })
  const [currentTerm, setCurrentTerm] = useState('Spring 2023')
  const [activeFilter, setActiveFilter] = useState('all')

  // Simulate loading data from IndexedDB/SQLite
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock data - replace with actual data fetching
      setStats({
        totalStudents: 425,
        totalCollected: 1875000,
        pendingFees: 87,
        completionRate: 79.5,
        outstandingBalance: 462000
      })
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Chart data
  const monthlyCollectionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fee Collection (PKR)',
        data: [320000, 450000, 280000, 510000, 410000, 390000],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  }

  const paymentStatusData = {
    labels: ['Paid', 'Unpaid', 'Overdue'],
    datasets: [
      {
        data: [79, 15, 6],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }
    ]
  }

  const classDistributionData = {
    labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    datasets: [
      {
        label: 'Average Fee Collected',
        data: [4500, 5200, 4800, 5500, 5000],
        backgroundColor: '#8b5cf6'
      }
    ]
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees Dashboard</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Current Term: <span className="text-blue-600 dark:text-blue-400">{currentTerm}</span>
          </span>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
          </select>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Students */}
        <StatCard
          loading={loading}
          icon={<UserGroupIcon className="h-6 w-6 text-blue-500" />}
          title="Total Students"
          value={stats.totalStudents}
          change={4.5}
          isIncrease={true}
          darkBg="bg-gray-800"
        />

        {/* Total Collected */}
        <StatCard
          loading={loading}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500" />}
          title="Total Collected"
          value={formatCurrency(stats.totalCollected)}
          change={12.3}
          isIncrease={true}
          darkBg="bg-gray-800"
        />

        {/* Pending Fees */}
        <StatCard
          loading={loading}
          icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
          title="Pending Fees"
          value={stats.pendingFees}
          change={8.2}
          isIncrease={false}
          darkBg="bg-gray-800"
        />

        {/* Completion Rate */}
        <StatCard
          loading={loading}
          icon={<CheckCircleIcon className="h-6 w-6 text-emerald-500" />}
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change={3.1}
          isIncrease={true}
          darkBg="bg-gray-800"
        />

        {/* Outstanding Balance */}
        <StatCard
          loading={loading}
          icon={<ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
          title="Outstanding Balance"
          value={formatCurrency(stats.outstandingBalance)}
          change={5.7}
          isIncrease={false}
          darkBg="bg-gray-800"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Collection */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Collection</h3>
            <select className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64">
            <Bar 
              data={monthlyCollectionData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#6b7280'
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#6b7280'
                    }
                  },
                  y: {
                    grid: {
                      color: '#e5e7eb'
                    },
                    ticks: {
                      color: '#6b7280'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Payment Status */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Status</h3>
          <div className="flex flex-col items-center h-64">
            <div className="w-48 h-48">
              <Doughnut 
                data={paymentStatusData} 
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#6b7280'
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {paymentStatusData.labels.map((label, index) => (
                <div key={label}>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                  <div className="font-medium" style={{ color: paymentStatusData.datasets[0].backgroundColor[index] }}>
                    {paymentStatusData.datasets[0].data[index]}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fee Distribution by Class</h3>
            <select className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1">
              <option>Average Collected</option>
              <option>Total Collected</option>
            </select>
          </div>
          <div className="h-64">
            <Bar 
              data={classDistributionData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#6b7280'
                    }
                  },
                  y: {
                    grid: {
                      color: '#e5e7eb'
                    },
                    ticks: {
                      color: '#6b7280'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ActionCard 
          icon={<PlusIcon className="h-8 w-8" />}
          title="Assign Fee"
          description="Create new fee assignments"
          link="/app/fees/assign"
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        />
        <ActionCard 
          icon={<CogIcon className="h-8 w-8" />}
          title="Manage Categories"
          description="Configure fee types"
          link="/app/fees/categories"
          color="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
        />
        <ActionCard 
          icon={<ChartBarIcon className="h-8 w-8" />}
          title="View Reports"
          description="Generate detailed reports"
          link="/app/fees/reports"
          color="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
        />
        <ActionCard 
          icon={<PrinterIcon className="h-8 w-8" />}
          title="Print Receipts"
          description="Generate payment receipts"
          link="/app/fees/receipts"
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
        />
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ loading, icon, title, value, change, isIncrease, darkBg }) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:${darkBg} p-4 shadow-sm`}>
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-opacity-20 bg-gray-200 dark:bg-gray-700">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
      </div>
      {!loading && (
        <div className={`mt-4 flex items-center text-sm ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isIncrease ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span className="ml-1">{change}% from last term</span>
        </div>
      )}
    </div>
  )
}

// Action Card Component
function ActionCard({ icon, title, description, link, color }) {
  return (
    <Link
      to={link}
      className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all hover:shadow-md ${color}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-white dark:bg-gray-800 mb-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm opacity-80 mt-1">{description}</p>
      </div>
    </Link>
  )
}
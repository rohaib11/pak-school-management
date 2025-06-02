import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { AcademicCapIcon, UserGroupIcon, BookOpenIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'
import QuickActions from '../components/QuickActions' // ⬅️ Add this
import RecentActivity from '../components/RecentActivity'
import TodaysSummary from '../components/TodaysSummary'
import TopStudents from '../components/TopStudents'
import UpcomingEvents from '../components/UpcomingEvents'
import Notifications from '../components/Notifications'
import BirthdayHighlights from '../components/BirthdayHighlights'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const stats = [
  { id: 1, name: 'Total Students', value: '2,345', icon: UserGroupIcon, change: '+12%', changeType: 'positive' },
  { id: 2, name: 'Total Teachers', value: '45', icon: AcademicCapIcon, change: '+5%', changeType: 'positive' },
  { id: 3, name: 'Total Classes', value: '18', icon: BookOpenIcon, change: '+2', changeType: 'neutral' },
  { id: 4, name: 'Total Revenue', value: 'PKR 1,234,567', icon: CurrencyRupeeIcon, change: '+18%', changeType: 'positive' },
]

const attendanceData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  datasets: [
    {
      label: 'Present',
      data: [85, 90, 87, 92, 88, 80],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    },
    {
      label: 'Absent',
      data: [15, 10, 13, 8, 12, 20],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
    },
  ],
}

const performanceData = {
  labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7'],
  datasets: [
    {
      label: 'Average Score',
      data: [75, 82, 78, 85, 80, 88, 83],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
    },
  ],
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
           className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
        <QuickActions />   
        <TodaysSummary />
        
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>

                  <div className="ml-4">
                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                      <p
                        className={`ml-2 text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Attendance Overview</h2>
              <div className="h-64">
                <Bar
                  data={attendanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Class Performance</h2>
              <div className="h-64">
                <Bar
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          <RecentActivity />
          <UpcomingEvents />
          
          <Notifications />

          {/* 👇 Place TopStudents here */}
    <TopStudents />
        <BirthdayHighlights />

        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Student Distribution</h2>
            <div className="h-64">
              <Pie
                data={{
                  labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7'],
                  datasets: [
                    {
                      data: [120, 150, 180, 200, 220, 240, 260],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Fee Collection</h2>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [
                    {
                      label: 'Fee Collected',
                      data: [450000, 480000, 520000, 500000, 550000, 600000, 580000, 620000, 650000, 680000, 700000, 750000],
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    },
                    {
                      label: 'Fee Pending',
                      data: [50000, 40000, 45000, 55000, 40000, 30000, 35000, 25000, 20000, 15000, 10000, 5000],
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
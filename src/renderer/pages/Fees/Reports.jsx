import { useState, useEffect } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PrinterIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    studentId: '',
    classId: '',
    categoryId: '',
    paymentMethod: '',
    status: ''
  })

  // Mock data - replace with actual data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        setTimeout(() => {
          // Mock students
          setStudents([
            { id: 'stu-001', name: 'Ali Khan', classId: 'class-5' },
            { id: 'stu-002', name: 'Sara Ahmed', classId: 'class-4' }
          ])

          // Mock classes
          setClasses([
            { id: 'class-4', name: 'Class 4' },
            { id: 'class-5', name: 'Class 5' }
          ])

          // Mock categories
          setCategories([
            { id: 'cat-001', name: 'Tuition Fee' },
            { id: 'cat-002', name: 'Transport Fee' }
          ])

          // Mock report data
          setReportData([
            {
              id: 'fa-001',
              studentId: 'stu-001',
              studentName: 'Ali Khan',
              classId: 'class-5',
              className: 'Class 5',
              categoryId: 'cat-001',
              categoryName: 'Tuition Fee',
              assignedAmount: 5000,
              paidAmount: 2000,
              dueDate: '2023-06-15',
              paymentMethod: 'Cash',
              status: 'Partial'
            },
            {
              id: 'fa-002',
              studentId: 'stu-001',
              studentName: 'Ali Khan',
              classId: 'class-5',
              className: 'Class 5',
              categoryId: 'cat-002',
              categoryName: 'Transport Fee',
              assignedAmount: 3000,
              paidAmount: 3000,
              dueDate: '2023-06-10',
              paymentMethod: 'Bank Transfer',
              status: 'Paid'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        toast.error('Failed to load report data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate summary stats
  const summaryStats = {
    totalAssigned: reportData.reduce((sum, item) => sum + item.assignedAmount, 0),
    totalPaid: reportData.reduce((sum, item) => sum + item.paidAmount, 0),
    totalPending: reportData.reduce((sum, item) => sum + (item.assignedAmount - item.paidAmount), 0),
    totalDiscounts: 30000, // Mock value
    last30Days: 250000 // Mock value
  }

  // Filter data based on filters
  const filteredData = reportData.filter(item => {
    if (filters.dateFrom && item.dueDate < filters.dateFrom) return false
    if (filters.dateTo && item.dueDate > filters.dateTo) return false
    if (filters.studentId && item.studentId !== filters.studentId) return false
    if (filters.classId && item.classId !== filters.classId) return false
    if (filters.categoryId && item.categoryId !== filters.categoryId) return false
    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })

  // Chart data
  const categoryDistributionData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Amount Collected (PKR)',
        data: categories.map(cat => 
          filteredData
            .filter(item => item.categoryId === cat.id)
            .reduce((sum, item) => sum + item.paidAmount, 0)
        ),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899'
        ]
      }
    ]
  }

  const paymentStatusData = {
    labels: ['Paid', 'Partial', 'Unpaid'],
    datasets: [
      {
        data: [
          filteredData.filter(item => item.status === 'Paid').length,
          filteredData.filter(item => item.status === 'Partial').length,
          filteredData.filter(item => item.status === 'Unpaid').length
        ],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ]
      }
    ]
  }

  // Export functions
  const exportToCSV = () => {
    const csvData = filteredData.map(item => ({
      'Student Name': item.studentName,
      'Class': item.className,
      'Fee Type': item.categoryName,
      'Assigned (PKR)': item.assignedAmount,
      'Paid (PKR)': item.paidAmount,
      'Pending (PKR)': item.assignedAmount - item.paidAmount,
      'Due Date': item.dueDate,
      'Status': item.status,
      'Payment Method': item.paymentMethod
    }))

    const csv = XLSX.utils.json_to_sheet(csvData)
    const csvOutput = XLSX.utils.sheet_to_csv(csv)
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `fee_report_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('CSV exported successfully!')
  }

  const exportToExcel = () => {
    const excelData = filteredData.map(item => ({
      'Student Name': item.studentName,
      'Class': item.className,
      'Fee Type': item.categoryName,
      'Assigned (PKR)': item.assignedAmount,
      'Paid (PKR)': item.paidAmount,
      'Pending (PKR)': item.assignedAmount - item.paidAmount,
      'Due Date': item.dueDate,
      'Status': item.status,
      'Payment Method': item.paymentMethod
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Report')
    XLSX.writeFile(wb, `fee_report_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Excel exported successfully!')
  }

  const exportToPDF = () => {
    // In a real app, you would use a PDF generation library like jsPDF
    toast('PDF export would be implemented here', { icon: '📄' })
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Reports</h1>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
            CSV
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <TableCellsIcon className="-ml-1 mr-2 h-5 w-5" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <PrinterIcon className="-ml-1 mr-2 h-5 w-5" />
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.studentId}
                onChange={(e) => setFilters({...filters, studentId: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({...filters, classId: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assigned</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(summaryStats.totalAssigned)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</h3>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(summaryStats.totalPaid)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pending</h3>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(summaryStats.totalPending)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Discounts</h3>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(summaryStats.totalDiscounts)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last 30 Days</h3>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(summaryStats.last30Days)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Collection by Category</h3>
          <div className="h-64">
            <Bar 
              data={categoryDistributionData} 
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Status</h3>
          <div className="h-64">
            <Pie 
              data={paymentStatusData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
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
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">No records found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or add new fee assignments
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pending
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.assignedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {formatCurrency(item.assignedAmount - item.paidAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'Paid' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircleIcon className="mr-1 h-3 w-3" />
                          Paid
                        </span>
                      ) : item.status === 'Partial' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          Partial
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircleIcon className="mr-1 h-3 w-3" />
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
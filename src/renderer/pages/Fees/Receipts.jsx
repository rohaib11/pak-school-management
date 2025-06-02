import { useState, useEffect } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PrinterIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [students, setStudents] = useState([])
  const [unpaidFees, setUnpaidFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewReceiptModal, setShowNewReceiptModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [filters, setFilters] = useState({
    student: '',
    dateFrom: '',
    dateTo: '',
    feeType: ''
  })

  // New receipt form state
  const [newReceipt, setNewReceipt] = useState({
    studentId: '',
    feeAssignmentId: '',
    amountPaid: '',
    paymentMethod: 'Cash',
    referenceNo: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Load data (mock - replace with actual Electron IPC calls)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        setTimeout(() => {
          // Mock students
          setStudents([
            { id: 'stu-001', name: 'Ali Khan', class: 'Class 5', admissionNo: '2023-001' },
            { id: 'stu-002', name: 'Sara Ahmed', class: 'Class 4', admissionNo: '2023-002' }
          ])

          // Mock unpaid fees
          setUnpaidFees([
            { 
              id: 'assign-001', 
              studentId: 'stu-001', 
              feeName: 'Tuition Fee', 
              totalAmount: 5000, 
              amountPaid: 2000, 
              dueDate: '2023-06-15' 
            },
            { 
              id: 'assign-002', 
              studentId: 'stu-001', 
              feeName: 'Transport Fee', 
              totalAmount: 3000, 
              amountPaid: 0, 
              dueDate: '2023-06-10' 
            }
          ])

          // Mock receipts
          setReceipts([
            {
              id: 'rcpt-001',
              studentId: 'stu-001',
              studentName: 'Ali Khan',
              feeAssignmentId: 'assign-001',
              feeName: 'Tuition Fee',
              amountPaid: 2000,
              paymentMethod: 'Cash',
              date: '2023-05-15',
              referenceNo: 'RCPT-2023-001'
            }
          ])
          setLoading(false)
        }, 800)
      } catch (error) {
        toast.error('Failed to load data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle student selection for new receipt
  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId)
    setNewReceipt(prev => ({
      ...prev,
      studentId,
      feeAssignmentId: '',
      amountPaid: ''
    }))
  }

  // Handle fee assignment selection
  const handleFeeSelect = (feeId) => {
    const selectedFee = unpaidFees.find(fee => fee.id === feeId)
    if (selectedFee) {
      setNewReceipt(prev => ({
        ...prev,
        feeAssignmentId: feeId,
        amountPaid: selectedFee.totalAmount - selectedFee.amountPaid
      }))
    }
  }

  // Submit new receipt
  const handleSubmitReceipt = (e) => {
    e.preventDefault()
    
    // Validation
    if (!newReceipt.studentId) {
      toast.error('Please select a student')
      return
    }

    if (!newReceipt.feeAssignmentId) {
      toast.error('Please select a fee assignment')
      return
    }

    if (!newReceipt.amountPaid || isNaN(newReceipt.amountPaid)) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const student = students.find(s => s.id === newReceipt.studentId)
      const fee = unpaidFees.find(f => f.id === newReceipt.feeAssignmentId)
      
      const newReceiptEntry = {
        ...newReceipt,
        id: `rcpt-${Date.now()}`,
        studentName: student?.name || '',
        feeName: fee?.feeName || '',
        date: new Date().toISOString().split('T')[0]
      }

      setReceipts(prev => [newReceiptEntry, ...prev])
      toast.success('Receipt recorded successfully!')
      setShowNewReceiptModal(false)
      setNewReceipt({
        studentId: '',
        feeAssignmentId: '',
        amountPaid: '',
        paymentMethod: 'Cash',
        referenceNo: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      setLoading(false)
    }, 1000)
  }

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    if (filters.student && receipt.studentId !== filters.student) return false
    if (filters.dateFrom && receipt.date < filters.dateFrom) return false
    if (filters.dateTo && receipt.date > filters.dateTo) return false
    if (filters.feeType && !receipt.feeName.toLowerCase().includes(filters.feeType.toLowerCase())) return false
    return true
  })

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Receipts</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNewReceiptModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Receipt
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
            <select
              value={filters.student}
              onChange={(e) => setFilters({...filters, student: e.target.value})}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Fee Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search fee type..."
                value={filters.feeType}
                onChange={(e) => setFilters({...filters, feeType: e.target.value})}
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Receipt Modal */}
      {showNewReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record New Payment</h2>
              <button
                onClick={() => setShowNewReceiptModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceipt}>
              <div className="space-y-4">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReceipt.studentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.class}, {student.admissionNo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee Assignment Selection */}
                {newReceipt.studentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fee Assignment <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newReceipt.feeAssignmentId}
                      onChange={(e) => handleFeeSelect(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a fee assignment</option>
                      {unpaidFees
                        .filter(fee => fee.studentId === newReceipt.studentId)
                        .map(fee => (
                          <option key={fee.id} value={fee.id}>
                            {fee.feeName} - Due: {fee.dueDate} (Remaining: {fee.totalAmount - fee.amountPaid} PKR)
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Amount Paid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount Paid (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={newReceipt.amountPaid}
                    onChange={(e) => setNewReceipt({...newReceipt, amountPaid: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={newReceipt.paymentMethod}
                    onChange={(e) => setNewReceipt({...newReceipt, paymentMethod: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="referenceNo"
                    value={newReceipt.referenceNo}
                    onChange={(e) => setNewReceipt({...newReceipt, referenceNo: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Bank transaction ID"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={newReceipt.notes}
                    onChange={(e) => setNewReceipt({...newReceipt, notes: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newReceipt.date}
                    onChange={(e) => setNewReceipt({...newReceipt, date: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewReceiptModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.values(filters).some(Boolean) 
                ? 'Try changing your filters' 
                : 'Get started by recording a new payment'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowNewReceiptModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Receipt
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {receipt.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{receipt.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {receipt.feeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(receipt.amountPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        receipt.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        receipt.paymentMethod === 'Online Payment' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          title="Print Receipt"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button
                          title="Download Receipt"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          title="View Details"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
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
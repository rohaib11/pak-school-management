import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  UserGroupIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function AssignFee() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('individual')
  const [showPreview, setShowPreview] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [feeCategories, setFeeCategories] = useState([])
  const [classList, setClassList] = useState([])
  const [allStudents, setAllStudents] = useState([])
const [searchTerm, setSearchTerm] = useState('')
const getClassName = (classId) => {
  if (!Array.isArray(classList)) return 'Unknown Class'
  return classList.find(cls => cls.id === classId)?.name || 'Unknown Class'
}

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    studentId: '',
    classId: '',
    groupTag: '',
    amount: '',
    dueDate: '',
    isRecurring: false,
    recurrenceType: 'monthly',
    discountType: 'none',
    discountValue: '',
    notes: '',
    installments: 1
  })
  const [isAmountEdited, setIsAmountEdited] = useState(false)


useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const feeCats = await window.electronAPI.invoke('categories:list')
      setFeeCategories(feeCats)

      const classes = await window.electronAPI.invoke('classes:list')
      setClassList(classes)

      if (activeTab === 'individual' || activeTab === 'group') {
  const studentList = await window.electronAPI.invoke('students:list')
  setAllStudents(studentList)
}


      setLoading(false)
    } catch (error) {
      toast.error('Failed to load data')
      setLoading(false)
    }
  }

  fetchData()
}, [activeTab])



const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target

  if (name === 'amount') {
    setIsAmountEdited(true)
  }

  if (name === 'category') {
    setIsAmountEdited(false)
  }

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }))
}


useEffect(() => {
  if (formData.category && !isAmountEdited) {
    const selected = feeCategories.find(cat => cat.id === formData.category)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        amount: selected.defaultAmount
      }))
    }
  }
}, [formData.category, feeCategories, isAmountEdited])


  const handleStudentSelect = (student, isSelected) => {
  setSelectedStudents(prev => {
    if (isSelected) {
      return prev.some(s => s.id === student.id) ? prev : [...prev, student]
    }
    return prev.filter(s => s.id !== student.id)
  })
}



  const handleSubmit = async (e) => {

    e.preventDefault()
    setLoading(true)
    
    // Validate form
    if (!formData.category) {
      toast.error('Please select a fee category')
      setLoading(false)
      return
    }
    
    if (activeTab === 'individual' && selectedStudents.length === 0) {
  toast.error('Please select at least one student')
  setLoading(false)
  return
}

    if (!formData.amount || isNaN(formData.amount)) {
      toast.error('Please enter a valid amount')
      setLoading(false)
      return
    }

    if (!formData.dueDate) {
      toast.error('Please set a due date')
      setLoading(false)
      return
    }

   try {
  const payload = {
    categoryId: formData.category,
    amount: parseFloat(formData.amount),
    dueDate: formData.dueDate,
    isRecurring: formData.isRecurring ? 1 : 0,
    recurrenceType: formData.recurrenceType,
    discountType: formData.discountType,
    discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
    notes: formData.notes,
    installments: formData.installments,
studentIds: activeTab === 'individual' ? selectedStudents.map(s => s.id) : null,
    classId: activeTab === 'class' ? formData.classId : null,
    groupTag: activeTab === 'group' ? formData.groupTag : null
  }

  const result = await window.electronAPI.invoke('feeAssignments:add', payload)

 if (result.success) {
  toast.success(`Fee assigned to ${result.ids?.length || 1} student(s) successfully!`);
  navigate('/app/fees');
}
 else {
    toast.error('Assignment failed: ' + result.error)
  }
} catch (err) {
  toast.error('Error assigning fee')
} finally {
  setLoading(false)
}

  }

  const calculateTotal = () => {
    const baseAmount = parseFloat(formData.amount) || 0
    let discount = 0
    
    if (formData.discountType === 'percentage' && formData.discountValue) {
      discount = baseAmount * (parseFloat(formData.discountValue) / 100)
    } else if (formData.discountType === 'fixed' && formData.discountValue) {
      discount = parseFloat(formData.discountValue)
    }
    
    return (baseAmount - discount).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
  <div className="flex items-center space-x-2">
    <button
      onClick={() => navigate('/app/fees')}
      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
      title="Back to Fees Dashboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 inline-block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Fee</h1>
  </div>
  <div className="flex space-x-3">
    <button
      onClick={() => setShowPreview(!showPreview)}
      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      {showPreview ? 'Hide Preview' : 'Show Preview'}
    </button>
  </div>
</div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className={`lg:col-span-${showPreview ? '2' : '3'}`}>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('individual')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'individual' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <UserIcon className="inline-block h-4 w-4 mr-2" />
                  Individual
                </button>
                <button
                  onClick={() => setActiveTab('class')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'class' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <UserGroupIcon className="inline-block h-4 w-4 mr-2" />
                  Class
                </button>
                <button
                  onClick={() => setActiveTab('group')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'group' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <TagIcon className="inline-block h-4 w-4 mr-2" />
                  Group
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              {/* Fee Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {feeCategories.map(category => (
                  <option key={category.id} value={category.id}>
                  {category.name} - {parseFloat(category.defaultAmount).toLocaleString('en-PK')} PKR
                      </option>
                      ))}

                </select>
              </div>

              {/* Assignment Type Specific Fields */}
              {activeTab === 'individual' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Student(s) <span className="text-red-500">*</span>
                  </label>
                  <input
  type="text"
  placeholder="Search by name or roll number"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="mb-2 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
/>


                  <div className="mt-1 space-y-2 max-h-60 overflow-y-auto">
                   
                   {loading ? (
  <div className="animate-pulse space-y-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    ))}
  </div>
) : (
  allStudents
  .filter(student =>
  student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  student?.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase())
)


  .map(student => (

    <div key={student.id} className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
      <input
        type="checkbox"
        checked={selectedStudents.some(s => s.id === student.id)}
        onChange={(e) => handleStudentSelect(student, e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {getClassName(student.classId)} • {student.admissionNo}


        </p>
      </div>
    </div>
  ))
)}

                  </div>
                </div>
              )}

              {activeTab === 'class' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a class</option>
                    {classList.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'group' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Group/Tag <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="groupTag"
                    value={formData.groupTag}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a group</option>
                    <option value="transport">Transport Users</option>
                    <option value="hostel">Hostel Students</option>
                    <option value="scholarship">Scholarship Holders</option>
                  </select>
                </div>
              )}

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">PKR</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-12 pr-12 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 pr-12 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Recurring Option */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Recurring Fee
                  </label>
                </div>
                {formData.isRecurring && (
                  <div className="mt-2 ml-6">
                    <select
                      name="recurrenceType"
                      value={formData.recurrenceType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="none">None</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    {formData.discountType !== 'none' && (
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder={formData.discountType === 'percentage' ? 'Percentage (e.g. 10)' : 'Amount (e.g. 500)'}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Installments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Installments
                </label>
                <select
                  name="installments"
                  value={formData.installments}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Installment' : 'Installments'}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Optional notes about this fee assignment..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/app/fees')}
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
                      <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                      Assign Fee
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment Summary</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee Type</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formData.category ? (
                        feeCategories.find(c => c.id === formData.category)?.name || 'Not selected'
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignment Type</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {activeTab}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount Details</h4>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Base Amount:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formData.amount ? `${parseFloat(formData.amount).toLocaleString('en-PK')} PKR` : '0 PKR'}
                        </span>
                      </div>
                      {formData.discountType !== 'none' && formData.discountValue && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Fixed'}):
                          </span>
                          <span className="text-sm text-red-600 dark:text-red-400">
                            - {formData.discountType === 'percentage' 
                                ? `${(parseFloat(formData.amount) * (parseFloat(formData.discountValue) / 100))} PKR`
                                : `${formData.discountValue} PKR`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {calculateTotal()} PKR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Schedule</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formData.isRecurring 
                        ? `Recurring (${formData.recurrenceType})`
                        : `One-time payment`}
                    </p>
                    {formData.installments > 1 && (
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        Split into {formData.installments} installments
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formData.dueDate || <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Affected Students</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {activeTab === 'individual' 
                        ? selectedStudents.length 
                        : activeTab === 'class' 
                          ? 'Entire class' 
                          : 'All tagged students'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CakeIcon,
  IdentificationIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const StudentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [student, setStudent] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
const [classMap, setClassMap] = useState({})
 useEffect(() => {
  window.electronAPI.invoke('classes:list')
    .then(classes => {
      const map = {}
      classes.forEach(cls => {
        map[cls.id] = `${cls.grade} - ${cls.section}`
      })
      setClassMap(map)
    })
    .catch(() => toast.error('Failed to load class info'))
}, [])

  useEffect(() => {
    window.electronAPI.invoke('students:getById', id).then(data => {
      if (data) setStudent(data)
      else toast.error('Student not found')
    })
  }, [id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await window.electronAPI.invoke('students:delete', id)
      if (result.success) {
        toast.success('Student deleted successfully')
        setStudent(null)
        navigate('/app/students')
      } else {
        toast.error(result.error || 'Failed to delete student')
      }
    } catch (err) {
      console.error('❌ Error deleting student:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setShowConfirmModal(false)
    }
  }

  if (!student) {
    return <div className="text-center text-red-600 mt-8">Student not found.</div>
  }

  return (
    <>
      <div className="space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-md shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/students"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Details</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/app/students/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Edit
            </Link>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
              <div className="flex flex-col items-center">
                <img
                  className="h-32 w-32 rounded-full object-cover mb-4"
                  src={student.photo}
                  alt="Student"
                />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                <p className="text-gray-500 dark:text-gray-300">{student.fatherName}</p>
                <span
                  className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {student.status}
                </span>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Information</h3>
                <div className="space-y-4">
                  <InfoItem icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />} label="Admission No" value={student.admissionNo} />
                  <InfoItem icon={<AcademicCapIcon className="h-5 w-5 text-gray-400" />} label="Class" value={classMap[student.classId] || 'N/A'} />
                  <InfoItem icon={<UserGroupIcon className="h-5 w-5 text-gray-400" />} label="Gender" value={student.gender} />
                  <InfoItem icon={<CakeIcon className="h-5 w-5 text-gray-400" />} label="Date of Birth" value={new Date(student.dob).toLocaleDateString('en-PK')} />
                  <InfoItem icon={<PhoneIcon className="h-5 w-5 text-gray-400" />} label="Phone" value={student.phone} />
                  <InfoItem icon={<MapPinIcon className="h-5 w-5 text-gray-400" />} label="Address" value={student.address} />
                </div>
              </div>
            </div>

            <div className="card mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {student.documents.map(doc => (
                  <li key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{doc.name}</span>
                    </div>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      onClick={e => {
                        e.preventDefault()
                        toast.success(`Downloading ${doc.name}`)
                      }}
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['profile', 'attendance', 'exams', 'fees'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
<InfoBlock title="Current Class" value={classMap[student.classId] || 'N/A'} />
                    <InfoBlock title="Roll Number" value={student.rollNumber} />
                    <InfoBlock title="Admission Date" value={new Date(student.admissionDate).toLocaleDateString('en-PK')} />
                    <InfoBlock title="Academic Year" value={student.academicYear} />
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-8 mb-4">Parent Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <InfoBlock title="Father Name" value={student.fatherName} />
                    <InfoBlock title="Father Phone" value={student.phone} />
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance Record</h3>
                </div>
              )}

              {activeTab === 'exams' && (
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Exam Results</h3>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fee History</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this student?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md text-white ${
                  isDeleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">{icon}</div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
)

const InfoBlock = ({ title, value }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value}</p>
  </div>
)

export default StudentDetail

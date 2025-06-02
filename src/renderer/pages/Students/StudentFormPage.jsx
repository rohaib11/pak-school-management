import { useNavigate, useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import StudentForm from '../../components/StudentForm'

const StudentFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [initialValues, setInitialValues] = useState(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (isEdit && id) {
      window.electronAPI.invoke('students:getById', id)
        .then(student => {
          if (!student) {
            toast.error('Student not found')
            navigate('/app/students')
            return
          }

          setInitialValues({
            ...student,
            dob: student.dob ? new Date(student.dob) : null,
            photo: null,
            documents: student.documents || []
          })
        })
        .catch(err => {
          console.error('Failed to load student:', err)
          toast.error('Error loading student')
        })
        .finally(() => setLoading(false))
    } else {
      // New student
      setInitialValues({
        admissionNo: '',
        name: '',
        fatherName: '',
        fatherPhone: '',
        rollNumber: '',
        class: '',
        section: '',
        gender: '',
        dob: null,
        phone: '',
        address: '',
        status: 'Active',
        photo: null,
        documents: []
      })
    }
  }, [isEdit, id, navigate])

  const handleSubmit = async ({ student, photo, documents }) => {
    try {
      const photoBuffer = photo ? await photo.arrayBuffer() : null

      const documentBuffers = await Promise.all(
        documents.map(async doc => ({
          name: doc.name,
          type: doc.type,
          buffer: await doc.file.arrayBuffer()
        }))
      )

      const result = await window.electronAPI?.invoke(
        isEdit ? 'students:update' : 'students:add',
        {
          id,
          student,
          photoBuffer,
          photoName: photo?.name || null,
          documentBuffers
        }
      )

      if (result?.success) {
        toast.success(`Student ${isEdit ? 'updated' : 'added'} successfully`)
        navigate('/app/students')
      } else {
        toast.error('Failed to save student')
      }
    } catch (error) {
      console.error('Error saving student:', error)
      toast.error('An unexpected error occurred')
    }
  }

  if (loading || !initialValues) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/students"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h1>
        </div>
      </div>

      <StudentForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isEdit={isEdit}
      />
    </div>
  )
}

export default StudentFormPage

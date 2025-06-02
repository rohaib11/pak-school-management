import { useNavigate, useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import TeacherForm from '../../components/TeacherForm'

const TeacherFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  

  const [initialValues, setInitialValues] = useState(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    const loadTeacherData = async () => {
      if (isEdit && id) {
        try {
          const teacher = await window.electronAPI.invoke('teachers:getById', id)
          
          if (!teacher) {
            toast.error('Teacher not found')
            navigate('/app/teachers')
            return
          }

          setInitialValues({
            ...teacher,
            dob: teacher.dob ? new Date(teacher.dob) : null,
            joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate) : null,
            photo: teacher.photoPath || null,
            documents: teacher.documents || []
          })
        } catch (err) {
          console.error('Failed to load teacher:', err)
          toast.error('Error loading teacher data')
        } finally {
          setLoading(false)
        }
      } else {
        // New teacher default values
        setInitialValues({
          name: '',
          email: '',
          phone: '',
          gender: 'male',
          dob: null,
          subject: '',
          qualification: '',
          experience: '',
          address: '',
          city: '',
          joiningDate: null,
          status: 'active',
          salary: '',
          cnic: '',
          emergencyContact: '',
          photo: null,
          documents: []
        })
      }
    }

    loadTeacherData()
  }, [isEdit, id, navigate])

  const handleSubmit = async ({ teacher, photo, documents }) => {
    try {
      // Prepare photo buffer if exists
      const photoBuffer = photo ? await photo.arrayBuffer() : null
      
      // Prepare document buffers
      const documentBuffers = await Promise.all(
        documents.map(async doc => ({
          name: doc.name,
          type: doc.type,
          buffer: await doc.file.arrayBuffer()
        }))
      )

      const result = await window.electronAPI.invoke(
        isEdit ? 'teachers:update' : 'teachers:add',
        {
          id,
          teacher: {
            ...teacher,
            dob: new Date(teacher.dob).toISOString().split('T')[0],
            joiningDate: new Date(teacher.joiningDate).toISOString().split('T')[0],
          },
          photoBuffer,
          photoName: photo?.name || null,
          documentBuffers
        }
      )

      if (result?.success) {
        toast.success(`Teacher ${isEdit ? 'updated' : 'added'} successfully!`)
        navigate('/app/teachers')
      } else {
        toast.error(result?.error || `Failed to ${isEdit ? 'update' : 'add'} teacher`)
      }
    } catch (error) {
      console.error('Error saving teacher:', error)
      toast.error('An unexpected error occurred')
    }
  }

  if (loading || !initialValues) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/teachers"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <TeacherForm 
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      </div>
    </div>
  )
}

export default TeacherFormPage
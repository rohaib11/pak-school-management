import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'
import {
  UserCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useEffect } from 'react';

const validationSchema = Yup.object().shape({
  admissionNo: Yup.string().required('Admission number is required'),
  name: Yup.string().required('Student name is required'),
  fatherName: Yup.string().required('Father name is required'),
classId: Yup.string().required('Class is required'),
section: Yup.string().required('Section is required'),

  gender: Yup.string().required('Gender is required'),
  dob: Yup.date().required('Date of birth is required'),
  phone: Yup.string()
    .matches(/^[0-9]{11}$/, 'Phone must be 11 digits')
    .required('Phone is required'),
  address: Yup.string().required('Address is required'),
  status: Yup.string().required('Status is required'), // ✅ comma here
  rollNumber: Yup.string().required('Roll number is required'),
  fatherPhone: Yup.string()
  .matches(/^[0-9]{11}$/, 'Father phone must be 11 digits')
  .required('Father phone is required'),

})


const StudentForm = ({ initialValues, onSubmit, isEdit = false }) => {
  const [photoPreview, setPhotoPreview] = useState(initialValues.photo || null)
  const [documents, setDocuments] = useState(initialValues.documents || [])
const [classes, setClasses] = useState([])
useEffect(() => {
  window.electronAPI.invoke('classes:list')
    .then(setClasses)
    .catch(() => toast.error('Failed to load class list'))
}, [])
 const formik = useFormik({
  initialValues: {
  admissionNo: initialValues.admissionNo || '',
  name: initialValues.name || '',
  fatherName: initialValues.fatherName || '',
  fatherPhone: initialValues.fatherPhone || '',
  rollNumber: initialValues.rollNumber || '',
  classId: initialValues.classId || '',
  section: initialValues.section || '', // ✅ ADD THIS LINE
  gender: initialValues.gender || '',
  dob: initialValues.dob ? new Date(initialValues.dob) : null,
  phone: initialValues.phone || '',
  address: initialValues.address || '',
  status: initialValues.status || 'Active',
  photo: null,
  documents: []
},

  validationSchema,
  onSubmit: values => {
    const student = {
      admissionNo: values.admissionNo,
      name: values.name,
      fatherName: values.fatherName,
      fatherPhone: values.fatherPhone,
      rollNumber: values.rollNumber,
      classId: values.classId,
      section: values.section, // ✅ Ensure this exists

      gender: values.gender,
      dob: values.dob.toISOString().split('T')[0],
      phone: values.phone,
      address: values.address,
      status: values.status
    }

    onSubmit({
      student,
      photo: values.photo,
      documents
    })

      toast.success(isEdit ? 'Student updated successfully!' : 'Student added successfully!')

  }
})



  const onDropPhoto = useCallback(
    acceptedFiles => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        formik.setFieldValue('photo', file)
        setPhotoPreview(URL.createObjectURL(file))
      }
    },
    [formik]
  )

  const onDropDocuments = useCallback(
    acceptedFiles => {
      const newDocs = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file
      }))
      setDocuments(prev => [...prev, ...newDocs])
    },
    []
  )

  const removeDocument = id => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps } = useDropzone({
    onDrop: onDropPhoto,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  const { getRootProps: getDocumentsRootProps, getInputProps: getDocumentsInputProps } = useDropzone(
    {
      onDrop: onDropDocuments,
      accept: {
        'application/pdf': ['.pdf'],
        'image/*': ['.jpeg', '.jpg', '.png']
      }
    }
  )

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Photo and Documents */}
        <div className="space-y-6 lg:col-span-1">
          {/* Student Photo */}
          <div className="card bg-white dark:bg-gray-800 shadow p-6 rounded-md">

            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Student Photo</h2>
            <div
              {...getPhotoRootProps()}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md ${
                !photoPreview ? 'cursor-pointer' : ''
              }`}
            >
              <div className="space-y-1 text-center">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="mx-auto h-40 w-40 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setPhotoPreview(null)
                        formik.setFieldValue('photo', null)
                      }}
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-medium text-blue-600 focus-within:outline-none hover:text-blue-500">
                        Upload a photo
                        <input {...getPhotoInputProps()} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 2MB</p>
                  </>
                )}
              </div>
            </div>
            {formik.touched.photo && formik.errors.photo && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.photo}</p>
            )}
          </div>

          {/* Documents */}
          <div className="card bg-white dark:bg-gray-800 shadow p-6 rounded-md">

            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Documents</h2>
            <div
              {...getDocumentsRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"
            >
              <div className="space-y-1 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-medium text-blue-600 focus-within:outline-none hover:text-blue-500">
                    Upload documents
                    <input {...getDocumentsInputProps()} className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG up to 5MB each</p>
              </div>
            </div>

            {/* Document list */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Documents</h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">

                  {documents.map(doc => (
                    <li key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2">
          <div className="card bg-white dark:bg-gray-800 shadow p-6 rounded-md">

            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              {isEdit ? 'Edit Student' : 'Add New Student'}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Admission No */}
              <div>
                <label htmlFor="admissionNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admission Number *
                </label>
                <input
                  type="text"
                  id="admissionNo"
                  name="admissionNo"
                  value={formik.values.admissionNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                />
                {formik.touched.admissionNo && formik.errors.admissionNo && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.admissionNo}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.status}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              {/* Father Name */}
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Father Name *
                </label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formik.values.fatherName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                />
                {formik.touched.fatherName && formik.errors.fatherName && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.fatherName}</p>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Roll Number *
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formik.values.rollNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                />
                {formik.touched.rollNumber && formik.errors.rollNumber && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.rollNumber}</p>
                )}
              </div>

        

              
            {/* Father Phone */}
            <div>
              <label htmlFor="fatherPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Father Phone *
              </label>
              <input
                type="text"
                id="fatherPhone"
                name="fatherPhone"
                value={formik.values.fatherPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="input-field mt-1"
                placeholder="03001234567"
              />
              {formik.touched.fatherPhone && formik.errors.fatherPhone && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.fatherPhone}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label htmlFor="classId">Class *</label>
<select
  id="classId"
  name="classId"
  value={formik.values.classId}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  className="input-field mt-1"
>
  <option value="">Select Class</option>
  {classes.map(cls => (
    <option key={cls.id} value={cls.id}>
      {cls.grade} - {cls.section}
    </option>
  ))}
</select>
{formik.touched.classId && formik.errors.classId && (
  <p className="mt-2 text-sm text-red-600">{formik.errors.classId}</p>
)}

         {/* Section */}
<div>
  <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Section *
  </label>
  <input
    type="text"
    id="section"
    name="section"
    value={formik.values.section}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    className="input-field mt-1"
    placeholder="e.g. A"
  />
  {formik.touched.section && formik.errors.section && (
    <p className="mt-2 text-sm text-red-600">{formik.errors.section}</p>
  )}
</div>
    
            </div>

              

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth *
                </label>
                <DatePicker
                  id="dob"
                  name="dob"
                  selected={formik.values.dob}
                  onChange={date => formik.setFieldValue('dob', date)}
                  onBlur={formik.handleBlur}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                  className="input-field mt-1 w-full"
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                />
                {formik.touched.dob && formik.errors.dob && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.dob}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone *
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                  placeholder="03001234567"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input-field mt-1"
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
           <button
            type="button"
              onClick={() => formik.resetForm()}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300
           bg-white dark:bg-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
           Cancel
          </button>

            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEdit ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default StudentForm
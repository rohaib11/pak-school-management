import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{11}$/, 'Phone must be 11 digits')
    .required('Phone is required'),
  gender: Yup.string().required('Gender is required'),
  dob: Yup.date().required('Date of birth is required'),
  subject: Yup.string().required('Subject is required'),
  qualification: Yup.string().required('Qualification is required'),
  experience: Yup.number()
    .positive('Experience must be positive')
    .required('Experience is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  joiningDate: Yup.date().required('Joining date is required'),
  status: Yup.string().required('Status is required'),
  salary: Yup.number()
    .positive('Salary must be positive')
    .required('Salary is required'),
  cnic: Yup.string()
    .matches(/^[0-9]{13}$/, 'CNIC must be 13 digits')
    .required('CNIC is required'),
 emergencyContact: Yup.string()
  .matches(/^[0-9]{11}$/, 'Emergency contact must be 11 digits')
  .required('Emergency contact is required'),

     bankName: Yup.string().nullable(),
     accountNumber: Yup.string().nullable()

});

const TeacherForm = ({ initialValues, onSubmit, isEdit = false }) => {
 const [photoPreview, setPhotoPreview] = useState(
  initialValues.photoPath
    ? `file://${initialValues.photoPath}`
    : initialValues.photo?.startsWith('http')
      ? initialValues.photo
      : null
     );
  const [documents, setDocuments] = useState(initialValues.documents || []);

  const formik = useFormik({
    initialValues: {
      name: initialValues.name || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      gender: initialValues.gender || 'male',
      dob: initialValues.dob ? new Date(initialValues.dob) : null,
      subject: initialValues.subject || '',
      qualification: initialValues.qualification || '',
      experience: initialValues.experience || '',
      address: initialValues.address || '',
      city: initialValues.city || '',
      joiningDate: initialValues.joiningDate ? new Date(initialValues.joiningDate) : null,
      status: initialValues.status || 'active',
      salary: initialValues.salary || '',
      cnic: initialValues.cnic || '',
      emergencyContact: initialValues.emergencyContact || '',
      photo: null,
      bankName: initialValues.bankName || '',
      accountNumber: initialValues.accountNumber || '',

    },
    validationSchema,
    onSubmit: values => {
      const teacher = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob.toISOString().split('T')[0],
        subject: values.subject,
        qualification: values.qualification,
        experience: values.experience,
        address: values.address,
        city: values.city,
        joiningDate: values.joiningDate.toISOString().split('T')[0],
        status: values.status,
        salary: values.salary,
        cnic: values.cnic,
        emergencyContact: values.emergencyContact,
        bankName: values.bankName,
        accountNumber: values.accountNumber
      };

      onSubmit({
        teacher,
        photo: values.photo,
        documents
      });

      toast.success(isEdit ? 'Teacher updated successfully!' : 'Teacher added successfully!');
    }
  });

  const onDropPhoto = useCallback(
    acceptedFiles => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        formik.setFieldValue('photo', file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    },
    [formik]
  );

  const onDropDocuments = useCallback(
    acceptedFiles => {
      const newDocs = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file
      }));
      setDocuments(prev => [...prev, ...newDocs]);
    },
    []
  );

  const removeDocument = id => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps } = useDropzone({
    onDrop: onDropPhoto,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const { getRootProps: getDocumentsRootProps, getInputProps: getDocumentsInputProps } = useDropzone({
    onDrop: onDropDocuments,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Urdu', 'Islamiat', 'Pakistan Studies',
    'Computer Science', 'Economics', 'Accounting', 'Business Studies'
  ];

  const qualifications = [
    'MPhil', 'Masters', 'Bachelors', 'PhD',
    'Post Graduate Diploma', 'Professional Certification'
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Photo and Documents */}
        <div className="space-y-6 lg:col-span-1">
          {/* Teacher Photo */}
          <div className="card bg-white dark:bg-gray-800 shadow p-6 rounded-md">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Teacher Photo</h2>
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
                      alt="Teacher Preview"
                      className="mx-auto h-40 w-40 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setPhotoPreview(null);
                        formik.setFieldValue('photo', null);
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
              {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
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

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.email}</p>
                  )}
                </div>

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

                <div>
                  <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CNIC *
                  </label>
                  <input
                    type="text"
                    id="cnic"
                    name="cnic"
                    value={formik.values.cnic}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                    placeholder="4220112345678"
                  />
                  {formik.touched.cnic && formik.errors.cnic && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.cnic}</p>
                  )}
                </div>

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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formik.touched.gender && formik.errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.gender}</p>
                  )}
                </div>

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

                <div className="sm:col-span-2">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Emergency Contact *
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formik.values.emergencyContact}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                    placeholder="03001234567"
                  />
                  {formik.touched.emergencyContact && formik.errors.emergencyContact && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.emergencyContact}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {formik.touched.subject && formik.errors.subject && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Qualification *
                  </label>
                  <select
                    id="qualification"
                    name="qualification"
                    value={formik.values.qualification}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map(qual => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                  {formik.touched.qualification && formik.errors.qualification && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.qualification}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formik.values.experience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                    min="0"
                  />
                  {formik.touched.experience && formik.errors.experience && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.experience}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Joining Date *
                  </label>
                  <DatePicker
                    id="joiningDate"
                    name="joiningDate"
                    selected={formik.values.joiningDate}
                    onChange={date => formik.setFieldValue('joiningDate', date)}
                    onBlur={formik.handleBlur}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    className="input-field mt-1 w-full"
                    showYearDropdown
                    dropdownMode="select"
                  />
                  {formik.touched.joiningDate && formik.errors.joiningDate && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.joiningDate}</p>
                  )}
                </div>

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
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                    <option value="retired">Retired</option>
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.status}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salary (PKR) *
                  </label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formik.values.salary}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                    min="0"
                  />
                  {formik.touched.salary && formik.errors.salary && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.salary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Bank Details */}
<h3 className="text-md font-medium text-gray-900 dark:text-white mt-8 mb-4">Bank Details</h3>
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
  <div>
    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Bank Name
    </label>
    <input
      type="text"
      id="bankName"
      name="bankName"
      value={formik.values.bankName}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      className="input-field mt-1"
    />
  </div>

  <div>
    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Account Number
    </label>
    <input
      type="text"
      id="accountNumber"
      name="accountNumber"
      value={formik.values.accountNumber}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      className="input-field mt-1"
    />
  </div>
</div>


            {/* Address Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="input-field mt-1"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.city}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={() => formik.resetForm()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEdit ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default TeacherForm;
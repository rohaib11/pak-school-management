import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PlusIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Dummy data - Replace with your IPC calls
const dummyTeachers = [
  { id: 't1', name: 'Mr. Ahmad' },
  { id: 't2', name: 'Ms. Sana' },
  { id: 't3', name: 'Dr. Usman' }
];

const dummySubjects = [
  { id: 's1', name: 'Mathematics' },
  { id: 's2', name: 'Physics' },
  { id: 's3', name: 'English Literature' },
  { id: 's4', name: 'Chemistry' }
];

const ClassForm = ({ isEdit = false, initialData = null }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    roomNumber: '',
    status: 'active',
    capacity: 30,
    teacherId: '',
    subjectAssignments: [] // Array of { subjectId, teacherId }
  });

  useEffect(() => {
    window.electronAPI.invoke('teachers:list').then(setTeachers).catch(() => {
  toast.error('Failed to load teachers');
});

window.electronAPI.invoke('subjects:list').then(setSubjects).catch(() => {
  toast.error('Failed to load subjects');
});

    if (isEdit && initialData) {
      setFormData(initialData);
    }
  }, [isEdit, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...formData.subjectAssignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      subjectAssignments: updatedAssignments
    }));
  };

  const addAssignment = () => {
    setFormData(prev => ({
      ...prev,
      subjectAssignments: [...prev.subjectAssignments, { subjectId: '', teacherId: '' }]
    }));
  };

  const removeAssignment = (index) => {
    const updatedAssignments = formData.subjectAssignments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      subjectAssignments: updatedAssignments
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }
    
    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }
    
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }
    
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }
    
    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be positive';
    }

    // Validate subject assignments
    formData.subjectAssignments.forEach((ass, index) => {
      if (!ass.subjectId) {
        newErrors[`assignment-${index}-subject`] = 'Subject is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error('Please fix the form errors');
    return;
  }

  setSubmitting(true);

  try {
    if (isEdit) {
      await window.electronAPI.invoke('classes:update', {
        id: initialData.id,
        ...formData
      });
      toast.success('Class updated successfully');
    } else {
      await window.electronAPI.invoke('classes:create', formData);
      toast.success('Class created successfully');
    }

    navigate('/app/classes');
  } catch (error) {
    toast.error(error.message || 'Failed to save class');
    setSubmitting(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/classes')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Classes
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Edit Class' : 'Create New Class'}
        </h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
                Class Information
              </h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class Name *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                      placeholder="e.g. Class 10-A"
                    />
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grade *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.grade ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                      placeholder="e.g. 10"
                    />
                    {errors.grade && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.grade && (
                    <p className="mt-2 text-sm text-red-600">{errors.grade}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.section ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                      placeholder="e.g. A"
                    />
                    {errors.section && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.section && (
                    <p className="mt-2 text-sm text-red-600">{errors.section}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Room Number *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.roomNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                      placeholder="e.g. 101"
                    />
                    {errors.roomNumber && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.roomNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.roomNumber}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacity *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.capacity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                    />
                    {errors.capacity && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600">{errors.capacity}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class Teacher
                  </label>
                  <div className="mt-1">
                    <select
                      id="teacherId"
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Not assigned</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status *
                  </label>
                  <div className="mt-1">
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="archived"
                          checked={formData.status === 'archived'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Archived</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Assignments Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
                Subject Assignments
              </h3>

              <div className="space-y-4">
                {formData.subjectAssignments.map((assignment, index) => (
                  <div key={index} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <label htmlFor={`subject-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subject *
                      </label>
                      <div className="mt-1 relative">
                        <select
                          id={`subject-${index}`}
                          value={assignment.subjectId}
                          onChange={(e) => handleAssignmentChange(index, 'subjectId', e.target.value)}
                          className={`block w-full border ${errors[`assignment-${index}-subject`] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                        >
                          <option value="">Select Subject</option>
                          {subjects
                            .filter(sub => 
                              !formData.subjectAssignments.some(a => a.subjectId === sub.id && a.subjectId !== assignment.subjectId)
                            )
                            .map(subject => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                        {errors[`assignment-${index}-subject`] && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors[`assignment-${index}-subject`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`assignment-${index}-subject`]}</p>
                      )}
                    </div>

                    <div className="sm:col-span-5">
                      <label htmlFor={`teacher-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teacher
                      </label>
                      <div className="mt-1">
                        <select
                          id={`teacher-${index}`}
                          value={assignment.teacherId}
                          onChange={(e) => handleAssignmentChange(index, 'teacherId', e.target.value)}
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Not assigned</option>
                          {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        <TrashIcon className="-ml-1 mr-1 h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={addAssignment}
                    disabled={subjects.length === formData.subjectAssignments.length}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Subject Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate('/app/classes')}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEdit ? 'Update Class' : 'Create Class'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
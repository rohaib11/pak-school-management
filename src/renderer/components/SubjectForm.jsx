import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AcademicCapIcon,
  UserGroupIcon,
  PlusIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

import { toast } from 'react-hot-toast';

const SubjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    assignments: [] // Array of { classId, teacherId }
  });

 useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [classes, teachers] = await Promise.all([
        window.electronAPI.invoke('classes:list'),
        window.electronAPI.invoke('teachers:list')
      ]);

      setAvailableClasses(classes);
      setAvailableTeachers(teachers);

      if (isEditMode) {
        const subject = await window.electronAPI.invoke('subjects:get', id);
        if (!subject) {
          toast.error('Subject not found');
          navigate('/app/subjects');
          return;
        }

        setFormData({
          name: subject.name || '',
          description: subject.description || '',
          status: subject.status || 'active',
          assignments: subject.classes.map(c => ({
            classId: c.id,
            teacherId: c.teacherId || ''
          })) || []
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load form data');
      setLoading(false);
    }
  };

  fetchInitialData();
}, [id, isEditMode]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...formData.assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      assignments: updatedAssignments
    }));
  };

  const addAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { classId: '', teacherId: '' }]
    }));
  };

  const removeAssignment = (index) => {
    const updatedAssignments = formData.assignments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      assignments: updatedAssignments
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }
    
   if (formData.assignments.length === 0) {
  newErrors.assignments = 'At least one class assignment is required';
} else {
  const classIds = formData.assignments.map(a => a.classId);
  const uniqueClassIds = new Set(classIds);
  if (uniqueClassIds.size !== classIds.length) {
    newErrors.assignments = 'Duplicate class assignments are not allowed';
  }

  formData.assignments.forEach((ass, index) => {
    if (!ass.classId) {
      newErrors[`assignment-${index}-class`] = 'Class is required';
    }
  });
}


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
  if (isEditMode) {
    await window.electronAPI.invoke('subjects:update', {
      id,
      ...formData
    });
    toast.success('Subject updated successfully');
  } else {
    await window.electronAPI.invoke('subjects:create', formData);
    toast.success('Subject created successfully');
  }

  navigate('/app/subjects');
} catch (error) {
  toast.error(error.message || 'Failed to save subject');
  setSubmitting(false);
}
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading {isEditMode ? 'subject data' : 'form'}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/subjects')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Subjects
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditMode ? 'Edit Subject' : 'Create New Subject'}
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
                Subject Information
              </h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject Name *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                      placeholder="e.g. Mathematics"
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

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Brief description of the subject (optional)"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
                Class Assignments *
              </h3>
              
              {errors.assignments && (
                <p className="mb-4 text-sm text-red-600">{errors.assignments}</p>
              )}

              <div className="space-y-4">
                {formData.assignments.map((assignment, index) => (
                  <div key={index} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <label htmlFor={`class-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Class *
                      </label>
                      <div className="mt-1 relative">
                        <select
                          id={`class-${index}`}
                          value={assignment.classId}
                          onChange={(e) => handleAssignmentChange(index, 'classId', e.target.value)}
                          className={`block w-full border ${errors[`assignment-${index}-class`] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                        >
                          <option value="">Select Class</option>
                          {availableClasses
                            .filter(cls => 
                              !formData.assignments.some(a => a.classId === cls.id && a.classId !== assignment.classId)
                            )
                            .map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                        {errors[`assignment-${index}-class`] && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {errors[`assignment-${index}-class`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`assignment-${index}-class`]}</p>
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
                          <option value="">No teacher assigned</option>
                          {availableTeachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      {formData.assignments.length > 1 && (

                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Remove
                      </button>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={addAssignment}
                    disabled={availableClasses.length === formData.assignments.length}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Another Class
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate('/app/subjects')}
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
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditMode ? 'Update Subject' : 'Create Subject'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default SubjectForm;
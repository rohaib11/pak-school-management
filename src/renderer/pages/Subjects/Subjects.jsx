import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';



function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInput, setFilterInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
const [allTeachers, setAllTeachers] = useState([]);
const [allClasses, setAllClasses] = useState([]);

useEffect(() => {
  window.electronAPI.invoke('teachers:list').then(setAllTeachers).catch(() => {
    toast.error('Failed to load teachers');
  });
}, []);

useEffect(() => {
  window.electronAPI.invoke('classes:list').then(setAllClasses).catch(() => {
    toast.error('Failed to load classes');
  });
}, []);

 useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const data = await window.electronAPI.invoke('subjects:list');
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load subjects');
      setLoading(false);
    }
  };

  fetchSubjects();
}, []);


  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = filterInput === '' || 
      subject.name.toLowerCase().includes(filterInput.toLowerCase()) || 
      subject.description.toLowerCase().includes(filterInput.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subject.status === statusFilter;
    
    const matchesTeacher = teacherFilter === 'all' || 
      subject.teachers.includes(teacherFilter);
    
    const matchesClass = classFilter === 'all' || 
      subject.classes.some(cls => cls.id === classFilter);
    
    return matchesSearch && matchesStatus && matchesTeacher && matchesClass;
  });

  const deleteSubject = (id) => {
    // Check if subject is assigned to any classes/teachers
    const subject = subjects.find(s => s.id === id);
    if (subject.classes.length > 0 || subject.teachers.length > 0) {
      setSubjectToDelete(id);
      setShowWarningModal(true);
      return;
    }

    const performDelete = async () => {
  try {
    await window.electronAPI.invoke('subjects:delete', id);
    setSubjects(subjects.filter(s => s.id !== id));
    toast.success('Subject deleted successfully');
    setShowDeleteModal(false);
  } catch (error) {
    toast.error('Failed to delete subject');
  }
};


    performDelete();
  };

  const bulkDelete = () => {
    // Filter out subjects that have assignments
    const deletableSubjects = selectedSubjects.filter(id => {
      const subject = subjects.find(s => s.id === id);
      return subject.classes.length === 0 && subject.teachers.length === 0;
    });

    if (deletableSubjects.length !== selectedSubjects.length) {
      toast.error('Some subjects cannot be deleted as they are assigned to classes/teachers');
      return;
    }

    // Simulate bulk delete - Replace with your Electron IPC call
    const performBulkDelete = async () => {
      try {
       await window.electronAPI.invoke('subjects:bulk-delete', deletableSubjects);
setSubjects(subjects.filter(s => !deletableSubjects.includes(s.id)));
setSelectedSubjects([]);
toast.success(`${deletableSubjects.length} subjects deleted`);
setShowDeleteModal(false);

      } catch (error) {
        toast.error('Failed to delete subjects');
      }
    };

    performBulkDelete();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredSubjects.map(subject => ({
        'Subject Name': subject.name,
        'Description': subject.description,
        'Status': subject.status === 'active' ? 'Active' : 'Inactive',
        'Classes': subject.classes.map(c => c.name).join(', '),
        'Teachers': subject.teachers.map(tId => allTeachers.find(t => t.id === tId)?.name || 'Unknown'
        ).join(', '),
        'Created At': subject.createdAt
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subjects');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `subjects_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getAnalytics = () => {
    return {
      total: subjects.length,
      active: subjects.filter(s => s.status === 'active').length,
      assigned: subjects.filter(s => s.classes.length > 0).length,
      unassigned: subjects.filter(s => s.classes.length === 0).length,
      noTeacher: subjects.filter(s => s.classes.length > 0 && s.teachers.length === 0).length
    };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Subjects</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Active Subjects</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Assigned to Classes</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.assigned}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">No Teacher Assigned</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.noTeacher}</p>
        </div>
      </div>

      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subjects Management</h1>
        <div className="flex space-x-3">
          {selectedSubjects.length > 0 && (
            <>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                Delete Selected ({selectedSubjects.length})
              </button>
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Export Selected
              </button>
            </>
          )}
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Export All
          </button>
          <Link
            to="/app/subjects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Subject
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              placeholder="Search subjects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Teachers</option>
                {allTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Classes</option>
                {allClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterInput('');
                setStatusFilter('all');
                setTeacherFilter('all');
                setClassFilter('all');
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects(filteredSubjects.map(s => s.id));
                      } else {
                        setSelectedSubjects([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assignments
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Classes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Teachers
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    {subjects.length === 0 ? (
                      <div className="text-center py-8">
                        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No subjects</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          Get started by creating a new subject.
                        </p>
                        <div className="mt-6">
                          <Link
                            to="/app/subjects/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            New Subject
                          </Link>
                        </div>
                      </div>
                    ) : (
                      'No subjects match your search criteria'
                    )}
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject.id]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{subject.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate" title={subject.description}>
                        {subject.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subject.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {subject.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {subject.classes.length > 0 ? (
                          <div className="space-y-1">
                            {subject.classes.slice(0, 2).map(cls => (
                              <div key={cls.id} className="flex items-center">
                                <span className="text-gray-900 dark:text-white">{cls.name}</span>
                                <span className="mx-1">-</span>
                                <span>{cls.teacher}</span>
                              </div>
                            ))}
                            {subject.classes.length > 2 && (
                              <span className="text-xs text-blue-600">+{subject.classes.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {subject.classes.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {subject.teachers.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/app/subjects/${subject.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/app/subjects/${subject.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSubjectToDelete(subject.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedSubjects.length > 1 ? `Delete ${selectedSubjects.length} Subjects?` : 'Delete Subject?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {selectedSubjects.length > 1
                ? 'Are you sure you want to delete these subjects?'
                : 'Are you sure you want to delete this subject?'}
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSubjectToDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedSubjects.length > 1) {
                    bulkDelete();
                  } else {
                    deleteSubject(subjectToDelete);
                  }
                }}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for Assigned Subjects */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cannot Delete Subject</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  This subject is assigned to classes or teachers. Please remove all assignments before deleting.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setSubjectToDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;
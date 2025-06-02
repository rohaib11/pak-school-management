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
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';



function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInput, setFilterInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
const [teachers, setTeachers] = useState([]);
const [subjects, setSubjects] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [classList, teacherList, subjectList] = await Promise.all([
        window.electronAPI.invoke('classes:list'),
        window.electronAPI.invoke('teachers:list'),
        window.electronAPI.invoke('subjects:list')
      ]);

      const enriched = classList.map(cls => ({
        ...cls,
        teacher: teacherList.find(t => t.id === cls.teacherId) || null,
        subjects: cls.subjectAssignments?.map(ass => {
          const subj = subjectList.find(s => s.id === ass.subjectId);
          return {
            id: subj?.id,
            name: subj?.name,
            teacher: teacherList.find(t => t.id === ass.teacherId)?.name || null
          };
        }) || [],
        currentStudents: cls.currentStudents || 0
      }));

      setClasses(enriched);
      setTeachers(teacherList);
      setSubjects(subjectList);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const filteredClasses = classes.filter(cls => {
    const matchesSearch = filterInput === '' || 
      cls.name.toLowerCase().includes(filterInput.toLowerCase()) || 
      `${cls.grade}-${cls.section}`.toLowerCase().includes(filterInput.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    
    const matchesTeacher = teacherFilter === 'all' || 
      (cls.teacher && cls.teacher.id === teacherFilter);
    
    const matchesGrade = gradeFilter === 'all' || cls.grade === gradeFilter;
    
    const matchesSubject = subjectFilter === 'all' || 
      cls.subjects.some(sub => sub.id === subjectFilter);
    
    return matchesSearch && matchesStatus && matchesTeacher && matchesGrade && matchesSubject;
  });

  const deleteClass = (id) => {
    // Check if class has students
    const cls = classes.find(c => c.id === id);
    if (cls.currentStudents > 0) {
      setClassToDelete(id);
      setShowWarningModal(true);
      return;
    }

    // Simulate delete - Replace with your Electron IPC call
    const performDelete = async () => {
      try {
        // Replace with: const result = await window.electronAPI.invoke('classes:delete', id);
        setTimeout(() => {
          setClasses(classes.filter(c => c.id !== id));
          toast.success('Class deleted successfully');
          setShowDeleteModal(false);
        }, 300);
      } catch (error) {
        toast.error('Failed to delete class');
      }
    };

    performDelete();
  };

  const bulkDelete = () => {
    // Filter out classes that have students
    const deletableClasses = selectedClasses.filter(id => {
      const cls = classes.find(c => c.id === id);
      return cls.currentStudents === 0;
    });

    if (deletableClasses.length !== selectedClasses.length) {
      toast.error('Some classes cannot be deleted as they have students assigned');
      return;
    }

    // Simulate bulk delete - Replace with your Electron IPC call
    const performBulkDelete = async () => {
      try {
        // Replace with: const result = await window.electronAPI.invoke('classes:bulk-delete', deletableClasses);
        setTimeout(() => {
          setClasses(classes.filter(c => !deletableClasses.includes(c.id)));
          setSelectedClasses([]);
          toast.success(`${deletableClasses.length} classes deleted`);
          setShowDeleteModal(false);
        }, 500);
      } catch (error) {
        toast.error('Failed to delete classes');
      }
    };

    performBulkDelete();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredClasses.map(cls => ({
        'Class Name': cls.name,
        'Grade-Section': `${cls.grade}-${cls.section}`,
        'Room Number': cls.roomNumber,
        'Status': cls.status === 'active' ? 'Active' : 'Archived',
        'Teacher': cls.teacher?.name || 'Not assigned',
        'Students': `${cls.currentStudents}/${cls.capacity}`,
        'Subjects': cls.subjects.map(s => s.name).join(', '),
        'Created At': cls.createdAt
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Classes');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `classes_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getAnalytics = () => {
    return {
      total: classes.length,
      active: classes.filter(c => c.status === 'active').length,
      archived: classes.filter(c => c.status === 'archived').length,
      withTeachers: classes.filter(c => c.teacher).length,
      totalStudents: classes.reduce((sum, c) => sum + c.currentStudents, 0),
      totalCapacity: classes.reduce((sum, c) => sum + c.capacity, 0),
      utilization: Math.round(
        (classes.reduce((sum, c) => sum + c.currentStudents, 0) / 
         classes.reduce((sum, c) => sum + c.capacity, 0)) * 100
      ) || 0
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
        <p className="text-sm">Loading classes...</p>
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
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Classes</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Active Classes</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Students</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {analytics.totalStudents} / {analytics.totalCapacity}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {analytics.utilization}% utilization
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">No Teacher</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {analytics.total - analytics.withTeachers}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Classes Management</h1>
        <div className="flex space-x-3">
          {selectedClasses.length > 0 && (
            <>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                Delete Selected ({selectedClasses.length})
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
            to="/app/classes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Class
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
              placeholder="Search classes..."
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
                <option value="archived">Archived</option>
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
                {teachers.map(teacher => (
  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
))}

              </select>
            </div>
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Grades</option>
                {[...new Set(classes.map(c => c.grade))].sort().map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
  <option key={subject.id} value={subject.id}>{subject.name}</option>
))}

              </select>
            </div>
            <button
              onClick={() => {
                setFilterInput('');
                setStatusFilter('all');
                setTeacherFilter('all');
                setGradeFilter('all');
                setSubjectFilter('all');
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
                    checked={selectedClasses.length === filteredClasses.length && filteredClasses.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClasses(filteredClasses.map(c => c.id));
                      } else {
                        setSelectedClasses([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grade-Section
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subjects
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    {classes.length === 0 ? (
                      <div className="text-center py-8">
                        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No classes</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          Get started by creating a new class.
                        </p>
                        <div className="mt-6">
                          <Link
                            to="/app/classes/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            New Class
                          </Link>
                        </div>
                      </div>
                    ) : (
                      'No classes match your search criteria'
                    )}
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
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
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">Room {cls.roomNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">Grade {cls.grade}-{cls.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cls.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {cls.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {cls.teacher ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {cls.teacher.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {cls.teacher.name}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.round((cls.currentStudents / cls.capacity) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {cls.currentStudents}/{cls.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {cls.subjects.length > 0 ? (
                          <div className="space-y-1">
                            {cls.subjects.slice(0, 2).map(subject => (
                              <div key={subject.id} className="flex items-center">
                                <span className="text-gray-900 dark:text-white">{subject.name}</span>
                                {subject.teacher && (
                                  <>
                                    <span className="mx-1">-</span>
                                    <span>{subject.teacher}</span>
                                  </>
                                )}
                              </div>
                            ))}
                            {cls.subjects.length > 2 && (
                              <span className="text-xs text-blue-600">+{cls.subjects.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No subjects</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/app/classes/${cls.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/app/classes/${cls.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setClassToDelete(cls.id);
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
              {selectedClasses.length > 1 ? `Delete ${selectedClasses.length} Classes?` : 'Delete Class?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {selectedClasses.length > 1
                ? 'Are you sure you want to delete these classes?'
                : 'Are you sure you want to delete this class?'}
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClassToDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedClasses.length > 1) {
                    bulkDelete();
                  } else {
                    deleteClass(classToDelete);
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

      {/* Warning Modal for Classes with Students */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cannot Delete Class</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  This class has students assigned. Please remove all students before deleting.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setClassToDelete(null);
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

export default Classes;
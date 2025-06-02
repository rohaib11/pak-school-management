import { useState, useMemo, useCallback } from 'react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
  useRowSelect
} from 'react-table'

import { 
  ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, 
  PencilIcon, TrashIcon, EyeIcon, PlusIcon, DocumentArrowDownIcon,
  FunnelIcon, XMarkIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import ExcelJS from 'exceljs'

function Teachers() {
  const navigate = useNavigate()
  const [filterInput, setFilterInput] = useState('')
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  useEffect(() => {
    if (!window?.electronAPI?.invoke) {
      toast.error('Electron API not available')
      console.error('❌ window.electronAPI.invoke is not defined')
      setLoading(false)
      return
    }

    window.electronAPI.invoke('teachers:list')
      .then(data => {
        console.log('📥 Fetched teachers:', data)
        if (Array.isArray(data)) {
          setTeachers(data)
        } else {
          toast.error('Failed to load teachers')
        }
      })
      .catch(err => {
        console.error('❌ IPC fetch error:', err)
        toast.error('Error loading teachers')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const columns = useMemo(
    () => [
      {
        id: 'selection',
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }) => (
          <input type="checkbox" {...row.getToggleRowSelectedProps()} />
        )
      },
      {
        Header: 'Teacher ID',
        accessor: 'id',
        Cell: ({ value }) => (
    <span
      title={value} // show full ID on hover
      className="text-blue-600 truncate block max-w-[120px]"
    >
      {value.slice(0, 8)}...{value.slice(-4)}
    </span>
  )
      },
      {
        Header: 'Teacher Name',
        accessor: 'name',
        Cell: ({ row }) => (
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 overflow-hidden">
                {row.original.photo ? (
                 <img
  src={row.original.photo}
  alt={row.original.name}
  className="h-full w-full object-cover"
  onError={(e) => {
    e.target.onerror = null
    e.target.src = row.original.photoPath
      ? `file://${row.original.photoPath}`
      : `https://ui-avatars.com/api/?name=${row.original.name}`
  }}
/>

                ) : (
                  <span>
                    {row.original.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-800 dark:text-white">{row.original.name}</div>
              <div className="text-gray-500 dark:text-gray-300 truncate max-w-[150px]">
                {row.original.subject}
              </div>
            </div>
          </div>
        )
      },
      {
        Header: 'Subject',
        accessor: 'subject',
        Filter: ({ column }) => (
          <select
            onChange={e => column.setFilter(e.target.value === 'all' ? undefined : e.target.value)}
            className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            <option value="all">All Subjects</option>
            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Computer Science'].map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        )
      },
      {
        Header: 'Qualification',
        accessor: 'qualification',
        Filter: ({ column }) => (
          <select
            onChange={e => column.setFilter(e.target.value === 'all' ? undefined : e.target.value)}
            className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            <option value="all">All Qualifications</option>
            {['MPhil', 'Masters', 'Bachelors', 'PhD'].map(qual => (
              <option key={qual} value={qual}>{qual}</option>
            ))}
          </select>
        )
      },
      {
        Header: 'Experience',
        accessor: 'experience',
        Cell: ({ value }) => `${value} years`
      },
      {
        Header: 'Phone',
        accessor: 'phone',
        Cell: ({ value }) => (
          <span className="truncate max-w-[120px] block" title={value}>
            {value}
          </span>
        )
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 
            value === 'on-leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        ),
        Filter: ({ column }) => (
          <select
            onChange={e => column.setFilter(e.target.value === 'all' ? undefined : e.target.value)}
            className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="resigned">Resigned</option>
          </select>
        )
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/app/teachers/${row.original.id}`)}
              className="text-blue-600 hover:text-blue-900"
              title="View"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/app/teachers/${row.original.id}/edit`)}
              className="text-yellow-600 hover:text-yellow-900"
              title="Edit"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setTeacherToDelete(row.original.id)
                setShowConfirmModal(true)
              }}
              className="text-red-600 hover:text-red-900"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )
      }
    ],
    [navigate]
  )

  const data = useMemo(() => Array.isArray(teachers) ? teachers : [], [teachers])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    setFilter,
    state: { pageIndex, pageSize },
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    selectedFlatRows
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  )

  useEffect(() => {
    setSelectedRows(selectedFlatRows.map(row => row.original.id))
  }, [selectedFlatRows])

  const handleFilterChange = e => {
    const value = e.target.value || undefined
    setGlobalFilter(value)
    setFilterInput(value)
  }

  const deleteTeacher = async () => {
    if (selectedRows.length === 0) return
    setIsDeleting(true)

    try {
      for (const id of selectedRows) {
        const result = await window.electronAPI.invoke('teachers:delete', id)
        if (result.success) {
          setTeachers(prev => prev.filter(teacher => teacher.id !== id))
        }
      }
      toast.success(`${selectedRows.length} teacher(s) deleted`)
    } catch (err) {
      console.error('❌ Error deleting teachers:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setShowConfirmModal(false)
      setTeacherToDelete(null)
      setSelectedRows([])
    }
  }

  const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Teachers')

  // 🎓 School Title Row
  worksheet.mergeCells('A1:H1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = '🏫 Your School Name - Teacher List'
  titleCell.font = {
    name: 'Calibri',
    size: 18,
    bold: true,
    color: { argb: 'FF1F4E78' }
  }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 30

  // 📘 Header Row
  worksheet.columns = [
    { header: 'Teacher ID', key: 'teacherId', width: 25 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Qualification', key: 'qualification', width: 20 },
    { header: 'Experience', key: 'experience', width: 15 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Status', key: 'status', width: 15 }
  ]

  const headerRow = worksheet.getRow(2)
  headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' } // Dark blue header background
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 20

  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  // 🧑‍🏫 Add teacher data rows
  data.forEach((teacher, index) => {
    const row = worksheet.addRow({
      teacherId: teacher.teacherId || teacher.id,
      name: teacher.name,
      subject: teacher.subject,
      qualification: teacher.qualification,
      experience: teacher.experience,
      phone: teacher.phone,
      email: teacher.email,
      status: teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)
    })

    // Alternate row colors
    if (index % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        }
      })
    }

    // Optional: Style status cell
    const statusCell = row.getCell('status')
    if (teacher.status === 'active') {
      statusCell.font = { color: { argb: 'FF006100' }, bold: true }
    } else if (teacher.status === 'on-leave') {
      statusCell.font = { color: { argb: 'FF9C5700' }, bold: true }
    } else {
      statusCell.font = { color: { argb: 'FF9C0006' }, bold: true }
    }
  })

  // ✅ Export
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const timestamp = new Date().toISOString().split('T')[0]
  saveAs(blob, `Teachers_${timestamp}.xlsx`)
}


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading teachers, please wait...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teacher Management</h1>
        <div className="flex space-x-3">
          {selectedRows.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
            >
              Delete Selected ({selectedRows.length})
            </button>
          )}

          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Export
          </button>
          <Link
            to="/app/teachers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Teacher
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filterInput}
              onChange={handleFilterChange}
              placeholder="Search teachers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap space-x-3">
            <Menu as="div" className="relative z-50 inline-block text-left">
              <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Filters
                </Menu.Button>
              </div>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-72 max-h-[400px] overflow-y-auto overflow-x-hidden rounded-md shadow-lg bg-white dark:bg-gray-800 dark:text-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-[1000]">
                  <div className="py-1 px-4 space-y-4">
                    {headerGroups.map(headerGroup =>
                      headerGroup.headers.map(column =>
                        column.Filter ? (
                          <div key={column.id} className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {column.render('Header')}
                            </label>
                            <div className="mt-1">{column.render('Filter')}</div>
                          </div>
                        ) : null
                      )
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFilter('subject', undefined)
                      setFilter('qualification', undefined)
                      setFilter('status', undefined)
                      setGlobalFilter(undefined)
                      setFilterInput('')
                    }}
                    className="w-full text-sm text-left text-blue-600 hover:text-blue-800 py-2 mt-2 mb-2"
                  >
                    Clear All Filters
                  </button>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {column.render('Header')}
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ArrowDownIcon className="ml-2 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowUpIcon className="ml-2 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          ''
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {page.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                page.map(row => {
                  prepareRow(row)
                  const { key, ...restRowProps } = row.getRowProps()
                  return (
                    <tr
                      key={key}
                      {...restRowProps}
                      className="even:bg-gray-50 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                    >
                      {row.cells.map(cell => (
                        <td
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                        >
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{pageIndex * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pageIndex + 1) * pageSize, teachers.length)}
                </span>{' '}
                of <span className="font-medium">{teachers.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">First</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
                <button
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Last</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete {selectedRows.length > 1 ? 'these teachers' : 'this teacher'}?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={deleteTeacher}
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
    </div>
  )
}

export default Teachers
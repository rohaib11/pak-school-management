import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserModal from './AddUserModal';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';



const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'staff', label: 'Staff' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' }
];

function UserRolesPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInput, setFilterInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUserId, setEditingUserId] = useState(null);
  const [tempRole, setTempRole] = useState('');
const [showAddModal, setShowAddModal] = useState(false);
  const fetchUsers = async () => {
    try {
      const dbUsers = await window.electronAPI.invoke('users:list');
      setUsers(dbUsers);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };
useEffect(() => {
  fetchUsers(); // ✅ Use it here

}, []);



 const handleRoleUpdate = async (userId) => {
  try {
    const res = await window.electronAPI.invoke('users:update-role', {
      userId,
      role: tempRole,
    });

    if (res.updated) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: tempRole } : u));
      toast.success('Role updated successfully');
    } else {
      toast.error('No changes made');
    }

    setEditingUserId(null);
  } catch (error) {
    toast.error('Failed to update role');
  }
};

const handleDeleteUser = async (userId) => {
  const confirmed = window.confirm('Are you sure you want to delete this user?');
  if (!confirmed) return;

  try {
    const result = await window.electronAPI.invoke('users:delete', { userId });
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } else {
      toast.error('Failed to delete user');
    }
  } catch (error) {
    toast.error('Error deleting user');
  }
};

  const filteredUsers = users.filter(user => {
    const matchesSearch = filterInput === '' || 
      user.name.toLowerCase().includes(filterInput.toLowerCase()) || 
      user.email.toLowerCase().includes(filterInput.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading users...</p>
      </div>
    );
  }

  return (
    <>

    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Roles Management</h1>
        <div className="flex space-x-3">
         <button
                onClick={() => setShowAddModal(true)}
             className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
               >
             + Add User
               </button>

         
          <button
            onClick={() => {
              setFilterInput('');
              setRoleFilter('all');
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reset Filters
          </button>
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
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Current Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <select
                          value={tempRole}
                          onChange={(e) => setTempRole(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {roleOptions.find(r => r.value === user.role)?.label || user.role}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUserId === user.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleRoleUpdate(user.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                      ) : (
<div className="flex space-x-2">
  <button
    onClick={() => {
      setEditingUserId(user.id);
      setTempRole(user.role);
    }}
    className="text-blue-600 hover:text-blue-900"
    title="Edit Role"
  >
    <PencilIcon className="h-5 w-5" />
  </button>
  <button
    onClick={() => handleDeleteUser(user.id)}
    className="text-red-600 hover:text-red-900"
    title="Delete User"
  >
    <TrashIcon className="h-5 w-5" />
  </button>
</div>

                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Role Descriptions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roleOptions.map((role) => (
              <div key={role.value} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-blue-500" />
                  {role.label}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                  {role.value === 'admin' && 'Full system access including user management'}
                  {role.value === 'teacher' && 'Can manage classes, attendance, and student records'}
                  {role.value === 'accountant' && 'Can manage fees, payments, and financial reports'}
                  {role.value === 'staff' && 'Limited access to specific modules as assigned'}
                  {role.value === 'parent' && 'View-only access to their children\'s information'}
                  {role.value === 'student' && 'View-only access to their own records'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
   <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={fetchUsers}
         roleOptions={roleOptions} // ✅ Add this line
      />
    </div>
    </>
  );
}

export default UserRolesPage;
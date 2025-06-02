import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PrinterIcon, 
  DocumentArrowDownIcon, 
  QrCodeIcon, 
  UserIcon, 
  AcademicCapIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';

// Dummy data - Replace with your SQLite data
const dummyUsers = [
  {
    id: '1',
    name: 'Ali Khan',
    type: 'student',
    class: '10th A',
    rollNumber: '1203',
    bloodGroup: 'B+',
    contact: '0312-3456789',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    expiryDate: '2025-12-31'
  },
  {
    id: '2',
    name: 'Fatima Ahmed',
    type: 'teacher',
    subject: 'Mathematics',
    designation: 'Senior Teacher',
    bloodGroup: 'A+',
    contact: '0333-4567890',
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    joinDate: '2020-06-15',
    expiryDate: '2026-12-31'
  },
  {
    id: '3',
    name: 'Usman Malik',
    type: 'staff',
    department: 'Administration',
    shift: 'Morning',
    bloodGroup: 'O+',
    contact: '0345-6789012',
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    joinDate: '2019-03-10',
    expiryDate: '2025-12-31'
  }
];

const cardTemplates = {
  student: {
    name: 'Student Template',
    backgroundColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    fields: ['photo', 'name', 'type', 'class', 'rollNumber', 'bloodGroup', 'contact', 'expiryDate', 'qr']
  },
  teacher: {
    name: 'Teacher Template',
    backgroundColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    fields: ['photo', 'name', 'type', 'subject', 'designation', 'bloodGroup', 'contact', 'joinDate', 'expiryDate', 'qr']
  },
  staff: {
    name: 'Staff Template',
    backgroundColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    fields: ['photo', 'name', 'type', 'department', 'shift', 'bloodGroup', 'contact', 'joinDate', 'expiryDate', 'qr']
  }
};

const schoolInfo = {
  name: 'Pak School',
  logo: '/logo.png',
  address: '123 Education St, Learning City',
  contact: '042-1234567',
  website: 'www.pakschool.edu.pk'
};

function IDCardsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('student');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardSize, setCardSize] = useState('standard'); // 'standard' or 'compact'
  const [showWatermark, setShowWatermark] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    // Simulate API fetch - Replace with your Electron IPC call
    const fetchUsers = async () => {
      try {
        // Replace with: const data = await window.electronAPI.invoke('users:list-for-idcards');
        setTimeout(() => {
          setUsers(dummyUsers);
          setLoading(false);
        }, 500);
      } catch (error) {
        toast.error('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.type === 'student' && user.class?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.type === 'teacher' && user.subject?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.type === 'staff' && user.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const generateQRContent = (user) => {
    return JSON.stringify({
      id: user.id,
      name: user.name,
      type: user.type,
      validity: user.expiryDate
    });
  };

  const downloadSingleCard = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const cardElement = cardRefs.current[userId];
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: cardSize === 'standard' ? 'landscape' : 'portrait',
        unit: 'mm'
      });

      const imgWidth = cardSize === 'standard' ? 85 : 54;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${user.name}_ID_Card.pdf`);
      toast.success(`ID card for ${user.name} downloaded`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const downloadBatchCards = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: cardSize === 'standard' ? 'landscape' : 'portrait',
        unit: 'mm'
      });

      for (let i = 0; i < selectedUsers.length; i++) {
        const userId = selectedUsers[i];
        const user = users.find(u => u.id === userId);
        const cardElement = cardRefs.current[userId];

        if (user && cardElement) {
          const canvas = await html2canvas(cardElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = cardSize === 'standard' ? 85 : 54;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          if (i < selectedUsers.length - 1) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`ID_Cards_Batch_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`Downloaded ${selectedUsers.length} ID cards`);
    } catch (error) {
      toast.error('Failed to generate batch PDF');
      console.error('Batch PDF error:', error);
    }
  };

  const printCard = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const cardElement = cardRefs.current[userId];
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ID Card - ${user.name}</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      toast.error('Failed to prepare card for printing');
      console.error('Print error:', error);
    }
  };

  const renderCardField = (user, field) => {
    switch (field) {
      case 'photo':
        return (
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img
                src={user.photo || '/default-avatar.png'}
                alt={user.name}
                className="w-24 h-24 rounded-full border-2 border-white shadow-sm object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              {showWatermark && (
                <div className="absolute bottom-0 right-0 bg-white bg-opacity-80 rounded-full p-1">
                  <img src={schoolInfo.logo} alt="School Logo" className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        );
      case 'name':
        return <div className="text-xl font-bold text-center mb-1">{user.name}</div>;
      case 'type':
        return <div className="text-sm font-semibold text-center uppercase mb-2">{user.type}</div>;
      case 'class':
        return (
          <div className="flex justify-between text-sm">
            <span>Class:</span>
            <span className="font-medium">{user.class}</span>
          </div>
        );
      case 'rollNumber':
        return (
          <div className="flex justify-between text-sm">
            <span>Roll No:</span>
            <span className="font-medium">{user.rollNumber}</span>
          </div>
        );
      case 'subject':
        return (
          <div className="flex justify-between text-sm">
            <span>Subject:</span>
            <span className="font-medium">{user.subject}</span>
          </div>
        );
      case 'designation':
        return (
          <div className="flex justify-between text-sm">
            <span>Designation:</span>
            <span className="font-medium">{user.designation}</span>
          </div>
        );
      case 'department':
        return (
          <div className="flex justify-between text-sm">
            <span>Department:</span>
            <span className="font-medium">{user.department}</span>
          </div>
        );
      case 'shift':
        return (
          <div className="flex justify-between text-sm">
            <span>Shift:</span>
            <span className="font-medium">{user.shift}</span>
          </div>
        );
      case 'bloodGroup':
        return (
          <div className="flex justify-between text-sm">
            <span>Blood Group:</span>
            <span className="font-medium">{user.bloodGroup}</span>
          </div>
        );
      case 'contact':
        return (
          <div className="flex justify-between text-sm">
            <span>Contact:</span>
            <span className="font-medium">{user.contact}</span>
          </div>
        );
      case 'joinDate':
        return (
          <div className="flex justify-between text-sm">
            <span>Join Date:</span>
            <span className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
          </div>
        );
      case 'expiryDate':
        return (
          <div className="flex justify-between text-sm">
            <span>Valid Until:</span>
            <span className="font-medium">{new Date(user.expiryDate).toLocaleDateString()}</span>
          </div>
        );
      case 'qr':
        return (
          <div className="flex justify-center mt-2">
            <div className="p-1 bg-white rounded">
              <QRCode 
                value={generateQRContent(user)} 
                size={80} 
                level="H" 
                includeMargin={false} 
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderIDCard = (user) => {
    const template = cardTemplates[user.type] || cardTemplates.student;
    
    return (
      <div
        key={user.id}
        ref={el => cardRefs.current[user.id] = el}
        className={`${template.backgroundColor} ${template.borderColor} ${template.textColor} 
          rounded-lg shadow-md overflow-hidden border-2 ${cardSize === 'standard' ? 'w-96' : 'w-64'} 
          transition-all duration-200 hover:shadow-lg`}
      >
        <div className="p-4">
          {/* School Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img src={schoolInfo.logo} alt="School Logo" className="h-10 mr-2" />
              <div>
                <h3 className="font-bold text-lg">{schoolInfo.name}</h3>
                <p className="text-xs">{schoolInfo.address}</p>
              </div>
            </div>
            {showWatermark && (
              <div className="text-xs italic opacity-70">
                {user.type.toUpperCase()} ID
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="space-y-2">
            {template.fields.map(field => (
              <div key={`${user.id}-${field}`}>
                {renderCardField(user, field)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-dashed text-center text-xs opacity-70">
            {schoolInfo.website} | {schoolInfo.contact}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading ID card data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ID Card Generator</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`inline-flex items-center px-4 py-2 border ${batchMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {batchMode ? (
              <>
                <span>Batch Mode (ON)</span>
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedUsers.length}
                </span>
              </>
            ) : 'Batch Mode'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="student">Student Template</option>
                <option value="teacher">Teacher Template</option>
                <option value="staff">Staff Template</option>
              </select>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Options
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
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setCardSize(cardSize === 'standard' ? 'compact' : 'standard')}
                          className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          Card Size: {cardSize === 'standard' ? 'Standard' : 'Compact'}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setShowWatermark(!showWatermark)}
                          className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          {showWatermark ? 'Hide' : 'Show'} Watermark
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {batchMode && selectedUsers.length > 0 && (
              <button
                onClick={downloadBatchCards}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
                Download {selectedUsers.length} Cards
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {batchMode && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={batchMode ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {batchMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={user.photo} alt={user.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{user.type === 'student' ? user.class : user.type === 'teacher' ? user.subject : user.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.type === 'student' ? (
                          <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
                        ) : user.type === 'teacher' ? (
                          <UserIcon className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <BriefcaseIcon className="h-5 w-5 mr-2 text-purple-500" />
                        )}
                        <span className="capitalize">{user.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {user.type === 'student' ? (
                          <>
                            Roll No: {user.rollNumber} | Blood Group: {user.bloodGroup}
                          </>
                        ) : user.type === 'teacher' ? (
                          <>
                            {user.designation} | Joined: {new Date(user.joinDate).toLocaleDateString()}
                          </>
                        ) : (
                          <>
                            {user.shift} Shift | Joined: {new Date(user.joinDate).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => downloadSingleCard(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => printCard(user.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Print"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        {user.type === 'student' && (
                          <button
                            onClick={() => navigate(`/app/students/${user.id}`)}
                            className="text-green-600 hover:text-green-900"
                            title="View Profile"
                          >
                            <UserIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Preview Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Card Preview</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <div key={`preview-${user.id}`} className="flex flex-col items-center space-y-2">
                  {renderIDCard(user)}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadSingleCard(user.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => printCard(user.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No preview available</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Search for users to see their ID card previews
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IDCardsPage;
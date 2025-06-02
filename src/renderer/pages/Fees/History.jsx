import { useState, useEffect } from 'react';
import {
  CalendarIcon, EyeIcon, ArrowPathIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon,
  DocumentTextIcon, TableCellsIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function History() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptHistory, setReceiptHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    feeType: ''
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);

  const fetchData = async (studentId) => {
    setLoading(true);
    try {
      const [assignData, receiptData] = await Promise.all([
        window.electronAPI.invoke('feeAssignments:getByStudent', studentId),
        window.electronAPI.invoke('receipts:getByStudent', studentId)
      ]);

      setAssignments(assignData || []);
      setReceipts(receiptData || []);
    } catch {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const openReceiptsModal = (feeAssignmentId) => {
    const matched = receipts.filter(r => r.feeAssignmentId === feeAssignmentId);
    setReceiptHistory(matched);
    setShowReceiptModal(true);
  };

  const summary = {
    assigned: assignments.reduce((sum, a) => sum + a.amount, 0),
    paid: receipts.reduce((sum, r) => sum + r.amountPaid, 0),
    discount: assignments.reduce((sum, a) => sum + (a.discountAmount || 0), 0)
  };
  summary.due = summary.assigned - summary.paid - summary.discount;

  const exportExcel = () => {
    const data = assignments.map(a => ({
      'Fee Type': a.feeName,
      'Assigned': a.amount,
      'Paid': receipts
        .filter(r => r.feeAssignmentId === a.id)
        .reduce((sum, r) => sum + r.amountPaid, 0),
      'Discount': a.discountAmount || 0,
      'Due': a.amount - (a.discountAmount || 0) - receipts
        .filter(r => r.feeAssignmentId === a.id)
        .reduce((sum, r) => sum + r.amountPaid, 0),
      'Status': a.status,
      'Due Date': a.dueDate
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'History');
    XLSX.writeFile(wb, `fee_history_${selectedStudentId}.xlsx`);
    toast.success('Excel exported');
  };

  useEffect(() => {
    (async () => {
      const studentList = await window.electronAPI.invoke('students:list');
      setStudents(studentList);
    })();
  }, []);

  useEffect(() => {
    if (selectedStudentId) fetchData(selectedStudentId);
  }, [selectedStudentId]);

  const filteredAssignments = assignments.filter(a => {
    if (filters.dateFrom && a.dueDate < filters.dateFrom) return false;
    if (filters.dateTo && a.dueDate > filters.dateTo) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (filters.feeType && !a.feeName.toLowerCase().includes(filters.feeType.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee History</h1>
        <div className="flex space-x-2">
          <button onClick={exportExcel} className="px-4 py-2 bg-white dark:bg-gray-800 border text-sm rounded-md flex items-center">
            <TableCellsIcon className="h-5 w-5 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Student Selector */}
      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300">Select Student</label>
        <select
          className="w-full mt-1 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {selectedStudentId && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded">
            <div className="text-gray-500 text-sm">Assigned</div>
            <div className="text-xl font-bold">{formatCurrency(summary.assigned)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded">
            <div className="text-gray-500 text-sm">Paid</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(summary.paid)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded">
            <div className="text-gray-500 text-sm">Discount</div>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(summary.discount)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded">
            <div className="text-gray-500 text-sm">Pending</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(summary.due)}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Fee Type</th>
                <th className="px-4 py-2 text-left text-sm">Assigned</th>
                <th className="px-4 py-2 text-left text-sm">Discount</th>
                <th className="px-4 py-2 text-left text-sm">Paid</th>
                <th className="px-4 py-2 text-left text-sm">Due</th>
                <th className="px-4 py-2 text-left text-sm">Due Date</th>
                <th className="px-4 py-2 text-left text-sm">Status</th>
                <th className="px-4 py-2 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(a => {
                const paid = receipts
                  .filter(r => r.feeAssignmentId === a.id)
                  .reduce((sum, r) => sum + r.amountPaid, 0);
                const due = a.amount - (a.discountAmount || 0) - paid;
                return (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{a.feeName}</td>
                    <td className="px-4 py-2">{formatCurrency(a.amount)}</td>
                    <td className="px-4 py-2 text-yellow-600">{formatCurrency(a.discountAmount || 0)}</td>
                    <td className="px-4 py-2 text-green-600">{formatCurrency(paid)}</td>
                    <td className="px-4 py-2 text-red-600">{formatCurrency(due)}</td>
                    <td className="px-4 py-2">{a.dueDate}</td>
                    <td className="px-4 py-2">
                      {due <= 0 ? (
                        <span className="text-green-600 inline-flex items-center"><CheckCircleIcon className="h-4 w-4 mr-1" />Paid</span>
                      ) : paid > 0 ? (
                        <span className="text-yellow-600 inline-flex items-center"><ClockIcon className="h-4 w-4 mr-1" />Partial</span>
                      ) : (
                        <span className="text-red-600 inline-flex items-center"><XCircleIcon className="h-4 w-4 mr-1" />Unpaid</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => openReceiptsModal(a.id)} className="text-blue-600 hover:underline">
                        <EyeIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Receipts Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Receipt History</h2>
            <button onClick={() => setShowReceiptModal(false)} className="text-sm float-right text-red-500 mb-4">Close</button>
            {receiptHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No receipts found.</p>
            ) : (
              <ul className="space-y-3">
                {receiptHistory.map(r => (
                  <li key={r.id} className="border p-2 rounded text-sm">
                    <div><strong>Date:</strong> {r.date}</div>
                    <div><strong>Amount:</strong> {formatCurrency(r.amountPaid)}</div>
                    <div><strong>Method:</strong> {r.paymentMethod}</div>
                    <div><strong>Ref No:</strong> {r.referenceNo || '—'}</div>
                    <div><strong>Notes:</strong> {r.notes || '—'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

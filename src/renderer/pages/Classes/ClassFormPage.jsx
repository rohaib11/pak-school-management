import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ClassForm from '../../components/ClassForm';

const ClassFormPage = ({ isEdit = false }) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      if (isEdit && id) {
        try {
          const data = await window.electronAPI.invoke('classes:get', id);
          setInitialData(data);
        } catch {
          toast.error('Failed to load class');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id, isEdit]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Loading class data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? 'Edit Class' : 'Create New Class'}
      </h1>

      {!initialData && isEdit && (
        <p className="text-red-500 mb-4">Class not found or failed to load.</p>
      )}

      <ClassForm isEdit={isEdit} initialData={initialData} />
    </div>
  );
};

export default ClassFormPage;

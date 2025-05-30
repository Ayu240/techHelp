import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, Download, Trash2, Filter, 
  DollarSign, Stethoscope, Building2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Document } from '../../lib/supabase';

export default function DocumentsPage() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('public:documents')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'documents',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        fetchDocuments();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase, user]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('category', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setDocuments(data as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase
        .storage
        .from(document.category === 'financial' ? 'financial_documents' :
              document.category === 'medical' ? 'medical_documents' :
              'government_documents')
        .download(`private/${document.file_url}`);
      
      if (error) throw error;
      
      // Create a download link
      const blob = new Blob([data], { type: document.file_type });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const deleteDocument = async (document: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from(document.category === 'financial' ? 'financial_documents' :
              document.category === 'medical' ? 'medical_documents' :
              'government_documents')
        .remove([`private/${document.file_url}`]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) throw dbError;
      
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'medical':
        return <Stethoscope className="h-5 w-5 text-emerald-600" />;
      case 'government':
        return <Building2 className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-blue-100';
      case 'medical':
        return 'bg-emerald-100';
      case 'government':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Document Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access and manage all your uploaded documents in one place
          </p>
        </div>

        {/* Document Categories */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Financial Documents</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {documents.filter(d => d.category === 'financial').length}
                </h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Medical Documents</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {documents.filter(d => d.category === 'medical').length}
                </h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Government Documents</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {documents.filter(d => d.category === 'government').length}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input py-1 px-3 h-9"
              >
                <option value="all">All Categories</option>
                <option value="financial">Financial</option>
                <option value="medical">Medical</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${getCategoryColor(document.category)}`}>
                            {getCategoryIcon(document.category)}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {document.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          document.category === 'financial' ? 'bg-blue-100 text-blue-800' :
                          document.category === 'medical' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {document.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(document.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          document.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => downloadDocument(document)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDocument(document)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No documents found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Upload documents from the respective service pages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
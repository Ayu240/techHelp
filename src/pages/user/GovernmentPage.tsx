import { useState, useEffect, FormEvent } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusCircle, Building2, FileText, Upload, X, Download,
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { CertificateRequest } from '../../lib/supabase';

const certificateTypes = [
  'Birth Certificate',
  'Income Certificate',
  'Residence Certificate',
  'Marriage Certificate',
  'Property Tax Certificate',
  'Business License',
  'Police Clearance',
  'Other'
];

export default function GovernmentPage() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form states
  const [certificateType, setCertificateType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('public:certificate_requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'certificate_requests',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        fetchRequests();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase, user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('certificate_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setRequests(data as CertificateRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRequest = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!certificateType) {
      toast.error('Please select a certificate type');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('certificate_requests')
        .insert([
          {
            user_id: user?.id,
            certificate_type: certificateType,
            purpose,
            status: 'pending',
            requested_at: new Date().toISOString(),
          }
        ]);
      
      if (error) throw error;
      
      toast.success('Certificate request submitted successfully');
      resetForm();
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const uploadDocument = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentName) {
      toast.error('Please provide a file and document name');
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('government_documents')
        .upload(`private/${fileName}`, file);
      
      if (storageError) throw storageError;
      
      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user?.id,
            name: documentName,
            file_url: storageData.path,
            file_type: file.type,
            category: 'government',
          }
        ]);
      
      if (documentError) throw documentError;
      
      toast.success('Document uploaded successfully');
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCertificate = async (url: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('certificates')
        .download(`private/${url}`);
      
      if (error) throw error;
      
      // Create a download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'certificate.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const resetForm = () => {
    setCertificateType('');
    setPurpose('');
  };

  const resetUploadForm = () => {
    setFile(null);
    setDocumentName('');
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Government Services</h1>
            <p className="mt-1 text-sm text-gray-500">
              Request certificates and manage government documents
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary btn-md flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-outline btn-md flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Certificate Requests */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Certificate Requests</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input py-1 px-3 h-9"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6  py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
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
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {request.certificate_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.purpose || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'approved' && request.issued_certificate_url && (
                          <button
                            onClick={() => downloadCertificate(request.issued_certificate_url!)}
                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No certificate requests found</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Submit your first request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Request Certificate</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={submitRequest}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="certificate-type" className="block text-sm font-medium text-gray-700">
                    Certificate Type
                  </label>
                  <select
                    id="certificate-type"
                    required
                    className="input mt-1"
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                  >
                    <option value="">Select certificate type</option>
                    {certificateTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Purpose (Optional)
                  </label>
                  <textarea
                    id="purpose"
                    rows={3}
                    className="input mt-1"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Explain why you need this certificate"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upload Government Document</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={uploadDocument}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="document-name" className="block text-sm font-medium text-gray-700">
                    Document Name
                  </label>
                  <input
                    id="document-name"
                    type="text"
                    required
                    className="input mt-1"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., Passport Copy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Document File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG, DOCX up to 10MB</p>
                    </div>
                  </div>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected file: {file.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                        <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
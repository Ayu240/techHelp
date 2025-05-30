import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { 
  FileText, Search, Filter, CheckCircle, XCircle,
  Download, Upload, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { CertificateRequest } from '../../lib/supabase';

export default function RequestsManagement() {
  const { supabase } = useSupabase();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('public:certificate_requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'certificate_requests' 
      }, () => {
        fetchRequests();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('certificate_requests')
        .select('*, profiles(full_name)')
        .order('requested_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('certificate_requests')
        .update({ 
          status,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const uploadCertificate = async () => {
    if (!file || !selectedRequest) {
      toast.error('Please select a file');
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedRequest.user_id}/${Date.now()}.${fileExt}`;
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('certificates')
        .upload(`private/${fileName}`, file);
      
      if (storageError) throw storageError;
      
      // Update request with certificate URL
      const { error: updateError } = await supabase
        .from('certificate_requests')
        .update({
          issued_certificate_url: fileName,
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;
      
      toast.success('Certificate uploaded successfully');
      setIsUploadModalOpen(false);
      setSelectedRequest(null);
      setFile(null);
      fetchRequests();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.certificate_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Certificate Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and process certificate requests
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-xs">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-1 px-3 h-9"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {request.certificate_type}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.purpose || 'No purpose specified'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(request.profiles as any)?.full_name}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Requested: {new Date(request.requested_at).toLocaleDateString()}</div>
                        {request.processed_at && (
                          <div>Processed: {new Date(request.processed_at).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsUploadModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Upload Certificate"
                              >
                                <Upload className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateRequestStatus(request.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {request.issued_certificate_url && (
                            <button
                              onClick={() => {
                                // Download certificate logic
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Download Certificate"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Certificate Modal */}
      {isUploadModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Certificate</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload the certificate for {selectedRequest.certificate_type}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Certificate File (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="certificate-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="certificate-upload"
                        name="certificate-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedRequest(null);
                  setFile(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={uploadCertificate}
                disabled={!file || isUploading}
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
                  'Upload Certificate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
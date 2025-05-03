import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, X, Edit, ChevronRight, ChevronLeft, FileText, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function ProviderDocumentsModal({ provider, onClose, refetch }) {
    const [approvingDocId, setApprovingDocId] = useState(null);
    const [rejectingDocId, setRejectingDocId] = useState(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApproveDocument = async (docId) => {
        setApprovingDocId(docId);
        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/providers/approve-document',
                { document_id: docId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Document approved successfully", { duration: 2000 });
            refetch(); // Refetch data to update the UI
            onClose(); // Close the modal after successful action
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setApprovingDocId(null);
        }
    };

    const handleRejectDocument = async () => {
        if (!selectedDocId) return;

        setRejectingDocId(selectedDocId);
        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/providers/reject-document',
                {
                    document_id: selectedDocId,
                    rejection_reason: rejectionReason
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Document rejected successfully", { duration: 2000 });
            setShowRejectForm(false);
            refetch(); // Refetch data to update the UI
            onClose(); // Close the modal after successful action
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setRejectingDocId(null);
            setRejectionReason('');
        }
    };

    const openRejectForm = (docId) => {
        setSelectedDocId(docId);
        setShowRejectForm(true);
    };

    const statusBadge = (status) => {
        const statusClass = status === 'active'
            ? 'bg-[#009379] text-white'
            : status === 'inactive'
                ? 'bg-[#930002] text-white'
                : 'bg-yellow-500 text-white';

        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center capitalize`}>
                {status}
            </span>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            Documents for {provider.user.first_name} {provider.user.last_name}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Reject Form Modal */}
                    {showRejectForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-medium mb-4">Reject Document</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rejection Reason
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowRejectForm(false)}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectDocument}
                                        disabled={rejectingDocId === selectedDocId}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        {rejectingDocId === selectedDocId ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            'Reject'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        {provider.documents.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No documents found for this provider
                            </div>
                        ) : (
                            provider.documents.map((doc) => (
                                <div key={doc.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">
                                                {doc.required_document?.name || doc.deleted_document_name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {statusBadge(doc.status)}
                                                {doc.rejection_reason && (
                                                    <span className="text-xs text-gray-500">
                                                        Reason: {doc.rejection_reason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`https://api.sehtnaa.com/storage/${doc.document_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FileText size={18} />
                                            </a>
                                        </div>
                                    </div>

                                    {doc.status === 'pending' && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleApproveDocument(doc.id)}
                                                disabled={approvingDocId === doc.id}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                                            >
                                                {approvingDocId === doc.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Approve
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openRejectForm(doc.id)}
                                                disabled={rejectingDocId === doc.id}
                                                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                                            >
                                                {rejectingDocId === doc.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <>
                                                        <XCircle size={16} />
                                                        Reject
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ProviderTable({ providers, loading, title, refetch }) {
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        email: '',
        phone: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [togglingProviderId, setTogglingProviderId] = useState(null);


    const handleToggleStatus = async (providerId, currentStatus) => {
        setTogglingProviderId(providerId);
        try {
            const newStatus = currentStatus == 'active' ? 'de-active' : 'active';
            await axios.post(
                'https://api.sehtnaa.com/api/admin/providers/change-status',
                {
                    provider_id: providerId,
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(`Provider ${newStatus}d successfully`, { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setTogglingProviderId(null);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleShowDocuments = (provider) => {
        setSelectedProvider(provider);
        setShowDocumentsModal(true);
    };

    // Filter providers based on all filter criteria
    const filteredProviders = providers?.filter(provider => {
        const fullName = `${provider.user.first_name} ${provider.user.last_name}`.toLowerCase();
        return (
            (filters.global === '' ||
                fullName.includes(filters.global.toLowerCase()) ||
                provider.user.email.toLowerCase().includes(filters.global.toLowerCase()) ||
                provider.user.phone.toLowerCase().includes(filters.global.toLowerCase()) ||
                provider.user.status.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.name === '' ||
                fullName.includes(filters.name.toLowerCase())) &&
            (filters.email === '' ||
                provider.user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
            (filters.phone === '' ||
                provider.user.phone.toLowerCase().includes(filters.phone.toLowerCase())) &&
            (filters.status === '' ||
                provider.user.status.toLowerCase().includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
    const paginatedProviders = filteredProviders.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (status) => {
        const statusClass = status === 'active'
            ? 'bg-[#009379] text-white'
            : 'bg-[#930002] text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {status}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredProviders.length)} of{' '}
                    {filteredProviders.length} entries
                </div>
                <div className="flex gap-1">
                    <Button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{title} ({filteredProviders.length})</h2>

            <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
                {/* Global Search */}
                <div className="p-4 border-b">
                    <InputText
                        value={filters.global}
                        onChange={(e) => handleFilterChange('global', e.target.value)}
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={(e) => handleFilterChange('email', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Phone"
                                        value={filters.phone}
                                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Status"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documents
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-3 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Loading providers...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedProviders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-3 py-4 text-center">
                                        No providers found
                                    </td>
                                </tr>
                            ) : (
                                paginatedProviders.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="font-medium">
                                                {provider.user.first_name} {provider.user.last_name}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {provider.user.email}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {provider.user.phone}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {statusBadge(provider.user.status)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleShowDocuments(provider)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">

                                            {provider.user.status !== ''  && (
                                                <Tooltip
                                                    content={togglingProviderId === provider.id ? 'Updating...' :
                                                        provider.user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    closeDelay={0}
                                                    delay={700}
                                                >
                                                    <button
                                                        onClick={() => handleToggleStatus(provider.id, provider.user.status)}
                                                        disabled={togglingProviderId === provider.id}
                                                        className={`${provider.user.status === 'active' ? 'text-red-500' : 'text-green-500'
                                                            } hover:opacity-80`}
                                                    >
                                                        {togglingProviderId === provider.id ? (
                                                            <Loader2 className="animate-spin" size={18} />
                                                        ) : provider.user.status === 'active' ? (
                                                            <X size={18} />
                                                        ) : (
                                                            <Check size={18} />
                                                        )}
                                                    </button>
                                                </Tooltip>
                                            )}

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && renderPagination()}
            </div>

            {/* Documents Modal */}
            {showDocumentsModal && selectedProvider && (
                <ProviderDocumentsModal
                    provider={selectedProvider}
                    onClose={() => {
                        setShowDocumentsModal(false);
                        refetch(); // Additional refetch when modal closes
                    }}
                    refetch={refetch}
                />
            )}
        </div>
    );
}

export default function ProvidersDataTable({ providers, loading, refetch }) {
    return (
        <div className="p-4">

            <ProviderTable
                providers={providers?.individual || []}
                loading={loading}
                title="Individual Providers"
                refetch={refetch}
            />

            <ProviderTable
                providers={providers?.organizational || []}
                loading={loading}
                title="Organizational Providers"
                refetch={refetch}
            />
        </div>
    );
}
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, X, Edit, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ComplaintsDataTable({ complaints, loading, refetch }) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        global: '',
        subject: '',
        service: '',
        provider: '',
        customer: '',
        status: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updatingComplaintId, setUpdatingComplaintId] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        status: 'open',
        response: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleShowDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setShowDetailsModal(true);
    };

    const handleUpdateFormChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateComplaint = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        setUpdatingComplaintId(selectedComplaint.id);
        try {
            await axios.put(
                `https://api.sehtnaa.com/api/admin/complaints/${selectedComplaint.id}/status`,
                updateForm,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );

            toast.success(t("complaints.complaintUpdatedSuccessfully"), { duration: 2000 });
            setShowUpdateModal(false);
            setShowDetailsModal(false);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t("complaints.unexpectedError"), { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setUpdatingComplaintId(null);
        }
    };

    const statusBadge = (status) => {
        const statusClass = status === 'open'
            ? 'bg-red-100 text-red-800'
            : status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800';

        const statusText = status === 'open'
            ? t("common.open")
            : status === 'in_progress'
                ? t("complaints.inProgress")
                : t("complaints.resolved");

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass} capitalize`}>
                {statusText}
            </span>
        );
    };

    const providerTypeBadge = (type) => {
        const typeClass = type === 'individual'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800';
        const typeText = type === 'individual'
            ? t("complaints.individual")
            : t("complaints.company");
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClass} capitalize`}>
                {typeText}
            </span>
        );
    };

    // Filter complaints based on all filter criteria
    const filteredComplaints = complaints?.filter(complaint => {
        const providerName = complaint.request?.assigned_provider
            ? `${complaint.request.assigned_provider.user.first_name} ${complaint.request.assigned_provider.user.last_name}`
            : '';
        const customerName = `${complaint.user.first_name} ${complaint.user.last_name}`;
        const serviceName = complaint.request?.service?.name?.en || '';

        return (
            (filters.global === '' ||
                complaint.subject.toLowerCase().includes(filters.global.toLowerCase()) ||
                complaint.status.toLowerCase().includes(filters.global.toLowerCase()) ||
                serviceName.toLowerCase().includes(filters.global.toLowerCase()) ||
                providerName.toLowerCase().includes(filters.global.toLowerCase()) ||
                customerName.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.subject === '' ||
                complaint.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
            (filters.service === '' ||
                serviceName.toLowerCase().includes(filters.service.toLowerCase())) &&
            (filters.provider === '' ||
                providerName.toLowerCase().includes(filters.provider.toLowerCase())) &&
            (filters.customer === '' ||
                customerName.toLowerCase().includes(filters.customer.toLowerCase())) &&
            (filters.status === '' ||
                complaint.status.toLowerCase().includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);
    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    {t("complaints.showingEntries").replace('{start}', (currentPage - 1) * rowsPerPage + 1).replace('{end}', Math.min(currentPage * rowsPerPage, filteredComplaints.length)).replace('{total}', filteredComplaints.length)}
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
                        {t("complaints.pageOf").replace('{current}', currentPage).replace('{total}', totalPages)}
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
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search */}
            <div className="p-4 border-b">
                <InputText
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder={t("complaints.searchComplaints")}
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
                                    placeholder={t("complaints.subject")}
                                    value={filters.subject}
                                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t("complaints.service")}
                                    value={filters.service}
                                    onChange={(e) => handleFilterChange('service', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t("complaints.provider")}
                                    value={filters.provider}
                                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t("complaints.customer")}
                                    value={filters.customer}
                                    onChange={(e) => handleFilterChange('customer', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t("complaints.status")}
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("complaints.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t("complaints.loadingComplaints")}
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedComplaints.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    {t("complaints.noComplaintsFound")}
                                </td>
                            </tr>
                        ) : (
                            paginatedComplaints.map((complaint) => (
                                <tr key={complaint.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium">{complaint.subject}</div>
                                        <div className="text-gray-500 text-xs line-clamp-1">{complaint.description}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {complaint.request?.service?.name?.en || 'N/A'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {complaint.request?.assigned_provider ? (
                                            <div>
                                                <div>{complaint.request.assigned_provider.user.first_name} {complaint.request.assigned_provider.user.last_name}</div>
                                                <div>{providerTypeBadge(complaint.request.assigned_provider.provider_type)}</div>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {complaint.user.first_name} {complaint.user.last_name}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {statusBadge(complaint.status)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content={t("complaints.viewDetailsTooltip")} closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => handleShowDetails(complaint)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip content={t("complaints.updateStatusTooltip")} closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-green-500 ring-0"
                                                    onClick={() => {
                                                        setSelectedComplaint(complaint);
                                                        setUpdateForm({
                                                            status: complaint.status,
                                                            response: complaint.response || ''
                                                        });
                                                        setShowUpdateModal(true);
                                                    }}
                                                >
                                                    <Check size={18} />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && renderPagination()}

            {/* Complaint Details Modal */}
            {showDetailsModal && selectedComplaint && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDetailsModal(false)}
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
                                <h2 className="text-xl font-bold">{t("complaints.complaintDetails")}</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-700">{t("complaints.subject")}</h3>
                                    <p>{selectedComplaint.subject}</p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-700">{t("common.description")}</h3>
                                    <p className="whitespace-pre-line">{selectedComplaint.description}</p>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.status")}</h3>
                                        <div>{statusBadge(selectedComplaint.status)}</div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.response")}</h3>
                                        <p className="whitespace-pre-line">{selectedComplaint.response || t("complaints.noResponseYet")}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.service")}</h3>
                                        <p>{selectedComplaint.request?.service?.name?.en || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.provider")}</h3>
                                        {selectedComplaint.request?.assigned_provider ? (
                                            <div>
                                                <p>{selectedComplaint.request.assigned_provider.user.first_name} {selectedComplaint.request.assigned_provider.user.last_name}</p>
                                                <div>{providerTypeBadge(selectedComplaint.request.assigned_provider.provider_type)}</div>
                                            </div>
                                        ) : 'N/A'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.customer")}</h3>
                                        <p>{selectedComplaint.user.first_name} {selectedComplaint.user.last_name}</p>
                                    </div>


                                    <div>
                                        <h3 className="font-medium text-gray-700">{t("complaints.complainedAt")}</h3>
                                        <p className="whitespace-pre-line">{selectedComplaint.created_at.substring(0, 10)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setUpdateForm({
                                                status: selectedComplaint.status,
                                                response: selectedComplaint.response || ''
                                            });
                                            setShowUpdateModal(true);
                                        }}
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                    >
                                        {t("complaints.updateStatusTooltip")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Update Complaint Modal */}
            {showUpdateModal && selectedComplaint && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowUpdateModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t("complaints.updateComplaintStatus")}</h2>
                            <form onSubmit={handleUpdateComplaint}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("complaints.status")}</label>
                                    <select
                                        name="status"
                                        value={updateForm.status}
                                        onChange={handleUpdateFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="open">{t("common.open")}</option>
                                        <option value="in_progress">{t("complaints.inProgress")}</option>
                                        <option value="resolved">{t("complaints.resolved")}</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("complaints.response")}</label>
                                    <textarea
                                        name="response"
                                        value={updateForm.response}
                                        onChange={handleUpdateFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        {t("common.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingComplaintId === selectedComplaint.id}
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                    >
                                        {updatingComplaintId === selectedComplaint.id ? (
                                            <Loader2 className="animate-spin mx-auto" size={18} />
                                        ) : (
                                            t("complaints.update")
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
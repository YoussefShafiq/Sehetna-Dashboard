import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Loader2, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Campaigns() {
    const [filters, setFilters] = useState({
        global: '',
        title: '',
        message: '',
        user_type: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        user_type: 'customer'
    });

    function getCampaignsData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/notifications/campaigns`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: CampaignsData, isLoading: isCampaignsLoading, isError: isCampaignsError, refetch } = useQuery({
        queryKey: ['CampaignsData'],
        queryFn: getCampaignsData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await axios.post(
                'https://api.sehtnaa.com/api/admin/notifications/campaigns',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(res.data.message, { duration: 2000 });
            setShowAddModal(false);
            setFormData({
                title: '',
                body: '',
                user_type: 'customer'
            });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setIsCreating(false);
        }
    };

    // Filter campaigns based on filter criteria
    const filteredCampaigns = CampaignsData?.data?.data?.filter(campaign => {
        const campaignStatus = campaign.failed_count === '0' ? 'success' : 'failed';
        return (
            (filters.global === '' ||
                campaign.title.toLowerCase().includes(filters.global.toLowerCase()) ||
                campaign.body.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.title === '' || campaign.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.message === '' || campaign.body.toLowerCase().includes(filters.message.toLowerCase())) &&  // Add this line
            (filters.status === '' || campaignStatus.includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredCampaigns.length / rowsPerPage);
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (sent, failed) => {
        const isSuccess = failed === '0';
        const statusClass = isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
        const statusText = isSuccess ? 'Success' : 'Failed';

        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {statusText}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredCampaigns.length)} of{' '}
                    {filteredCampaigns.length} entries
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

    if (isCampaignsError) {
        return <div className="p-4 text-red-500">Error loading campaigns data</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Campaigns Management</h1>

            <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
                {/* Global Search and Add Button */}
                <div className="p-4 border-b flex justify-between items-center gap-4">
                    <InputText
                        value={filters.global}
                        onChange={(e) => handleFilterChange('global', e.target.value)}
                        placeholder="Search campaigns..."
                        className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                    />
                    <Button
                        icon={<Plus size={18} />}
                        label="Create Campaign"
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-[#267192] transition-all  text-white px-3 py-2 rounded-xl shadow-sm min-w-max"
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
                                        placeholder="Title"
                                        value={filters.title}
                                        onChange={(e) => handleFilterChange('title', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Message"
                                        value={filters.message}
                                        onChange={(e) => handleFilterChange('message', e.target.value)}
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
                                    Stats
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {isCampaignsLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-3 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Loading campaigns...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedCampaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-3 py-4 text-center">
                                        No campaigns found
                                    </td>
                                </tr>
                            ) : (
                                paginatedCampaigns.map((campaign) => (
                                    <tr key={campaign.campaign_id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="font-medium">{campaign.title}</div>
                                            <div className="text-gray-500 text-xs">ID: {campaign.campaign_id}</div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="max-w-xs truncate">
                                                {campaign.body}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {statusBadge(campaign.sent_count, campaign.failed_count)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs">Total: {campaign.total_notifications}</span>
                                                <span className="text-xs text-green-500">Sent: {campaign.sent_count}</span>
                                                <span className="text-xs text-red-500">Failed: {campaign.failed_count}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {new Date(campaign.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isCampaignsLoading && renderPagination()}

                {/* Add Campaign Modal */}
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
                                <form onSubmit={handleCreateCampaign}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea
                                            name="body"
                                            value={formData.body}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                                        <select
                                            name="user_type"
                                            value={formData.user_type}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="provider">Provider</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                            disabled={isCreating}
                                        >
                                            {isCreating ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Campaign'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
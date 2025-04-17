import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Requests() {
    const [filters, setFilters] = useState({
        global: '',
        customer: '',
        service: '',
        provider: '',
        status: '',
        date: '',
        address: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    function getRequestsData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/requests`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: RequestsData, isLoading: isRequestsLoading, isError: isRequestsError, refetch } = useQuery({
        queryKey: ['RequestsData'],
        queryFn: getRequestsData,
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    // Filter requests based on filter criteria
    const filteredRequests = RequestsData?.data?.data?.filter(request => {
        const customerName = `${request.customer?.first_name || ''} ${request.customer?.last_name || ''}`.toLowerCase();
        const providerName = `${request.assigned_provider?.first_name || ''} ${request.assigned_provider?.last_name || ''}`.toLowerCase();
        const serviceName = request.service?.name?.en?.toLowerCase() || '';
        const requestStatus = request.status.toLowerCase();
        const requestDate = new Date(request.created_at).toLocaleDateString();
        const requestAddress = request.address.toLowerCase();

        return (
            (filters.global === '' ||
                customerName.includes(filters.global.toLowerCase()) ||
                serviceName.includes(filters.global.toLowerCase()) ||
                providerName.includes(filters.global.toLowerCase()) ||
                requestStatus.includes(filters.global.toLowerCase()) ||
                requestAddress.includes(filters.global.toLowerCase())) &&
            (filters.customer === '' || customerName.includes(filters.customer.toLowerCase())) &&
            (filters.service === '' || serviceName.includes(filters.service.toLowerCase())) &&
            (filters.provider === '' || providerName.includes(filters.provider.toLowerCase())) &&
            (filters.status === '' || requestStatus.includes(filters.status.toLowerCase())) &&
            (filters.date === '' || requestDate.includes(filters.date)) &&
            (filters.address === '' || requestAddress.includes(filters.address.toLowerCase()))  // Add this for dedicated address filter
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (status) => {
        let statusClass = '';
        switch (status) {
            case 'pending':
                statusClass = 'bg-yellow-500 text-white';
                break;
            case 'completed':
                statusClass = 'bg-green-500 text-white';
                break;
            case 'cancelled':
                statusClass = 'bg-red-500 text-white';
                break;
            case 'in_progress':
                statusClass = 'bg-blue-500 text-white';
                break;
            default:
                statusClass = 'bg-gray-500 text-white';
        }

        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusClass} min-w-24 text-center capitalize`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredRequests.length)} of{' '}
                    {filteredRequests.length} entries
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

    if (isRequestsError) {
        return <div className="p-4 text-red-500">Error loading requests data</div>;
    }

    return (
        <div className="p-4">
            <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
                {/* Global Search */}
                <div className="p-4 border-b">
                    <InputText
                        value={filters.global}
                        onChange={(e) => handleFilterChange('global', e.target.value)}
                        placeholder="Search requests..."
                        className="px-3 py-2 rounded-xl shadow-sm focus:ring-2 w-full"
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
                                        placeholder="Customer"
                                        value={filters.customer}
                                        onChange={(e) => handleFilterChange('customer', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Service"
                                        value={filters.service}
                                        onChange={(e) => handleFilterChange('service', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Provider"
                                        value={filters.provider}
                                        onChange={(e) => handleFilterChange('provider', e.target.value)}
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
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={filters.address}  // Add address to filters state
                                        onChange={(e) => handleFilterChange('address', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="text"
                                        placeholder="Date"
                                        value={filters.date}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Feedback
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {isRequestsLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Loading requests...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-4 text-center">
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {request.customer?.first_name} {request.customer?.last_name}
                                            <div className="text-gray-500 text-xs">{request.customer?.phone}</div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {request.service?.name?.en}
                                            <div className="text-gray-500 text-xs">${request.service?.price}</div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {request.assigned_provider ? (
                                                <>
                                                    {request.assigned_provider.first_name} {request.assigned_provider.last_name}
                                                    <div className="text-gray-500 text-xs capitalize">
                                                        {request.assigned_provider.provider_type}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {statusBadge(request.status)}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="max-w-xs truncate">
                                                {request.address}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            {request.feedbacks?.length > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">
                                                        {'★'.repeat(request.feedbacks[0].rating)}
                                                        {'☆'.repeat(5 - request.feedbacks[0].rating)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({request.feedbacks[0].rating}/5)
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No feedback</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isRequestsLoading && renderPagination()}
            </div>
        </div>
    );
}
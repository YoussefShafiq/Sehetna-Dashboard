import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader, Loader2, X } from 'lucide-react';

export default function UsersDataTable({ users, loading, onStatusToggle }) {
    const [filters, setFilters] = useState({
        global: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [togglingUserId, setTogglingUserId] = useState(null);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleToggleClick = async (userId) => {
        setTogglingUserId(userId);
        try {
            await onStatusToggle(userId);
            toast.success("User status updated", { duration: 2000 });
        } catch (error) {
            toast.error("Failed to update status", { duration: 3000 });
        } finally {
            setTogglingUserId(null);
        }
    };

    // Filter users based on all filter criteria
    const filteredUsers = users.filter(user => {
        return (
            (filters.global === '' ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(filters.global.toLowerCase()) ||
                user.email.toLowerCase().includes(filters.global.toLowerCase()) ||
                user.phone.toLowerCase().includes(filters.global.toLowerCase()) ||
                user.status.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.first_name === '' || user.first_name.toLowerCase().includes(filters.first_name.toLowerCase())) &&
            (filters.last_name === '' || user.last_name.toLowerCase().includes(filters.last_name.toLowerCase())) &&
            (filters.email === '' || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
            (filters.phone === '' || user.phone.toLowerCase().includes(filters.phone.toLowerCase())) &&
            (filters.gender === '' || user.gender.toLowerCase().includes(filters.gender.toLowerCase())) &&
            (filters.status === '' || user.status.toLowerCase().includes(filters.status.toLowerCase()))
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (status) => {
        const statusClass = status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                {status}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4">
                <div>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} entries
                </div>
                <div className="flex gap-1">
                    <Button
                        icon="pi pi-angle-double-left"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1"
                    />
                    <Button
                        icon="pi pi-angle-left"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1"
                    />
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        icon="pi pi-angle-right"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1"
                    />
                    <Button
                        icon="pi pi-angle-double-right"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1"
                    />
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
                    placeholder="Search users..."
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
                                    placeholder="First name"
                                    value={filters.first_name}
                                    onChange={(e) => handleFilterChange('first_name', e.target.value)}
                                    className="text-xs p-1 border rounded"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    value={filters.last_name}
                                    onChange={(e) => handleFilterChange('last_name', e.target.value)}
                                    className="text-xs p-1 border rounded"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Email"
                                    value={filters.email}
                                    onChange={(e) => handleFilterChange('email', e.target.value)}
                                    className="text-xs p-1 border rounded"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={filters.phone}
                                    onChange={(e) => handleFilterChange('phone', e.target.value)}
                                    className="text-xs p-1 border rounded"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Gender"
                                    value={filters.gender}
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    className="text-xs p-1 border rounded w-20"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Status"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="text-xs p-1 border rounded w-32"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-3 py-4 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-3 py-4 text-center">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {user.first_name}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {user.last_name}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {user.email}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {user.phone}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {user.gender}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {statusBadge(user.status)}
                                            <Tooltip
                                                content={togglingUserId === user.id ? 'Updating...' :
                                                    `${user.status === 'active' ? 'Deactivate' : 'Activate'} user`}
                                                closeDelay={0}
                                                delay={700}
                                            >

                                                <Button
                                                    // icon={`pi pi-${user.status === 'active' ? 'times' : 'check'}`}
                                                    className={`${user.status === 'active' ? 'text-red-500' : 'text-green-500'} ring-0`}
                                                    onClick={() => handleToggleClick(user.id)}
                                                    disabled={togglingUserId === user.id}
                                                // loading={togglingUserId === user.id}
                                                >
                                                    {togglingUserId === user.id ? <Loader2 size={18} className='animate-spin' /> :

                                                        <>
                                                            {user.status === 'active' ? <X /> : <Check />}
                                                        </>
                                                    }
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString()}
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
    );
}
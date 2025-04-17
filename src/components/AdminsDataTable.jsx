import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, Plus, Trash2, X, Edit, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminsDataTable({ admins, loading, refetch }) {
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        email: '',
        role: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [togglingAdminEmail, setTogglingAdminEmail] = useState(null);
    const [deletingAdminEmail, setDeletingAdminEmail] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [updatingAdmin, setUpdatingAdmin] = useState(false);

    // Form state for add/edit
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin'
    });
    const [errors, setErrors] = useState({});

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleToggleStatus = async (email, currentStatus) => {
        setTogglingAdminEmail(email);
        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/toggle-status',
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(`Admin ${currentStatus === 'active' ? 'deactivated' : 'activated'}`, { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status", { duration: 3000 });
        } finally {
            setTogglingAdminEmail(null);
        }
    };

    const handleDeleteClick = (email) => {
        setAdminToDelete(email);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!adminToDelete) return;

        setDeletingAdminEmail(adminToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/delete-admin',
                { email: adminToDelete },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            toast.success("Admin deleted successfully", { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message, { duration: 3000 });
        } finally {
            setDeletingAdminEmail(null);
            setAdminToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.role) newErrors.role = 'Role is required';

        // Only require password for new admin creation
        if (!showEditModal && !formData.password) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setUpdatingAdmin(true);
        if (!validateForm()) return;

        // Create a copy of formData without password if it's empty
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/create-admin',
                payload, // Use the modified payload
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );

            setUpdatingAdmin(false);
            toast.success("Admin added successfully", { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
            toast.error(error.response?.data?.message || "Failed to add admin", { duration: 3000 });
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setUpdatingAdmin(true);
        if (!validateForm()) return;

        // Create a copy of formData without password if it's empty
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        try {
            await axios.post(
                `https://api.sehtnaa.com/api/admin/update-admin`,
                payload, // Use the modified payload
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingAdmin(false);
            toast.success("Admin updated successfully", { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
            toast.error(error.response?.data?.message || "Failed to update admin", { duration: 3000 });
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            password: '',
            role: 'admin'
        });
        setErrors({});
    };

    const prepareEditForm = (admin) => {
        setSelectedAdmin(admin);
        setFormData({
            first_name: admin.first_name,
            last_name: admin.last_name,
            email: admin.email,
            phone: admin.phone,
            role: admin.admin.role,
            password: '' // Don't pre-fill password for security
        });
        setShowEditModal(true);
    };

    // Filter admins based on all filter criteria
    const filteredAdmins = admins?.filter(admin => {
        const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase();
        return (
            (filters.global === '' ||
                fullName.includes(filters.global.toLowerCase()) ||
                admin.email.toLowerCase().includes(filters.global.toLowerCase()) ||
                admin.phone.includes(filters.global)) &&
            (filters.name === '' || fullName.includes(filters.name.toLowerCase())) &&
            (filters.email === '' || admin.email.toLowerCase().includes(filters.email.toLowerCase())) &&
            (filters.role === '' || admin.admin.role.includes(filters.role.toLowerCase())) &&
            (filters.status === '' || admin.status.includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
    const paginatedAdmins = filteredAdmins.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (status) => {
        const statusClass = status === 'active'
            ? 'bg-[#009379] text-white'
            : 'bg-[#930002] text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {status === 'active' ? 'Active' : 'Inactive'}
            </span>
        );
    };

    const roleBadge = (role) => {
        const roleClass = role === 'super_admin'
            ? 'bg-purple-600 text-white'
            : role === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${roleClass} min-w-16 text-center`}>
                {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Mod'}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredAdmins.length)} of{' '}
                    {filteredAdmins.length} entries
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
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <InputText
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search admins..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:ring-2 w-full border border-primary"
                />
                <Button
                    icon={<Plus size={18} />}
                    label="Add Admin"
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-xl shadow-sm min-w-max"
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
                                    placeholder="Role"
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
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
                                        Loading admins...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedAdmins.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    No admins found
                                </td>
                            </tr>
                        ) : (
                            paginatedAdmins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {admin.profile_image && (
                                                <img
                                                    src={`https://api.sehtnaa.com/storage/${admin.profile_image}`}
                                                    alt="Admin profile"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{admin.first_name} {admin.last_name}</div>
                                                <div className="text-gray-500 text-xs">{admin.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {admin.email}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {roleBadge(admin.admin.role)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {statusBadge(admin.status)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Edit admin" closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => prepareEditForm(admin)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={togglingAdminEmail === admin.email ? 'Updating...' :
                                                    `${admin.status === 'active' ? 'Deactivate' : 'Activate'} admin`}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className={`${admin.status === 'active' ? 'text-red-500' : 'text-green-500'} ring-0`}
                                                    onClick={() => handleToggleStatus(admin.email, admin.status)}
                                                    disabled={togglingAdminEmail === admin.email}
                                                >
                                                    {togglingAdminEmail === admin.email ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        admin.status === 'active' ? <X /> : <Check />
                                                    )}
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={deletingAdminEmail === admin.email ? 'Deleting...' : 'Delete admin'}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className="text-red-500 ring-0"
                                                    onClick={() => handleDeleteClick(admin.email)}
                                                    disabled={deletingAdminEmail === admin.email}
                                                >
                                                    {deletingAdminEmail === admin.email ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
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

            {/* Add Admin Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
                            <form onSubmit={handleAddAdmin}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'add Admin'}

                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Admin Modal */}
            {showEditModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Admin</h2>
                            <form onSubmit={handleUpdateAdmin}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                                            required
                                            disabled
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password (leave blank to keep current)
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder="Leave empty to keep current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                            {selectedAdmin?.admin?.role === 'super_admin' && (
                                                <option value="super_admin">Super Admin</option>
                                            )}
                                        </select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Update Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Delete Admin</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this admin? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
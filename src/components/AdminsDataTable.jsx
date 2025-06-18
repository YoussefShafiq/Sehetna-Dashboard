import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, Plus, Trash2, X, Edit, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminsDataTable({ admins, loading, refetch }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
            toast.success(currentStatus === 'active' ? t('admins.adminDeactivated') : t('admins.adminActivated'), { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
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
            toast.success(t('admins.adminDeletedSuccessfully'), { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
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
        if (!formData.first_name) newErrors.first_name = t('admins.firstName') + ' ' + t('common.required');
        if (!formData.last_name) newErrors.last_name = t('admins.lastName') + ' ' + t('common.required');
        if (!formData.email) newErrors.email = t('common.email') + ' ' + t('common.required');
        if (!formData.phone) newErrors.phone = t('common.phone') + ' ' + t('common.required');
        if (!formData.role) newErrors.role = t('admins.role') + ' ' + t('common.required');

        // Only require password for new admin creation
        if (!showEditModal && !formData.password) newErrors.password = t('login.password') + ' ' + t('common.required');

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
            toast.success(t('admins.adminAddedSuccessfully'), { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
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
            toast.success(t('admins.adminUpdatedSuccessfully'), { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
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
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {status === 'active' ? t('common.active') : t('common.inactive')}
            </span>
        );
    };

    const roleBadge = (role) => {
        const roleClass = role === 'super_admin'
            ? 'bg-purple-600 text-white'
            : role === 'admin'
                ? 'bg-primary text-white'
                : 'bg-green-600 text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${roleClass} min-w-16 text-center`}>
                {role === 'super_admin' ? t('admins.superAdmin') : role === 'admin' ? t('admins.admin') : t('admins.moderator')}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    {t('admins.showingEntries', {
                        start: (currentPage - 1) * rowsPerPage + 1,
                        end: Math.min(currentPage * rowsPerPage, filteredAdmins.length),
                        total: filteredAdmins.length
                    })}
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
                        {t('admins.pageOf', { current: currentPage, total: totalPages })}
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
                    placeholder={t('admins.searchAdmins')}
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                <Button
                    icon={<Plus size={18} />}
                    label={t('admins.addAdmin')}
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
                                    placeholder={t('common.name')}
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t('common.email')}
                                    value={filters.email}
                                    onChange={(e) => handleFilterChange('email', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t('admins.role')}
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t('common.status')}
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t('admins.loadingAdmins')}
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedAdmins.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    {t('admins.noAdminsFound')}
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
                                            <Tooltip content={t('admins.editAdminTooltip')} closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => prepareEditForm(admin)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={togglingAdminEmail === admin.email ? t('admins.updating') :
                                                    admin.status === 'active' ? t('admins.deactivateAdminTooltip') : t('admins.activateAdminTooltip')}
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
                                                content={deletingAdminEmail === admin.email ? t('admins.deleting') : t('admins.deleteAdminTooltip')}
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
                            <h2 className="text-xl font-bold mb-4">{t('admins.addNewAdmin')}</h2>
                            <form onSubmit={handleAddAdmin}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.firstName')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.lastName')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.role')}</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="admin">{t('admins.admin')}</option>
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
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? <Loader2 className="animate-spin mx-auto" size={18} /> : t('admins.addAdmin')}

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
                            <h2 className="text-xl font-bold mb-4">{t('admins.editAdmin')}</h2>
                            <form onSubmit={handleUpdateAdmin}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.firstName')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.lastName')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')}</label>
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
                                            {t('admins.newPassword')}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder={t('admins.passwordPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admins.role')}</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="admin">{t('admins.admin')}</option>
                                            {selectedAdmin?.admin?.role === 'super_admin' && (
                                                <option value="super_admin">{t('admins.superAdmin')}</option>
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
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? <Loader2 className="animate-spin mx-auto" size={18} /> : t('admins.updateAdmin')}
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
                                    <h3 className="text-lg font-medium text-gray-900">{t('admins.deleteAdminConfirm')}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {t('admins.deleteAdminMessage')}
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
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
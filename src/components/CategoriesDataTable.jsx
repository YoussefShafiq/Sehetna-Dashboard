import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, Plus, Trash2, X, Edit, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CategoriesDataTable({ categories, loading, refetch }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        order: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [togglingCategoryId, setTogglingCategoryId] = useState(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [updatingCategory, setUpdatingCategory] = useState(false);

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        order: '',
        is_active: true,
        is_multiple: false
    });
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleToggleStatus = async (categoryId, currentStatus) => {
        setTogglingCategoryId(categoryId);
        try {
            await axios.post(
                `https://api.sehtnaa.com/api/categories/${categoryId}/toggle-status`,
                { is_active: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(t('categories.categoryStatusUpdated'), { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setTogglingCategoryId(null);
        }
    };

    const handleDeleteClick = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setDeletingCategoryId(categoryToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://api.sehtnaa.com/api/categories/${categoryToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(t('categories.categoryDeletedSuccessfully'), { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setDeletingCategoryId(null);
            setCategoryToDelete(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconFile(file);
                setIconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setIconFile(null);
        setIconPreview('');
    };

    const handleFormChange = (e, lang = null) => {
        const { name, value } = e.target;

        if (name.includes('name') || name.includes('description')) {
            const field = name.split('[')[0];
            const langKey = name.split('[')[1].replace(']', '');

            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [langKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'is_active' ? e.target.checked : value
            }));
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setUpdatingCategory(true);
        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name[en]', formData.name.en);
            formDataToSend.append('name[ar]', formData.name.ar);
            formDataToSend.append('description[en]', formData.description.en);
            formDataToSend.append('description[ar]', formData.description.ar);
            formDataToSend.append('order', formData.order);
            formDataToSend.append('is_multiple', formData.is_multiple ? 1 : 0);


            // Append file if it exists
            if (iconFile) formDataToSend.append('icon', iconFile);

            await axios.post(
                'https://api.sehtnaa.com/api/categories',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingCategory(false);
            toast.success(t('categories.categoryAddedSuccessfully'), { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingCategory(false);
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        setUpdatingCategory(true);
        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name[en]', formData.name.en);
            formDataToSend.append('name[ar]', formData.name.ar);
            formDataToSend.append('description[en]', formData.description.en);
            formDataToSend.append('description[ar]', formData.description.ar);
            formDataToSend.append('order', formData.order);
            formDataToSend.append('is_active', formData.is_active ? 1 : 0);
            formDataToSend.append('is_multiple', formData.is_multiple ? 1 : 0);
            formDataToSend.append('_method', 'POST');

            // Append file if it exists
            if (iconFile) formDataToSend.append('icon', iconFile);

            await axios.post(
                `https://api.sehtnaa.com/api/categories/${selectedCategory.id}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingCategory(false);
            toast.success(t('categories.categoryUpdatedSuccessfully'), { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingCategory(false);
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            order: '',
            is_active: true
        });
        setIconFile(null);
        setIconPreview('');
    };

    const prepareEditForm = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            order: category.order,
            is_active: category.is_active,
            is_multiple: category.is_multiple
        });
        // Reset file state
        setIconFile(null);
        // Set preview from existing image
        setIconPreview(category.icon ? `https://api.sehtnaa.com/storage/${category.icon}` : '');
        setShowEditModal(true);
    };

    // Filter categories based on all filter criteria
    const filteredCategories = categories?.filter(category => {
        return (
            (filters.global === '' ||
                category.name.en.toLowerCase().includes(filters.global.toLowerCase()) ||
                category.name.ar.toLowerCase().includes(filters.global.toLowerCase()) ||
                category.order.toString().includes(filters.global)) &&
            (filters.name === '' ||
                category.name.en.toLowerCase().includes(filters.name.toLowerCase()) ||
                category.name.ar.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.order === '' || category.order.toString().includes(filters.order)) &&
            (filters.status === '' || (category.is_active ? 'active' : 'inactive').includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (isActive) => {
        const statusClass = isActive
            ? 'bg-[#009379] text-white'
            : 'bg-[#930002] text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {isActive ? t('common.active') : t('common.inactive')}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    {t('categories.showingEntries', {
                        start: (currentPage - 1) * rowsPerPage + 1,
                        end: Math.min(currentPage * rowsPerPage, filteredCategories.length),
                        total: filteredCategories.length
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
                        {t('categories.pageOf', { current: currentPage, total: totalPages })}
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
                    placeholder={t('categories.searchCategories')}
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                <Button
                    icon={<Plus size={18} />}
                    label={t('categories.addCategory')}
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
                                    placeholder={t('categories.order')}
                                    value={filters.order}
                                    onChange={(e) => handleFilterChange('order', e.target.value)}
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
                                <td colSpan="4" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t('categories.loadingCategories')}
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedCategories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-3 py-4 text-center">
                                    {t('categories.noCategoriesFound')}
                                </td>
                            </tr>
                        ) : (
                            paginatedCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {category.icon && (
                                                <img
                                                    src={`https://api.sehtnaa.com/storage/${category.icon}`}
                                                    alt="Category icon"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{category.name.en}</div>
                                                <div className="text-gray-500 text-xs">{category.name.ar}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {category.order}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {statusBadge(category.is_active)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content={t('categories.editCategoryTooltip')} closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => prepareEditForm(category)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={togglingCategoryId === category.id ? t('categories.updating') :
                                                    category.is_active ? t('categories.deactivateCategoryTooltip') : t('categories.activateCategoryTooltip')}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className={`${category.is_active ? 'text-red-500' : 'text-green-500'} ring-0`}
                                                    onClick={() => handleToggleStatus(category.id, category.is_active)}
                                                    disabled={togglingCategoryId === category.id}
                                                >
                                                    {togglingCategoryId === category.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        category.is_active ? <X /> : <Check />
                                                    )}
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={deletingCategoryId === category.id ? t('categories.deleting') : t('categories.deleteCategoryTooltip')}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className="text-red-500 ring-0"
                                                    onClick={() => handleDeleteClick(category.id)}
                                                    disabled={deletingCategoryId === category.id}
                                                >
                                                    {deletingCategoryId === category.id ? (
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

            {/* Add Category Modal */}
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
                            <h2 className="text-xl font-bold mb-4">{t('categories.addNewCategory')}</h2>
                            <form onSubmit={handleAddCategory}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.nameEnglish')}</label>
                                        <input
                                            type="text"
                                            name="name[en]"
                                            value={formData.name.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.nameArabic')}</label>
                                        <input
                                            type="text"
                                            name="name[ar]"
                                            value={formData.name.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.descriptionEnglish')}</label>
                                        <textarea
                                            name="description[en]"
                                            value={formData.description.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.descriptionArabic')}</label>
                                        <textarea
                                            name="description[ar]"
                                            value={formData.description.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.order')}</label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.icon')}</label>
                                        <div className="flex items-center gap-2">
                                            {iconPreview ? (
                                                <div className="relative">
                                                    <img src={iconPreview} alt="Icon preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500">{t('categories.uploadIcon')}</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="is_multiple"
                                        checked={formData.is_multiple}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        {t('categories.allowMultipleSelections')}
                                    </label>
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
                                        disabled={updatingCategory}
                                    >
                                        {updatingCategory ? <Loader2 className="animate-spin mx-auto" size={18} /> : t('categories.addCategory')}

                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Category Modal */}
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
                            <h2 className="text-xl font-bold mb-4">{t('categories.editCategoryTitle')}</h2>
                            <form onSubmit={handleEditCategory}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.nameEnglish')}</label>
                                        <input
                                            type="text"
                                            name="name[en]"
                                            value={formData.name.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.nameArabic')}</label>
                                        <input
                                            type="text"
                                            name="name[ar]"
                                            value={formData.name.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.descriptionEnglish')}</label>
                                        <textarea
                                            name="description[en]"
                                            value={formData.description.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.descriptionArabic')}</label>
                                        <textarea
                                            name="description[ar]"
                                            value={formData.description.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.order')}</label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.icon')}</label>
                                        <div className="flex items-center gap-2">
                                            {iconPreview && (
                                                <div className="relative">
                                                    <img src={iconPreview} alt="Icon preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                <div className="flex flex-col items-center justify-center">
                                                    <ImageIcon size={20} className="text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {iconPreview ? t('categories.changeIcon') : t('categories.uploadIcon')}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="is_multiple"
                                        checked={formData.is_multiple}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        {t('categories.allowMultipleSelections')}
                                    </label>
                                </div>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        {t('categories.activeCategory')}
                                    </label>
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
                                        disabled={updatingCategory}
                                    >
                                        {updatingCategory ? <Loader2 className="animate-spin mx-auto" size={18} /> : t('categories.editCategory')}
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
                                    <h3 className="text-lg font-medium text-gray-900">{t('categories.deleteCategoryConfirm')}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {t('categories.deleteCategoryMessage')}
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
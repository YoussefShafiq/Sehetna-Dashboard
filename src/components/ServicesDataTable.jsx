import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, Plus, Trash2, X, Edit, Image as ImageIcon, ChevronRight, ChevronLeft, List } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function ServicesDataTable({ services, loading, refetch, categories }) {
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        category: '',
        price: '',
        provider_type: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [togglingServiceId, setTogglingServiceId] = useState(null);
    const [deletingServiceId, setDeletingServiceId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [showRequirementsModal, setShowRequirementsModal] = useState(false);
    const [requirements, setRequirements] = useState([]);
    const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
    const [showEditRequirementModal, setShowEditRequirementModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [requirementForm, setRequirementForm] = useState({
        name: { en: '', ar: '' },
        type: 'input'
    });
    const [isDeleting, setisDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        provider_type: 'individual',
        price: '',
        category_id: '',
        is_active: true
    });
    const [iconFile, setIconFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');
    const [coverPreview, setCoverPreview] = useState('');


    const fetchRequirements = async (service) => {
        // After refetch, services will be updated, so we can get the fresh requirements
        const updatedService = services.find(s => s.id === service.id);
        setRequirements(updatedService?.requirements || []);
    };

    const handleShowRequirements = (service) => {
        setSelectedService(service);
        fetchRequirements(service);
        setShowRequirementsModal(true);
    };

    const handleAddRequirement = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `https://api.sehtnaa.com/api/services/${selectedService.id}/requirements`,
                requirementForm,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Requirement added successfully", { duration: 2000 });
            await refetch(); // Wait for services to be refetched
            fetchRequirements(selectedService); // Then update requirements from fresh services data
            setShowAddRequirementModal(false);
            setRequirementForm({
                name: { en: '', ar: '' },
                type: 'input'
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleEditRequirement = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `https://api.sehtnaa.com/api/services/requirements/${selectedRequirement.id}`,
                {
                    ...requirementForm,
                    _method: 'POST'
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Requirement updated successfully", { duration: 2000 });
            await refetch(); // Wait for services to be refetched
            fetchRequirements(selectedService); // Then update requirements from fresh services data
            setShowEditRequirementModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    useEffect(() => {
        if (showRequirementsModal && selectedService) {
            fetchRequirements(selectedService);
        }
    }, [services, showRequirementsModal, selectedService]);

    const handleDeleteRequirement = async (requirementId) => {
        try {
            await axios.delete(
                `https://api.sehtnaa.com/api/services/requirements/${requirementId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Requirement deleted successfully", { duration: 2000 });
            await refetch(); // Wait for services to be refetched
            fetchRequirements(selectedService); // Then update requirements from fresh services data
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const prepareEditRequirement = (requirement) => {
        setSelectedRequirement(requirement);
        setRequirementForm({
            name: requirement.name,
            type: requirement.type
        });
        setShowEditRequirementModal(true);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleToggleStatus = async (serviceId, currentStatus) => {
        setTogglingServiceId(serviceId);
        try {
            await axios.post(
                `https://api.sehtnaa.com/api/services/${serviceId}`,
                { is_active: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Service status updated", { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setTogglingServiceId(null);
        }
    };

    const handleDeleteClick = (serviceId) => {
        setServiceToDelete(serviceId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;

        setDeletingServiceId(serviceToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://api.sehtnaa.com/api/services/${serviceToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success("Service deleted successfully", { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setDeletingServiceId(null);
            setServiceToDelete(null);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'icon') {
                    setIconFile(file);
                    setIconPreview(reader.result);
                } else {
                    setCoverFile(file);
                    setCoverPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (type) => {
        if (type === 'icon') {
            setIconFile(null);
            setIconPreview('');
        } else {
            setCoverFile(null);
            setCoverPreview('');
        }
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

    const handleAddService = async (e) => {
        setIsAdding(true);
        e.preventDefault();
        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name[en]', formData.name.en);
            formDataToSend.append('name[ar]', formData.name.ar);
            formDataToSend.append('description[en]', formData.description.en);
            formDataToSend.append('description[ar]', formData.description.ar);
            formDataToSend.append('provider_type', formData.provider_type);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category_id', formData.category_id);

            // Append files if they exist
            if (iconFile) formDataToSend.append('icon', iconFile);
            if (coverFile) formDataToSend.append('cover_photo', coverFile);

            await axios.post(
                'https://api.sehtnaa.com/api/services',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setIsAdding(false);
            toast.success("Service added successfully", { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setIsAdding(false);
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleEditService = async (e) => {
        setIsEditing(true);
        e.preventDefault();
        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name[en]', formData.name.en);
            formDataToSend.append('name[ar]', formData.name.ar);
            formDataToSend.append('description[en]', formData.description.en);
            formDataToSend.append('description[ar]', formData.description.ar);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('provider_type', formData.provider_type);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('is_active', formData.is_active ? 1 : 0);
            formDataToSend.append('_method', 'POST'); // For Laravel to recognize as PUT request

            // Append files if they exist
            if (iconFile) formDataToSend.append('icon', iconFile);
            if (coverFile) formDataToSend.append('cover_photo', coverFile);

            await axios.post(
                `https://api.sehtnaa.com/api/services/${selectedService.id}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setIsEditing(false);
            toast.success("Service updated successfully", { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setIsEditing(false);
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
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
            provider_type: 'individual',
            price: '',
            category_id: '',
            is_active: true
        });
        setIconFile(null);
        setCoverFile(null);
        setIconPreview('');
        setCoverPreview('');
    };

    const prepareEditForm = (service) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            description: service.description,
            provider_type: service.provider_type,
            price: service.price,
            category_id: service.category_id,
            is_active: service.is_active
        });
        // Reset file states
        setIconFile(null);
        setCoverFile(null);
        // Set previews from existing images
        setIconPreview(service.icon ? `https://api.sehtnaa.com/storage/${service.icon}` : '');
        setCoverPreview(service.cover_photo ? `https://api.sehtnaa.com/storage/${service.cover_photo}` : '');
        setShowEditModal(true);
    };

    // Filter services based on all filter criteria
    const filteredServices = services?.filter(service => {
        return (
            (filters.global === '' ||
                service.name.en.toLowerCase().includes(filters.global.toLowerCase()) ||
                service.name.ar.toLowerCase().includes(filters.global.toLowerCase()) ||
                service.category.name.en.toLowerCase().includes(filters.global.toLowerCase()) ||
                service.price.toString().includes(filters.global)) &&
            (filters.name === '' ||
                service.name.en.toLowerCase().includes(filters.name.toLowerCase()) ||
                service.name.ar.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.category === '' ||
                service.category.name.en.toLowerCase().includes(filters.category.toLowerCase()) ||
                service.category.name.ar.toLowerCase().includes(filters.category.toLowerCase())) &&
            (filters.price === '' || service.price.toString().includes(filters.price)) &&
            (filters.provider_type === '' || service.provider_type.toLowerCase().includes(filters.provider_type.toLowerCase())) &&
            (filters.status === '' || (service.is_active ? 'active' : 'inactive').includes(filters.status.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredServices.length / rowsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const statusBadge = (isActive) => {
        const statusClass = isActive
            ? 'bg-[#009379] text-white'
            : 'bg-[#930002] text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredServices.length)} of{' '}
                    {filteredServices.length} entries
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
                    >
                        <ChevronLeft />
                    </Button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        icon="pi pi-angle-right"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1"
                    >
                        <ChevronRight />
                    </Button>
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
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <InputText
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search services..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:ring-2 border-primary border w-full"
                />
                <Button
                    icon={<Plus size={18} />}
                    label="Add Service"
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
                                    placeholder="Category"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Price"
                                    value={filters.price}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Provider Type"
                                    value={filters.provider_type}
                                    onChange={(e) => handleFilterChange('provider_type', e.target.value)}
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
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Loading services...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedServices.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    No services found
                                </td>
                            </tr>
                        ) : (
                            paginatedServices.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {service.icon && (
                                                <img
                                                    src={`https://api.sehtnaa.com/storage/${service.icon}`}
                                                    alt="Service icon"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{service.name.en}</div>
                                                <div className="text-gray-500 text-xs">{service.name.ar}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {service.category.name.en}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {service.price} EGP
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap capitalize">
                                        {service.provider_type}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {statusBadge(service.is_active)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Service requirements" closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-purple-500 ring-0"
                                                    onClick={() => handleShowRequirements(service)}
                                                >
                                                    <List size={18} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Edit service" closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => prepareEditForm(service)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={togglingServiceId === service.id ? 'Updating...' :
                                                    `${service.is_active ? 'Deactivate' : 'Activate'} service`}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className={`${service.is_active ? 'text-red-500' : 'text-green-500'} ring-0`}
                                                    onClick={() => handleToggleStatus(service.id, service.is_active)}
                                                    disabled={togglingServiceId === service.id}
                                                >
                                                    {togglingServiceId === service.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        service.is_active ? <X /> : <Check />
                                                    )}
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={deletingServiceId === service.id ? 'Deleting...' : 'Delete service'}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className="text-red-500 ring-0"
                                                    onClick={() => handleDeleteClick(service.id)}
                                                    disabled={deletingServiceId === service.id}
                                                >
                                                    {deletingServiceId === service.id ? (
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

            {/* Add Service Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
                            <form onSubmit={handleAddService}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                                        <textarea
                                            name="description[en]"
                                            value={formData.description.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
                                        <textarea
                                            name="description[ar]"
                                            value={formData.description.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
                                        <select
                                            name="provider_type"
                                            value={formData.provider_type}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="organizationalal">Organizatialonalal</option>
                                            al                                      </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md `}
                                            required
                                        >
                                            <option value="" disabled >Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name.en}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                        <div className="flex items-center gap-2">
                                            {iconPreview ? (
                                                <div className="relative">
                                                    <img src={iconPreview} alt="Icon preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('icon')}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500">Upload Icon</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, 'icon')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
                                        <div className="flex items-center gap-2">
                                            {coverPreview ? (
                                                <div className="relative">
                                                    <img src={coverPreview} alt="Cover preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('cover')}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500">Upload Cover</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, 'cover')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 "
                                        disabled={isAdding}
                                    >
                                        {isAdding ? <><Loader2 className="animate-spin" size={18} /></> : 'Add Service'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Service Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Edit Service</h2>
                            <form onSubmit={handleEditService}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                                        <textarea
                                            name="description[en]"
                                            value={formData.description.en}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
                                        <textarea
                                            name="description[ar]"
                                            value={formData.description.ar}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
                                        <select
                                            name="provider_type"
                                            value={formData.provider_type}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"

                                        >
                                            <option value="individual">Individual</option>
                                            <option value="organizational">Organizational</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleFormChange}
                                            className={`w-full px-3 py-2 border rounded-md `}
                                            required
                                        >
                                            <option value="" disabled >Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name.en}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                        <div className="flex items-center gap-2">
                                            {iconPreview && (
                                                <div className="relative">
                                                    <img src={iconPreview} alt="Icon preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('icon')}
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
                                                        {iconPreview ? 'Change Icon' : 'Upload Icon'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'icon')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
                                        <div className="flex items-center gap-2">
                                            {coverPreview && (
                                                <div className="relative">
                                                    <img src={coverPreview} alt="Cover preview" className="w-16 h-16 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('cover')}
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
                                                        {coverPreview ? 'Change Cover' : 'Upload Cover'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'cover')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
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
                                        Active Service
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
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        disabled={isEditing}
                                    >
                                        {isEditing ? <><Loader2 className="animate-spin" size={18} /></> : 'Update'}
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete Service</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this service? This action cannot be undone.
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

            {/* Requirements Modal */}
            {showRequirementsModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRequirementsModal(false)}
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
                                <h2 className="text-xl font-bold">Service Requirements</h2>
                                <div className="flex gap-2">
                                    <Button
                                        icon={<Plus size={18} />}
                                        label="Add Requirement"
                                        onClick={() => setShowAddRequirementModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-xl shadow-sm min-w-max"
                                    />
                                    <Button
                                        icon={<X size={18} />}
                                        onClick={() => setShowRequirementsModal(false)}
                                        className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (EN)</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (AR)</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                        {requirements.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-3 py-4 text-center">
                                                    No requirements found
                                                </td>
                                            </tr>
                                        ) : (
                                            requirements.map((requirement) => (
                                                <tr key={requirement.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-4 whitespace-nowrap">{requirement.name.en}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap">{requirement.name.ar}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap capitalize">{requirement.type}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Tooltip content="Edit requirement" closeDelay={0} delay={700}>
                                                                <Button
                                                                    className="text-blue-500 ring-0"
                                                                    onClick={() => prepareEditRequirement(requirement)}
                                                                >
                                                                    <Edit size={18} />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="Delete requirement" closeDelay={0} delay={700}>
                                                                <Button
                                                                    className="text-red-500 ring-0"
                                                                    onClick={() => handleDeleteRequirement(requirement.id)}
                                                                >
                                                                    <Trash2 size={18} />
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
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Add Requirement Modal */}
            {showAddRequirementModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddRequirementModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Add New Requirement</h2>
                            <form onSubmit={handleAddRequirement}>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                                        <input
                                            type="text"
                                            name="name.en"
                                            value={requirementForm.name.en}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                name: {
                                                    ...prev.name,
                                                    en: e.target.value
                                                }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
                                        <input
                                            type="text"
                                            name="name.ar"
                                            value={requirementForm.name.ar}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                name: {
                                                    ...prev.name,
                                                    ar: e.target.value
                                                }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            name="type"
                                            value={requirementForm.type}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                type: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="input">Input</option>
                                            <option value="file">File</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddRequirementModal(false)}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Add Requirement
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Requirement Modal */}
            {showEditRequirementModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowEditRequirementModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Requirement</h2>
                            <form onSubmit={handleEditRequirement}>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                                        <input
                                            type="text"
                                            name="name.en"
                                            value={requirementForm.name.en}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                name: {
                                                    ...prev.name,
                                                    en: e.target.value
                                                }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
                                        <input
                                            type="text"
                                            name="name.ar"
                                            value={requirementForm.name.ar}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                name: {
                                                    ...prev.name,
                                                    ar: e.target.value
                                                }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            name="type"
                                            value={requirementForm.type}
                                            onChange={(e) => setRequirementForm(prev => ({
                                                ...prev,
                                                type: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="input">Input</option>
                                            <option value="file">File</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditRequirementModal(false)}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Update Requirement
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
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';
import { Check, Loader2, Plus, Trash2, X, Edit, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DocumentsDataTable({ documents, loading, refetch }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        provider_type: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [togglingDocId, setTogglingDocId] = useState(null);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [updatingDocument, setUpdatingDocument] = useState(false);
    const queryClient = useQueryClient();

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: '',
        provider_type: 'individual'
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

    const handleAddDocument = async (e) => {
        e.preventDefault();
        setUpdatingDocument(true);
        try {
            await axios.post(
                'https://api.sehtnaa.com/api/admin/providers/add-document',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingDocument(false);
            toast.success(t("documents.documentAddedSuccessfully"), { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingDocument(false);
            toast.error(error.response?.data?.message || t("common.unexpectedError"), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleEditDocument = async (e) => {
        e.preventDefault();
        setUpdatingDocument(true);
        try {
            await axios.post(
                `https://api.sehtnaa.com/api/admin/providers/required-documents/${selectedDocument.id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingDocument(false);
            toast.success(t("documents.documentUpdatedSuccessfully"), { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingDocument(false);
            toast.error(error.response?.data?.message || t("common.unexpectedError"), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleDeleteClick = (docId) => {
        setDocumentToDelete(docId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        setDeletingDocId(documentToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://api.sehtnaa.com/api/admin/providers/required-documents/${documentToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(t("documents.documentDeletedSuccessfully"), { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || t("common.unexpectedError"), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setDeletingDocId(null);
            setDocumentToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            provider_type: 'individual'
        });
    };

    const prepareEditForm = (document) => {
        setSelectedDocument(document);
        setFormData({
            name: document.name,
            provider_type: document.provider_type
        });
        setShowEditModal(true);
    };

    // Filter documents based on all filter criteria
    const filteredDocuments = documents?.filter(doc => {
        return (
            (filters.global === '' ||
                doc.name.toLowerCase().includes(filters.global.toLowerCase()) ||
                doc.provider_type.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.name === '' ||
                doc.name.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.provider_type === '' ||
                doc.provider_type.toLowerCase().includes(filters.provider_type.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);
    const paginatedDocuments = filteredDocuments.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const providerTypeBadge = (type) => {
        const typeClass = type === 'individual'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800';
        const typeText = type === 'individual'
            ? t("documents.individual")
            : t("documents.organizational");
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClass} capitalize`}>
                {typeText}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    {t("documents.showingEntries", { start: (currentPage - 1) * rowsPerPage + 1, end: Math.min(currentPage * rowsPerPage, filteredDocuments.length), total: filteredDocuments.length })}
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
                        {t("documents.pageOf", { current: currentPage, total: totalPages })}
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
                    placeholder={t("documents.searchDocuments")}
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                <Button
                    icon={<Plus size={18} />}
                    label={t("documents.addDocumentButton")}
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
                                    placeholder={t("documents.name")}
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder={t("documents.providerType")}
                                    value={filters.provider_type}
                                    onChange={(e) => handleFilterChange('provider_type', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("documents.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t("documents.loadingDocuments")}
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedDocuments.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-3 py-4 text-center">
                                    {t("documents.noDocumentsFound")}
                                </td>
                            </tr>
                        ) : (
                            paginatedDocuments.map((document) => (
                                <tr key={document.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium">{document.name}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {providerTypeBadge(document.provider_type)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content={t("documents.editDocumentTooltip")} closeDelay={0} delay={700}>
                                                <Button
                                                    className="text-blue-500 ring-0"
                                                    onClick={() => prepareEditForm(document)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip
                                                content={deletingDocId === document.id ? t("documents.deleting") : t("documents.deleteDocumentTooltip")}
                                                closeDelay={0}
                                                delay={700}
                                            >
                                                <Button
                                                    className="text-red-500 ring-0"
                                                    onClick={() => handleDeleteClick(document.id)}
                                                    disabled={deletingDocId === document.id}
                                                >
                                                    {deletingDocId === document.id ? (
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

            {/* Add Document Modal */}
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
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t("documents.addNewDocument")}</h2>
                            <form onSubmit={handleAddDocument}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("documents.documentName")}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("documents.providerType")}</label>
                                    <select
                                        name="provider_type"
                                        value={formData.provider_type}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="individual">{t("documents.individual")}</option>
                                        <option value="organizational">{t("documents.organizational")}</option>
                                    </select>
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
                                        {t("common.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                        disabled={updatingDocument}
                                    >
                                        {updatingDocument ? <Loader2 className="animate-spin mx-auto" size={18} /> : t("documents.addDocumentButton")}

                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Document Modal */}
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
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t("documents.editDocumentTitle")}</h2>
                            <form onSubmit={handleEditDocument}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("documents.documentName")}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("documents.providerType")}</label>
                                    <select
                                        name="provider_type"
                                        value={formData.provider_type}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="individual">{t("documents.individual")}</option>
                                        <option value="organizational">{t("documents.organizational")}</option>
                                    </select>
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
                                        {t("common.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#267192] transition-all "
                                        disabled={updatingDocument}
                                    >
                                        {updatingDocument ? <Loader2 className="animate-spin mx-auto" size={18} /> : t("documents.updateDocument")}

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
                                    <h3 className="text-lg font-medium text-gray-900">{t("documents.deleteDocumentConfirm")}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {t("documents.deleteDocumentMessage")}
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
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    {t("common.delete")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
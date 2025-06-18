import axios from 'axios';
import React from 'react'
import { useQuery } from 'react-query';
import DocumentsDataTable from './DocumentsDataTable';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    function getDocumentsData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/providers/required-documents`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: DocumentsData, isLoading: isDocumentsLoading, isError: isDocumentsError, refetch } = useQuery({
        queryKey: ['DocumentsData'],
        queryFn: getDocumentsData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">{t("documents.title")}</h1>
            <DocumentsDataTable
                documents={DocumentsData?.data?.data || []}
                loading={isDocumentsLoading}
                refetch={refetch}
            />
        </div>
    )
}
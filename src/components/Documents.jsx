import axios from 'axios';
import React from 'react'
import { useQuery } from 'react-query';
import DocumentsDataTable from './DocumentsDataTable';

export default function Documents() {
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
            <h1 className="text-2xl font-bold mb-6 text-center">Required Documents Management</h1>
            <DocumentsDataTable
                documents={DocumentsData?.data?.data || []}
                loading={isDocumentsLoading}
                refetch={refetch}
            />
        </div>
    )
}
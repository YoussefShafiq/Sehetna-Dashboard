import axios from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import AdminsDataTable from './AdminsDataTable';

export default function Admins() {
    function getAdminsData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: AdminsData, isLoading: isAdminsLoading, isError: isAdminsError, refetch } = useQuery({
        queryKey: ['AdminsData'],
        queryFn: getAdminsData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Admins Management</h1>
            <AdminsDataTable
                admins={AdminsData?.data?.data || []}
                loading={isAdminsLoading}
                refetch={refetch}
            />
        </div>
    );
}
import axios from 'axios';
import React from 'react'
import { useQuery } from 'react-query';
import ComplaintsDataTable from './ComplaintsDataTable';

export default function Complaints() {
    function getComplaintsData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/complaints`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: ComplaintsData, isLoading: isComplaintsLoading, isError: isComplaintsError, refetch } = useQuery({
        queryKey: ['ComplaintsData'],
        queryFn: getComplaintsData,
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Complaints Management</h1>
            <ComplaintsDataTable
                complaints={ComplaintsData?.data?.data || []}
                loading={isComplaintsLoading}
                refetch={refetch}
            />
        </div>
    )
}
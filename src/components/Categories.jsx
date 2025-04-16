import axios from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import CategoriesDataTable from './CategoriesDataTable';

export default function Categories() {
    function getCategoriesData() {
        return axios.get(
            `https://api.sehtnaa.com/api/categories`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError, refetch } = useQuery({
        queryKey: ['CategoriesData'],
        queryFn: getCategoriesData,
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Categories Management</h1>
            <CategoriesDataTable
                categories={categoriesData?.data?.data || []}
                loading={isCategoriesLoading}
                refetch={refetch}
            />
        </div>
    );
}
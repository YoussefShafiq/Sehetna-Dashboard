import axios from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import ServicesDataTable from './ServicesDataTable';

export default function Services() {

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

    const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useQuery({
        queryKey: ['CategoriesData'],
        queryFn: getCategoriesData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    function getServicesData() {
        return axios.get(
            `https://api.sehtnaa.com/api/services`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError, refetch } = useQuery({
        queryKey: ['ServicesData'],
        queryFn: getServicesData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Services Management</h1>
            <ServicesDataTable
                services={servicesData?.data?.data || []}
                loading={isServicesLoading}
                refetch={refetch}
                categories={categoriesData?.data?.data || []}
            />
        </div>
    );
}
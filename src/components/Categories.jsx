import axios from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CategoriesDataTable from './CategoriesDataTable';

export default function Categories() {
    const { t } = useTranslation();
    const navigate = useNavigate();

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
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('categories.management')}</h1>
            <CategoriesDataTable
                categories={categoriesData?.data?.data || []}
                loading={isCategoriesLoading}
                refetch={refetch}
            />
        </div>
    );
}
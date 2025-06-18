import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ServicesDataTable from './ServicesDataTable';
import DateRangePicker from './DateRangePicker';
import { ActivityIcon, Loader, Loader2, TrendingUpIcon, Users2Icon } from 'lucide-react';
import { addDays } from 'date-fns';
import PieChart from './Charts/PieChart';
import MetricCard from './Charts/MetricCard';
import LineChart from './Charts/LineChart';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Services() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [exportingData, setExportingData] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: addDays(new Date(), 1)
    });

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
            toast.error(error.response?.data?.message || t("services.unexpectedError"), { duration: 3000 });
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    async function exportUsersData(url) {
        setExportingData(true);
        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                },
                params: {
                    start_date: dateRange.startDate.toISOString().split('T')[0],
                    end_date: dateRange.endDate.toISOString().split('T')[0]
                },
            })
            window.open('https://api.sehtnaa.com' + response.data.data.download_url, '_blank');

        } catch (error) {
            toast.error(error.response?.data?.message || t("services.unexpectedError"), { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken');
                navigate('/login');
            }
        } finally {
            setExportingData(false);
        }
    }

    function getServicesAnalysisData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/analytics/services`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                },
                params: {
                    start_date: dateRange.startDate.toISOString().split('T')[0],
                    end_date: dateRange.endDate.toISOString().split('T')[0]
                }
            }
        );
    }

    const { data: analysisData, isLoading: isAnalysisLoading, isError: isAnalysisError, refetch: analysisRefetch, isFetching: isAnalysisFetching } = useQuery({
        queryKey: ['ServicesAnalysisData', dateRange, servicesData],
        queryFn: getServicesAnalysisData,
        onError: (error) => {
            toast.error(error.response?.data?.message || t("services.unexpectedError"), { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken');
                navigate('/login');
            }
        }
    });

    const handleDateChange = (range) => {
        setDateRange({
            startDate: addDays(range.startDate, 1),
            endDate: addDays(range.endDate, 1)
        });

    };



    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">{t("services.management")}</h1>
            <ServicesDataTable
                services={servicesData?.data?.data || []}
                loading={isServicesLoading}
                refetch={refetch}
                categories={categoriesData?.data?.data || []}
            />
            <div className="mt-7 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <DateRangePicker
                        onDateChange={handleDateChange}
                        initialRange={dateRange}
                    />
                    <div className="flex justify-center items-center gap-2">
                        {isAnalysisFetching && <Loader2 className='animate-spin text-primary' />}
                        <button
                            onClick={() => {
                                exportUsersData(analysisData?.data?.data?.export_url);
                            }}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary_dark transition-colors"
                            disabled={isAnalysisFetching}
                        >
                            {exportingData ? <Loader2 className='animate-spin text-white' /> : t("services.export")}
                        </button>

                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    {/* Metric Cards Row */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title={t("services.totalServices")}
                            value={analysisData?.data?.data?.summary?.total_services}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-800"
                            borderColor="border-blue-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title={t("services.activeServices")}
                            value={analysisData?.data?.data?.summary?.active_services}
                            icon={<ActivityIcon size={18} />}
                            bgColor="bg-green-50"
                            textColor="text-green-800"
                            borderColor="border-green-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title={t("services.growthRate")}
                            value={`${analysisData?.data?.data?.summary?.growth_rate || 0}%`}
                            icon={<TrendingUpIcon size={18} />}
                            bgColor="bg-purple-50"
                            textColor="text-purple-800"
                            borderColor="border-purple-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title={t("services.inactiveServices")}
                            value={analysisData?.data?.data?.summary?.inactive_services}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-orange-50"
                            textColor="text-orange-800"
                            borderColor="border-orange-100"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-center gap-5 overflow-hidden">
                        {/* Pie Chart */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4 ">
                            <PieChart
                                key={analysisData}
                                label={t("services.providerTypeDistribution")}
                                labels={analysisData?.data?.data?.charts?.provider_type_distribution?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.provider_type_distribution?.values}
                            />
                        </div>

                        {/* line Chart */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4 ">
                            <LineChart
                                key={analysisData}
                                label={t("services.categoryDistribution")}
                                labels={analysisData?.data?.data?.charts?.category_distribution?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.category_distribution?.values}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <div className="bg-white p-4 rounded-lg shadow w-full ">
                            <LineChart
                                key={analysisData}
                                label={t("services.topServicesByRevenue")}
                                labels={analysisData?.data?.data?.charts?.top_services_by_revenue?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.top_services_by_revenue?.values}
                            />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow w-full ">
                            <LineChart
                                key={analysisData}
                                label={t("services.topServicesByRequests")}
                                labels={analysisData?.data?.data?.charts?.top_services_by_requests?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.top_services_by_requests?.values}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
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
export default function Services() {

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
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
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

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
        queryKey: ['ServicesAnalysisData', servicesData],
        queryFn: getServicesAnalysisData,
    });

    const handleDateChange = (range) => {
        setDateRange({
            startDate: addDays(range.startDate, 1),
            endDate: addDays(range.endDate, 1)
        });
        console.log(dateRange);

    };



    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Services Management</h1>
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
                            onClick={() => analysisRefetch()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Search
                        </button>
                        <butotn
                            onClick={() => { window.open(analysisData?.data?.data?.export_url, '_blank') }}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary_dark transition-colors cursor-pointer"
                            disabled={isAnalysisFetching}
                        >
                            Export
                        </butotn>

                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    {/* Metric Cards Row */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            key={analysisData}
                            title="Total Services"
                            value={analysisData?.data?.data?.summary?.total_services}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-800"
                            borderColor="border-blue-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            key={analysisData}
                            title="Active Services"
                            value={analysisData?.data?.data?.summary?.active_services}
                            icon={<ActivityIcon size={18} />}
                            bgColor="bg-green-50"
                            textColor="text-green-800"
                            borderColor="border-green-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            key={analysisData}
                            title="Growth Rate"
                            value={`${analysisData?.data?.data?.summary?.growth_rate}%`}
                            icon={<TrendingUpIcon size={18} />}
                            bgColor="bg-purple-50"
                            textColor="text-purple-800"
                            borderColor="border-purple-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            key={analysisData}
                            title="InActive Services"
                            value={analysisData?.data?.data?.summary?.inactive_services}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-orange-50"
                            textColor="text-orange-800"
                            borderColor="border-orange-100"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-center gap-5 overflow-hidden">
                        {/* Pie Chart */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4">
                            <PieChart
                                key={analysisData}
                                label="Provider Type Distribution"
                                labels={analysisData?.data?.data?.charts?.provider_type_distribution?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.provider_type_distribution?.values}
                            />
                        </div>

                        {/* line Chart */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4">
                            <LineChart
                                key={analysisData}
                                label='Category Distribution'
                                labels={analysisData?.data?.data?.charts?.category_distribution?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.category_distribution?.values}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <div className="bg-white p-4 rounded-lg shadow w-full">
                            <LineChart
                                key={analysisData}
                                label='Top Services by Revenue'
                                labels={analysisData?.data?.data?.charts?.top_services_by_revenue?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.category_distribution?.values}
                            />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow w-full">
                            <LineChart
                                key={analysisData}
                                label='Top Services by Requests'
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
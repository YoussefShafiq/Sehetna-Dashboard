import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ComplaintsDataTable from './ComplaintsDataTable';
import DateRangePicker from './DateRangePicker';
import { AlertCircleIcon, ClockIcon, Loader2, TrendingUpIcon, Users2Icon } from 'lucide-react';
import { addDays } from 'date-fns';
import PieChart from './Charts/PieChart';
import MetricCard from './Charts/MetricCard';
import LineChart from './Charts/LineChart';

export default function Complaints() {
    const [exportingData, setExportingData] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: addDays(new Date(), 1)
    });

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

    const { data: complaintsData, isLoading: isComplaintsLoading, isError: isComplaintsError, refetch } = useQuery({
        queryKey: ['ComplaintsData'],
        queryFn: getComplaintsData,
        onError: (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    });

    async function exportComplaintsData(url) {
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
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken');
                navigate('/login');
            }
        } finally {
            setExportingData(false);
        }
    }

    function getComplaintsAnalysisData() {
        return axios.get(
            `https://api.sehtnaa.com/api/admin/analytics/complaints`,
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
        queryKey: ['ComplaintsAnalysisData', dateRange, complaintsData],
        queryFn: getComplaintsAnalysisData,
        onError: (error) => {
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
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
            <h1 className="text-2xl font-bold mb-6 text-center">Complaints Management</h1>
            <ComplaintsDataTable
                complaints={complaintsData?.data?.data || []}
                loading={isComplaintsLoading}
                refetch={refetch}
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
                                exportComplaintsData(analysisData?.data?.data?.export_url);
                            }}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary_dark transition-colors"
                            disabled={isAnalysisFetching}
                        >
                            {exportingData ? <Loader2 className='animate-spin text-white' /> : 'Export'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Metric Cards Row */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title="Open Complaints"
                            value={analysisData?.data?.data?.summary?.open_complaints}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-800"
                            borderColor="border-blue-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title="Total Complaints"
                            value={analysisData?.data?.data?.summary?.total_complaints}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-lime-50"
                            textColor="text-lime-800"
                            borderColor="border-lime-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title="Resolved Complaints"
                            value={analysisData?.data?.data?.summary?.resolved_complaints}
                            icon={<AlertCircleIcon size={18} />}
                            bgColor="bg-green-50"
                            textColor="text-green-800"
                            borderColor="border-green-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title="Average Resolution Time"
                            value={`${analysisData?.data?.data?.summary?.avg_resolution_time_hours || 0} hours`}
                            icon={<ClockIcon size={18} />}
                            bgColor="bg-purple-50"
                            textColor="text-purple-800"
                            borderColor="border-purple-100"
                        />
                        <MetricCard
                            className={`w-full lg:w-1/4`}
                            title="In Progress Complaints"
                            value={analysisData?.data?.data?.summary?.in_progress_complaints}
                            icon={<Users2Icon size={18} />}
                            bgColor="bg-orange-50"
                            textColor="text-orange-800"
                            borderColor="border-orange-100"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-center gap-5 overflow-hidden">
                        {/* Pie Chart for Complaint Type Distribution */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4 ">
                            <PieChart
                                key={analysisData}
                                label="Complaint Type Distribution"
                                labels={analysisData?.data?.data?.charts?.status_distribution?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.status_distribution?.values}
                            />
                        </div>

                        {/* Line Chart for Creation Trends */}
                        <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4 ">
                            <LineChart
                                key={analysisData}
                                label='Complaint Trends'
                                labels={analysisData?.data?.data?.charts?.complaint_trends?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.complaint_trends?.values}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">
                        {/* Line Chart for Top Complaints */}
                        <div className="bg-white p-4 rounded-lg shadow w-full ">
                            <LineChart
                                key={analysisData}
                                label='Top Complaints'
                                labels={analysisData?.data?.data?.charts?.top_complainers?.labels}
                                dataPoints={analysisData?.data?.data?.charts?.top_complainers?.values}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
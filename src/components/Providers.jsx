import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ProvidersDataTable from './ProvidersDataTable';
import DateRangePicker from './DateRangePicker';
import { ActivityIcon, Loader2, TrendingUpIcon, Users2Icon } from 'lucide-react';
import { addDays } from 'date-fns';
import PieChart from './Charts/PieChart';
import MetricCard from './Charts/MetricCard';
import LineChart from './Charts/LineChart';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Providers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exportingData, setExportingData] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: addDays(new Date(), 1)
  });

  function getProvidersData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/providers`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      }
    );
  }

  const { data: providersData, isLoading: isProvidersLoading, isError: isProvidersError, refetch } = useQuery({
    queryKey: ['ProvidersData'],
    queryFn: getProvidersData,
    onError: (error) => {
      if (error.response.status === 401) {
        localStorage.removeItem('userToken')
        navigate('/login')
      }
    }
  });

  async function exportProvidersData(url) {
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
      toast.error(error.response?.data?.message || t("providers.unexpectedError"), { duration: 3000 });
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    } finally {
      setExportingData(false);
    }
  }

  function getProvidersAnalysisData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/analytics/providers`,
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
    queryKey: ['ProvidersAnalysisData', dateRange, providersData],
    queryFn: getProvidersAnalysisData,
    onError: (error) => {
      toast.error(error.response?.data?.message || t("providers.unexpectedError"), { duration: 3000 });
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
      <h1 className="text-2xl font-bold mb-6 text-center">{t("providers.management")}</h1>
      <ProvidersDataTable
        providers={providersData?.data?.data || { individual: [], organizational: [] }}
        loading={isProvidersLoading}
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
                exportProvidersData(analysisData?.data?.data?.export_url);
              }}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary_dark transition-colors"
              disabled={isAnalysisFetching}
            >
              {exportingData ? <Loader2 className='animate-spin text-white' /> : t("providers.export")}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Metric Cards Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            <MetricCard
              className={`w-full lg:w-1/4`}
              title={t("providers.totalProviders")}
              value={analysisData?.data?.data?.summary?.total_providers}
              icon={<Users2Icon size={18} />}
              bgColor="bg-blue-50"
              textColor="text-blue-800"
              borderColor="border-blue-100"
            />
            <MetricCard
              className={`w-full lg:w-1/4`}
              title={t("providers.activeProviders")}
              value={analysisData?.data?.data?.summary?.active_providers}
              icon={<ActivityIcon size={18} />}
              bgColor="bg-green-50"
              textColor="text-green-800"
              borderColor="border-green-100"
            />
            <MetricCard
              className={`w-full lg:w-1/4`}
              title={t("providers.growthRate")}
              value={`${analysisData?.data?.data?.summary?.growth_rate || 0}%`}
              icon={<TrendingUpIcon size={18} />}
              bgColor="bg-purple-50"
              textColor="text-purple-800"
              borderColor="border-purple-100"
            />
            <MetricCard
              className={`w-full lg:w-1/4`}
              title={t("providers.inactiveProviders")}
              value={analysisData?.data?.data?.summary?.inactive_providers}
              icon={<Users2Icon size={18} />}
              bgColor="bg-orange-50"
              textColor="text-orange-800"
              borderColor="border-orange-100"
            />
          </div>

          <div className="flex flex-col lg:flex-row justify-center gap-5 overflow-hidden">
            {/* Pie Chart for Provider Type Distribution */}
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4 ">
              <PieChart
                key={analysisData}
                label={t("providers.providerTypeDistribution")}
                labels={analysisData?.data?.data?.charts?.provider_type_distribution?.labels}
                dataPoints={analysisData?.data?.data?.charts?.provider_type_distribution?.values}
              />
            </div>

            {/* Line Chart for Creation Trends */}
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4 ">
              <LineChart
                key={analysisData}
                label={t("providers.providerCreationTrends")}
                labels={analysisData?.data?.data?.charts?.creation_trends?.labels}
                dataPoints={analysisData?.data?.data?.charts?.creation_trends?.values}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Stacked Bar Chart for Request Response Analysis */}
            <div className="bg-white p-4 rounded-lg shadow w-full ">
              <LineChart
                key={analysisData}
                label={t("providers.acceptedRequestAnalysis")}
                labels={analysisData?.data?.data?.charts?.request_response_analysis?.labels}
                dataPoints={analysisData?.data?.data?.charts?.request_response_analysis?.accepted}
                isStacked={true}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow w-full ">
              <LineChart
                key={analysisData}
                label={t("providers.rejectedRequestAnalysis")}
                labels={analysisData?.data?.data?.charts?.request_response_analysis?.labels}
                dataPoints={analysisData?.data?.data?.charts?.request_response_analysis?.rejected}
                isStacked={true}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow w-full ">
              <LineChart
                key={analysisData}
                label={t("providers.pendingRequestAnalysis")}
                labels={analysisData?.data?.data?.charts?.request_response_analysis?.labels}
                dataPoints={analysisData?.data?.data?.charts?.request_response_analysis?.pending}
                isStacked={true}
              />
            </div>

            {/* Line Chart for Top Performing Providers */}
            <div className="bg-white p-4 rounded-lg shadow w-full ">
              <LineChart
                key={analysisData}
                label={t("providers.topPerformingProviders")}
                labels={analysisData?.data?.data?.charts?.top_performing_providers?.labels}
                dataPoints={analysisData?.data?.data?.charts?.top_performing_providers?.completed_requests}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
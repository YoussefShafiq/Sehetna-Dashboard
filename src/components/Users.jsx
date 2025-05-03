import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UsersDataTable from './UsersDataTable';
import { useQuery } from 'react-query';
import { ActivityIcon, Loader, Loader2, TrendingUpIcon, Users2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from './DateRangePicker'; // Import the new component
import { addDays } from 'date-fns';
import PieChart from './Charts/PieChart';
import MetricCard from './Charts/MetricCard';
import LineChart from './Charts/LineChart';

export default function Users() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: addDays(new Date(), 1)
  });
  const [exportingData, setExportingData] = useState(false);

  const navigate = useNavigate();

  function getUsersData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/customers`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      }
    );
  }

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError, refetch } = useQuery({
    queryKey: ['usersData'],
    queryFn: getUsersData,
    onError: (error) => {
      toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/login');
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
      toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
      analysisRefetch()
    } finally {
      setExportingData(false);
    }
  }


  function getUsersAnalysisData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/analytics/customers`,
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

  const { data: analysisData, isLoading: isAnalysisLoading, isError: isAnalysisError, refetch: analysisRefetch, isFetching: isAnalysisFetching, error: analysisError } = useQuery({
    queryKey: ['UserAanalysisData', dateRange, usersData],
    queryFn: getUsersAnalysisData,
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
    console.log(dateRange);

  };




  const handleStatusToggle = async (userId) => {
    try {
      await axios.post(
        `https://api.sehtnaa.com/api/admin/customers/${userId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    }
  };

  if (isUsersError) {
    return <div>Error loading users data</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Users Management</h1>
      {/* <div className="flex flex-row items-center justify-center md:gap-5 p-5 bg-white mb-5 w-full md:w-fit m-auto rounded-2xl shadow-lg overflow-x-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <Users2Icon size={20} />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm capitalize">Total Users</span>
            <span className="text-lg font-bold">
              {usersData?.data?.data?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
            <Users2Icon size={20} />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm capitalize">Active Users</span>
            <span className="text-lg font-bold">
              {usersData?.data?.data?.filter(user => user.status === 'active').length || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Users2Icon size={20} />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm capitalize">Inactive Users</span>
            <span className="text-lg font-bold">
              {usersData?.data?.data?.filter(user => user.status === 'de-active').length || 0}
            </span>
          </div>
        </div>
      </div> */}


      <UsersDataTable
        users={usersData?.data?.data || []}
        loading={isUsersLoading}
        onStatusToggle={handleStatusToggle}
      />

      {/* analysis section */}
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
              {exportingData ? <Loader2 className='animate-spin text-white' /> : 'Export'}
            </button>

          </div>
        </div>
        <div className="flex flex-col gap-5">
          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Customers"
              value={analysisData?.data?.data?.summary?.total_customers}
              icon={<Users2Icon size={18} />}
              bgColor="bg-blue-50"
              textColor="text-blue-800"
              borderColor="border-blue-100"
            />
            <MetricCard
              title="Active Customers"
              value={analysisData?.data?.data?.summary?.active_customers}
              icon={<ActivityIcon size={18} />}
              bgColor="bg-green-50"
              textColor="text-green-800"
              borderColor="border-green-100"
            />
            <MetricCard
              title="Growth Rate"
              value={`${analysisData?.data?.data?.summary?.growth_rate || 0}%`}
              icon={<TrendingUpIcon size={18} />}
              bgColor="bg-purple-50"
              textColor="text-purple-800"
              borderColor="border-purple-100"
            />
            <MetricCard
              title="Active Requesters"
              value={analysisData?.data?.data?.summary?.active_requesters}
              icon={<Users2Icon size={18} />}
              bgColor="bg-orange-50"
              textColor="text-orange-800"
              borderColor="border-orange-100"
            />
          </div>

          <div className="flex flex-col lg:flex-row justify-center gap-5">
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4">
              <PieChart
                key={analysisData}
                label="Gender Distribution"
                labels={analysisData?.data?.data?.charts?.gender_distribution?.labels}
                dataPoints={analysisData?.data?.data?.charts?.gender_distribution?.values}
                backgroundColors={['#bbe1ff', '#ffd2fb']}
                hoverColors={['#a8cae5', '#ffaaf7']}
              />
            </div>

            {/* line Chart */}
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4">
              <LineChart
                key={analysisData}
                label='Registration Trends'
                labels={analysisData?.data?.data?.charts?.registration_trends?.labels}
                dataPoints={analysisData?.data?.data?.charts?.registration_trends?.values}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
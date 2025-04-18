import React from 'react';
import axios from 'axios';
import UsersDataTable from './UsersDataTable';
import { useQuery } from 'react-query';
import { Users2Icon } from 'lucide-react';

export default function Users() {
  function getUsersData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/customers`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      }
    )
  }

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError, refetch } = useQuery({
    queryKey: ['usersData'],
    queryFn: getUsersData,
  })

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
      console.error('Error toggling user status:', error);
    }
  };

  if (isUsersError) {
    return <div>Error loading users data</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Users Management</h1>
      <div className="flex flex-row items-center justify-center md:gap-5 p-5 bg-white mb-5 w-full md:w-fit m-auto rounded-2xl shadow-lg overflow-x-auto">
        {/* Total Users Card */}
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

        {/* Active Users Card */}
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

        {/* Inactive Users Card */}
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
      </div>
      <UsersDataTable
        users={usersData?.data?.data || []}
        loading={isUsersLoading}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}
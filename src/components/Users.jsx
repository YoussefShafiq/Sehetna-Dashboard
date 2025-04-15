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
      <div className="flex items-center gap-5 p-5 bg-white mb-5 w-fit m-auto rounded-2xl shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
            <Users2Icon />
          </div>
          <div className="flex flex-col ">
            <span className="text-sm ">Total Users</span>
            <span className='text-lg font-bold'>{usersData?.data?.data?.length}</span>
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
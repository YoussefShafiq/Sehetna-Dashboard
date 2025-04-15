import React from 'react';
import axios from 'axios';
import UsersDataTable from './UsersDataTable';
import { useQuery } from 'react-query';

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
      refetch(); // Refresh the data after successful toggle
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
      <UsersDataTable
        users={usersData?.data?.data || []}
        loading={isUsersLoading}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}
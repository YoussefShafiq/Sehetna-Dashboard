import axios from 'axios';
import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import ProvidersDataTable from './ProvidersDataTable';

export default function Providers() {
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

  const { data: ProvidersData, isLoading: isProvidersLoading, isError: isProvidersError, refetch } = useQuery({
    queryKey: ['ProvidersData'],
    queryFn: getProvidersData,
  });

  useEffect(() => {
    console.log(ProvidersData?.data?.data);

  }, [ProvidersData])


  return <>

    <ProvidersDataTable
      providers={ProvidersData?.data?.data || { individual: [], organizational: [] }}
      loading={isProvidersLoading}
      refetch={refetch}
    />
  </>
}
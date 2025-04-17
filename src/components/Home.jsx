import React, { useEffect } from 'react'
import amico from '../assets/images/amico.png'
import HomeUsersTable from './HomeUsersTable'
import HomeProvidersTable from './HomeProvidersTable'
import HomeServicesCard from './HomeFeaturesCard'
import axios from 'axios'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'

export default function Home() {

  function getHomeData() {
    return axios.get(
      `https://api.sehtnaa.com/api/admin/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      }
    )
  }

  const { data: homeData, isLoading: isHomeLoading, isError: isHomeError } = useQuery({
    queryKey: ['homeData'],
    queryFn: getHomeData,
  })

  const navigate = useNavigate();

  const navTo = (path) => {
    navigate(path)
  }


  return <>
    <div className="flex lg:flex-row flex-col gap-5">
      {/* left side */}
      <div className="lg:w-2/3 flex flex-col gap-5">

        {/* welcome card */}
        <div className="flex items-center gap-5 bg-gradient-to-r from-[#1c536a] to-[#3498c4] p-5 rounded-2xl text-white">
          <div className="w-3/5 flex flex-col gap-5">
            <h1 className='font-light capitalize'>Dashbaord overview</h1>
            <h2 className='font-bold text-4xl capitalize'>hello {localStorage.getItem('username')} 👋</h2>
            <div className="flex gap-5 items-center my-10">
              <button onClick={() => { navTo('/campaigns') }} className='bg-gradient-to-r from-[#1c536a] to-[#3498c4] font-semibold border-[1px] px-3 py-2 rounded-lg capitalize' >Add new campaign</button>
              <button onClick={() => { navTo('/services') }} className='bg-white text-primary font-semibold border-[1px] px-3 py-2 rounded-lg capitalize'>Add new service</button>
            </div>
          </div>
          <div className="w-2/5 flex justify-center items-center">
            <img src={amico} alt="" className='w-3/4' />
          </div>
        </div>

        <div className="">
          <HomeUsersTable users={homeData?.data?.data?.users} />
        </div>
      </div>


      {/* right side */}
      <div className="lg:w-1/3 flex flex-col gap-5">
        <HomeServicesCard services={homeData?.data?.data?.services} />
        <HomeProvidersTable providers={homeData?.data?.data?.providers} />
      </div>
    </div>
  </>
}

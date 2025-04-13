import React from 'react'
import amico from '../assets/images/amico.png'
import HomeUsersTable from './HomeUsersTable'
import HomeFeaturesCard from './HomeFeaturesCard'
import HomeProvidersTable from './HomeProvidersTable'

export default function Home() {


  return <>
    <div className="flex gap-5">
      {/* left side */}
      <div className="w-2/3 flex flex-col gap-5">

        {/* welcome card */}
        <div className="flex items-center gap-5 bg-gradient-to-r from-[#1c536a] to-[#3498c4] p-5 rounded-2xl text-white">
          <div className="w-3/5 flex flex-col gap-5">
            <h1 className='font-light capitalize'>Dashbaord overview</h1>
            <h2 className='font-bold text-4xl capitalize'>hello shafek 👋</h2>
            <div className="flex gap-5 items-center my-10">
              <button className='bg-gradient-to-r from-[#1c536a] to-[#3498c4] font-semibold border-[1px] px-3 py-2 rounded-lg' >Push a notification</button>
              <button className='bg-white text-primary font-semibold border-[1px] px-3 py-2 rounded-lg'>Add new feature</button>
            </div>
          </div>
          <div className="w-2/5 flex justify-center items-center">
            <img src={amico} alt="" className='w-3/4' />
          </div>
        </div>

        <div className="">
          <HomeUsersTable />
        </div>
      </div>


      {/* right side */}
      <div className="w-1/3 flex flex-col gap-5">
        <HomeFeaturesCard />
        <HomeProvidersTable />
      </div>
    </div>
  </>
}

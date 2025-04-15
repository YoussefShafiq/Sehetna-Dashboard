import React, { useContext } from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { SidebarContext } from '../contexts/SidebarContext'

export default function Layout() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)

    return <>
        <div className="flex bg-base min-h-screen">
            <div className={`${sidebarOpen ? 'w-56' : 'w-0'} transition-all duration-500`}>
                <Sidebar />
            </div>
            <div className={`${sidebarOpen ? 'w-[calc(100%-224px)] ps-0' : 'w-full'} p-5  text-black transition-all duration-500`}>
                <Outlet />
            </div>
        </div>
    </>
}

import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
    return <>
        <div className="flex bg-base min-h-screen">
            <div className="w-1/6">
                <Sidebar />
            </div>
            <div className="flex-1 p-5 ps-0 text-black">
                <Outlet />
            </div>
        </div>
    </>
}

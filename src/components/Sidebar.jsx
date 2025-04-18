import React, { useContext, useState } from 'react'
import logo from '../assets/images/sehetna.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { BadgeAlert, Bell, File, FileClock, HandHeart, Home, LogOutIcon, SendToBack, Shield, SidebarClose, User2Icon, Users2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { SidebarContext } from '../contexts/SidebarContext'
import axios from 'axios'
import copyrightimg from '../assets/images/© Copy right s7etna 2025.png'

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    const [loggingOut, setloggingOut] = useState(false)

    const navigate = useNavigate()

    async function handleLogout() {
        setloggingOut(true)
        try {
            let resopnse = await axios.post('https://api.sehtnaa.com/api/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
            localStorage.removeItem('userToken')
            navigate('/login')
            toast.success('logged out successfully', { duration: 2000 })
            setloggingOut(false)
        } catch (error) {
            setloggingOut(false)
            toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
            const navigate = useNavigate();
            localStorage.removeItem('userToken')
            navigate('/login')
        }
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

    return <>
        <div className={`h-full p-5 fixed w-56 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 z-50`}>
            <div className={`absolute top-0 right-0 ${sidebarOpen ? '-translate-x-full ' : 'translate-x-[calc(100%+5px)] p-1.5 flex justify-center items-center bg-white bg-opacity-60 aspect-square rounded-full'} translate-y-full transition-all duration-500`}>
                <button onClick={toggleSidebar} ><SidebarClose /></button>
            </div>
            <div className="h-full bg-white rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
                <div className="">
                    <div className="flex justify-center items-center overflow-hidden mb-5">
                        <img src={logo} alt="Logo" className="w-4/5" />
                    </div>
                    <div className="flex flex-col gap-2.5 text-gray-400 text-sm">
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/" ><Home size={18} /> Home</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/users" ><User2Icon size={18} /> Users</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/services" ><HandHeart size={18} /> Services</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/categories" ><SendToBack size={18} /> Categories</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/providers" ><Users2Icon size={18} /> Providers</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/documents" ><File size={18} /> Documents</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/complaints" ><BadgeAlert size={18} /> Complaints</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/requests" ><FileClock size={18} /> Requests</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/campaigns" ><Bell size={18} /> Campaigns</NavLink>
                        {localStorage.getItem('role')?.toLowerCase() === 'super_admin' && <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/admins" ><Shield size={18} /> Admins</NavLink>}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={handleLogout} disabled={loggingOut} className='bg-gray-400 flex justify-center items-center text-white p-2 rounded-xl mb-2 gap-2 disabled:cursor-not-allowed disabled:opacity-50'>logout <LogOutIcon /></button>
                    <div className="flex justify-center items-center">
                        <img src={copyrightimg} alt="Logo" className="w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    </>
}

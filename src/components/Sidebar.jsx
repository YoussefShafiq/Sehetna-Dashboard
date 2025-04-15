import React, { useContext, useState } from 'react'
import logo from '../assets/images/Sehetna 1.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { HandHeart, Home, LogOutIcon, SidebarClose, User, User2Icon, Users, Users2, Users2Icon, WorkflowIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { SidebarContext } from '../contexts/SidebarContext'
import axios from 'axios'

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    const [loggingOut, setloggingOut] = useState(false)

    const navigate = useNavigate()

    async function handleLogout() {
        setloggingOut(true)
        try {
            let resopnse = await axios.post('https://api.sehtnaa.com/api/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
            localStorage.removeItem('userToken')
            toast.success('logged out successfully', { duration: 2000 })
            navigate('/login')
            setloggingOut(false)
        } catch (error) {
            toast.error(error.response.data.message, { duration: 5000 })
            setloggingOut(false)
        }
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

    return <>
        <div className={`h-full p-5 fixed w-56 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500`}>
            <div className={`absolute top-0 right-0 ${sidebarOpen ? '-translate-x-full ' : 'translate-x-[calc(100%+5px)] p-1.5 flex justify-center items-center bg-white bg-opacity-60 aspect-square rounded-full'} translate-y-full transition-all duration-500`}>
                <button onClick={toggleSidebar} ><SidebarClose /></button>
            </div>
            <div className="h-full bg-white rounded-2xl p-5 flex flex-col justify-between">
                <div className="">
                    <div className="flex justify-center items-center overflow-hidden mb-5">
                        <img src={logo} alt="Logo" className="w-4/5" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/" ><Home size={18} /> Home</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/users" ><User2Icon size={18} /> Users</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/providers" ><Users2Icon size={18} /> Provider</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/services" ><HandHeart size={18} /> Services</NavLink>
                    </div>
                </div>
                <button onClick={handleLogout} disabled={loggingOut} className='bg-red-500 flex justify-center items-center text-white p-2 rounded-xl mb-2 gap-2 disabled:cursor-not-allowed disabled:opacity-50'>logout <LogOutIcon /></button>
            </div>
        </div>
    </>
}

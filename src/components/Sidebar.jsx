import React from 'react'
import logo from '../assets/images/Sehetna 1.png'
import { NavLink } from 'react-router-dom'
import { HandHeart, Home, LogOutIcon, User, User2Icon, Users, Users2, Users2Icon, WorkflowIcon } from 'lucide-react'

export default function Sidebar() {
    return <>
        <div className="h-full p-5 fixed w-1/6">
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
                <button className='bg-red-400 flex justify-center items-center text-white p-2 rounded-xl'>logout <LogOutIcon /></button>
            </div>
        </div>
    </>
}

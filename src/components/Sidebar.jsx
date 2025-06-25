import React, { useContext, useState } from 'react'
import logo from '../assets/images/sehetna.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { BadgeAlert, Bell, File, FileClock, HandHeart, Home, LogOutIcon, SendToBack, Shield, SidebarClose, User2Icon, Users2Icon, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { SidebarContext } from '../contexts/SidebarContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import copyrightimg from '../assets/images/© Copy right s7etna 2025.png'

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    const [loggingOut, setloggingOut] = useState(false)
    const { currentLanguage, changeLanguage } = useLanguage()
    const { t } = useTranslation()

    const navigate = useNavigate()

    async function handleLogout() {
        setloggingOut(true)
        try {
            let resopnse = await axios.post('https://api.sehtnaa.com/api/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
            localStorage.removeItem('userToken')
            navigate('/login')
            toast.success(t('login.loggedOutSuccessfully'), { duration: 2000 })
            setloggingOut(false)
        } catch (error) {
            setloggingOut(false)
            toast.error(error.response?.data?.message || t('login.unexpectedError'), { duration: 3000 });
            localStorage.removeItem('userToken')
            navigate('/login')
        }
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

    const handleLanguageChange = (language) => {
        changeLanguage(language)
    }

    // Determine sidebar position based on language
    const isRTL = currentLanguage === 'ar'
    const sidebarPosition = isRTL ? 'right-0' : 'left-0'
    const sidebarTransform = isRTL
        ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full')
        : (sidebarOpen ? 'translate-x-0' : '-translate-x-full')

    const toggleButtonPosition = isRTL
        ? (sidebarOpen ? 'top-5 left-5 translate-x-1/2 translate-y-1/2 text-gray-400' : 'top-2 -left-2 -translate-x-full p-1.5 flex justify-center items-center bg-white text-gray-700 bg-opacity-90 aspect-square rounded-full cursor-pointer')
        : (sidebarOpen ? 'top-5 right-5 -translate-x-1/2 translate-y-1/2 text-gray-400' : 'top-2 -right-2 translate-x-full p-1.5 flex justify-center items-center bg-white text-gray-700 bg-opacity-90 aspect-square rounded-full cursor-pointer')

    return <>
        <div className={`h-full p-5 fixed w-56 ${sidebarPosition} ${sidebarTransform} transition-all duration-500 z-50`}>
            <div className={`absolute z-50 ${toggleButtonPosition} transition-all duration-500`}>
                <button onClick={toggleSidebar} ><SidebarClose /></button>
            </div>
            <div className="h-full bg-white rounded-2xl p-5 pt-10 flex flex-col justify-between overflow-y-auto">
                <div className="">
                    <div className="flex justify-center items-center overflow-hidden mb-2">
                        <img src={logo} alt="Logo" className="w-4/5" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-gray-400 text-sm">
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/" ><Home size={18} /> {t('sidebar.home')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/users" ><User2Icon size={18} /> {t('sidebar.users')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/services" ><HandHeart size={18} /> {t('sidebar.services')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/categories" ><SendToBack size={18} /> {t('sidebar.categories')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/providers" ><Users2Icon size={18} /> {t('sidebar.providers')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/documents" ><File size={18} /> {t('sidebar.documents')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/complaints" ><BadgeAlert size={18} /> {t('sidebar.complaints')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/requests" ><FileClock size={18} /> {t('sidebar.requests')}</NavLink>
                        <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/campaigns" ><Bell size={18} /> {t('sidebar.campaigns')}</NavLink>
                        {localStorage.getItem('role')?.toLowerCase() === 'super_admin' && <NavLink className="px-4 py-2 rounded-xl flex items-center gap-2" to="/admins" ><Shield size={18} /> {t('sidebar.admins')}</NavLink>}

                    </div>
                </div>
                <div className="flex flex-col">
                    {/* Language Toggle */}
                    <div className="px-4 py-2 rounded-xl flex items-center gap-2">
                        {/* <Globe size={18} /> */}
                        {/* <span className="flex-1">{t('sidebar.language')}</span> */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-2 py-1 text-xs rounded ${currentLanguage === 'en' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {t('sidebar.english')}
                            </button>
                            <button
                                onClick={() => handleLanguageChange('ar')}
                                className={`px-2 py-1 text-xs rounded ${currentLanguage === 'ar' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {t('sidebar.arabic')}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} disabled={loggingOut} className='bg-gray-400 flex justify-center items-center text-white p-2 rounded-xl mb-2 gap-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize'>{t('sidebar.logout')} <LogOutIcon size={16} /></button>
                    <div className="flex justify-center items-center">
                        <img src={copyrightimg} alt="Logo" className="w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    </>
}

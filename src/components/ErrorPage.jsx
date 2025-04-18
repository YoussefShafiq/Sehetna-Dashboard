import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../contexts/SidebarContext';
import Sidebar from './Sidebar';

const ErrorPage = () => {
    let { sidebarOpen } = useContext(SidebarContext)
    const navigate = useNavigate()
    // Function to handle refresh
    const handleRefresh = () => {
        window.location.reload(); // Reloads the current page
    };
    return <>
        <div className="flex bg-base min-h-screen">
            <div className={`${sidebarOpen ? 'md:w-56' : 'w-0'} transition-all duration-500`}>
                <Sidebar />
            </div>
            <div className={`${sidebarOpen ? 'w-full md:w-[calc(100%-224px)] ps-0' : 'w-full'} md:p-5  text-black transition-all duration-500 h-screen flex flex-col justify-center items-center`}>
                <h1>Oops! Something went wrong.</h1>
                <p>We're sorry, but an unexpected error has occurred.</p>
                <div className="flex gap-2 my-4">
                    <button onClick={handleRefresh} className='bg-primary text-white py-1 px-2 rounded-xl' >Refresh</button>
                    <button onClick={() => navigate('/')} className='bg-primary text-white py-1 px-2 rounded-xl' >Go to home</button>
                </div>
            </div>
        </div>

    </>


};

export default ErrorPage;
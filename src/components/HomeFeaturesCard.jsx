import React from 'react'
import amico from '../assets/images/amico.png'
import { useNavigate } from 'react-router-dom';


export default function HomeServicesCard({ services }) {

    const navigate = useNavigate();

    const handleViewAllServices = () => {
        navigate('/services');
    };

    return <>
        <div className="bg-white rounded-2xl p-5 pb-0 max-h-[35vh] overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className='capitalize font-semibold text-xl text-black'>Services</h2>
                <button onClick={handleViewAllServices} className="text-green-500">view all</button>
            </div>
            {services?.recent?.map((service, index) => (
                <div key={index} className="flex flex-col gap-3">
                    <div className="flex gap-2 p-3">
                        <div className="w-1/5"><img src={'https://api.sehtnaa.com/storage/' + service.cover_photo} className='w-4/5' alt="" /></div>
                        <div className="flex flex-col">
                            <h2 className='capitalize font-semibold text-black'>{service.name.en}</h2>
                            <h3 className='text-gray-500 text-xs'>created at 13/06/2023</h3>
                            <h4 className={`${service.status === 'Active' ? 'text-[#009379]' : 'text-[#930002]'} text-sm`}>{service.status}</h4>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </>
}

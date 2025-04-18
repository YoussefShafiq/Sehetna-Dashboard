import { Loader2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeUsersTable = ({ users, loading }) => {
    // Simulated data array


    const navigate = useNavigate();

    const handleViewAllUsers = () => {
        navigate('/users');
    };

    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">Users</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient Name
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gender
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone Number
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center">
                                    Status
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : <>

                            {users?.recent?.slice(0, 7).map((user, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.gender}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.phone}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className={`px-2 flex justify-center text-xs leading-5 font-semibold rounded-md
                    ${user.status.toLowerCase() === 'active' ? 'bg-[#009379] ' : 'bg-[#930002] '} text-white`}>
                                            {user.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </>}
                    </tbody>
                </table>
            </div>
            <div className="pt-5 flex justify-center">
                <button onClick={handleViewAllUsers} className='text-green-500'>view all</button>
            </div>
        </div>
    );
};

export default HomeUsersTable;
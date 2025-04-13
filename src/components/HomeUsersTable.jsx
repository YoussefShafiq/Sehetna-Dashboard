import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeUsersTable = () => {
    // Simulated data array
    const users = [
        {
            id: 1,
            name: 'Youssef Lauendy',
            gender: 'Male',
            phone: '(+2) 01063361951',
            email: 'Youssef@gmail.com',
            country: 'EL Nozha',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Youssef Shafek',
            gender: 'Male',
            phone: '(+2) 01145528803',
            email: 'Shafek@gmail.com',
            country: 'Qubaa',
            status: 'Inactive'
        },
        {
            id: 2,
            name: 'Youssef Shafek',
            gender: 'Male',
            phone: '(+2) 01145528803',
            email: 'Shafek@gmail.com',
            country: 'Qubaa',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Sausan Badr',
            gender: 'Female',
            phone: '(+2) 01547239601',
            email: 'Sausanb@gmail.com',
            country: '6 October',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Sausan Badr',
            gender: 'Female',
            phone: '(+2) 01547239601',
            email: 'Sausanb@gmail.com',
            country: '6 October',
            status: 'Inactive'
        },
        {
            id: 3,
            name: 'Sausan Badr',
            gender: 'Female',
            phone: '(+2) 01547239601',
            email: 'Sausanb@gmail.com',
            country: '6 October',
            status: 'Active'
        }
    ];

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
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.name}
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`px-2 flex justify-center text-xs leading-5 font-semibold rounded-full
                    ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status}
                                    </div>
                                </td>
                            </tr>
                        ))}
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
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomeProvidersTable = ({ providers, loading }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleViewAllProviders = () => {
        navigate('/providers');
    };

    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">{t('providers.title')}</h2>
            </div>

            <div className="overflow-x-auto min-h-[30vh]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('home.providerName')}
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('home.type')}
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center">
                                    {t('home.status')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t('home.loadingProviders')}
                                    </div>
                                </td>
                            </tr>
                        ) : <>

                            {providers?.recent?.map((provider, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {provider.first_name} {provider.last_name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className={`px-2 text-xs leading-5 font-semibold rounded-full text-center w-fit
                                        ${provider.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {provider.type === 'individual' ? t('home.individual') : t('home.organizational')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`px-2 flex justify-center text-xs leading-5 font-semibold rounded-md
                                        ${provider.status === 'Active' ? 'bg-[#009379] ' : 'bg-[#930002] '}text-white`}>
                                            {provider.status === 'Active' ? t('home.active') : t('home.inactive')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </>}
                    </tbody>
                </table>
            </div>
            <div className="pt-5 flex justify-center">
                <button onClick={handleViewAllProviders} className='text-green-500'>{t('common.viewAll')}</button>
            </div>
        </div>
    );
};

export default HomeProvidersTable;
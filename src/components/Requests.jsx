// import axios from 'axios';
// import React, { useState } from 'react';
// import { useQuery } from 'react-query';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
// import DateRangePicker from './DateRangePicker';
// import { ActivityIcon, Loader2 as Loader, TrendingUpIcon, Users2Icon } from 'lucide-react';
// import { addDays } from 'date-fns';
// import PieChart from './Charts/PieChart';
// import MetricCard from './Charts/MetricCard';
// import LineChart from './Charts/LineChart';
// import { GiReceiveMoney } from "react-icons/gi";

// export default function Requests() {
//     const [filters, setFilters] = useState({
//         customer: '',
//         phone: '',
//         service: '',
//         provider: '',
//         status: '',
//         date: '',
//         address: ''
//     });
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage] = useState(10);
//     const [exportingData, setExportingData] = useState(false);
//     const [dateRange, setDateRange] = useState({
//         startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
//         endDate: addDays(new Date(), 1)
//     });

//     function getRequestsData() {
//         return axios.get(
//             `https://api.sehtnaa.com/api/admin/requests`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('userToken')}`
//                 }
//             }
//         );
//     }

//     const { data: RequestsData, isLoading: isRequestsLoading, isError: isRequestsError, refetch } = useQuery({
//         queryKey: ['RequestsData'],
//         queryFn: getRequestsData,
//         onError: (error) => {
//             if (error.response.status === 401) {
//                 localStorage.removeItem('userToken')
//                 navigate('/login')
//             }
//         }
//     });

//     async function exportRequestsData(url) {
//         setExportingData(true);
//         try {
//             const response = await axios.get(url, {
//                 headers: {
//                     Accept: 'application/json',
//                     Authorization: `Bearer ${localStorage.getItem('userToken')}`
//                 },
//                 params: {
//                     start_date: dateRange.startDate.toISOString().split('T')[0],
//                     end_date: dateRange.endDate.toISOString().split('T')[0]
//                 },
//             })
//             window.open('https://api.sehtnaa.com' + response.data.data.download_url, '_blank');

//         } catch (error) {
//             toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
//             if (error.response?.status === 401) {
//                 localStorage.removeItem('userToken');
//                 navigate('/login');
//             }
//         } finally {
//             setExportingData(false);
//         }
//     }

//     function getRequestsAnalysisData() {
//         return axios.get(
//             `https://api.sehtnaa.com/api/admin/analytics/requests`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('userToken')}`
//                 },
//                 params: {
//                     start_date: dateRange.startDate.toISOString().split('T')[0],
//                     end_date: dateRange.endDate.toISOString().split('T')[0]
//                 }
//             }
//         );
//     }

//     const { data: analysisData, isLoading: isAnalysisLoading, isError: isAnalysisError, refetch: analysisRefetch, isFetching: isAnalysisFetching } = useQuery({
//         queryKey: ['RequestsAnalysisData', dateRange, RequestsData],
//         queryFn: getRequestsAnalysisData,
//         onError: (error) => {
//             toast.error(error.response?.data?.message || "unexpected error", { duration: 3000 });
//             if (error.response?.status === 401) {
//                 localStorage.removeItem('userToken');
//                 navigate('/login');
//             }
//         }
//     });

//     const handleDateChange = (range) => {
//         setDateRange({
//             startDate: addDays(range.startDate, 1),
//             endDate: addDays(range.endDate, 1)
//         });
//     };

//     const handleFilterChange = (field, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [field]: value
//         }));
//         setCurrentPage(1);
//     };

//     // Filter requests based on filter criteria
//     const filteredRequests = RequestsData?.data?.data?.filter(request => {
//         const customerName = `${request.customer?.first_name || ''} ${request.customer?.last_name || ''}`.toLowerCase();
//         const customerPhone = request.customer?.phone || '';
//         const providerName = `${request.assigned_provider?.first_name || ''} ${request.assigned_provider?.last_name || ''}`.toLowerCase();
//         const serviceNames = request.services?.map(s => s.name?.en?.toLowerCase()).join(' ') || '';
//         const requestStatus = request.status?.toLowerCase();
//         const requestDate = new Date(request.created_at).toLocaleDateString();
//         const requestAddress = request.address?.toLowerCase();

//         return (
//             (filters.customer === '' || customerName.includes(filters.customer?.toLowerCase())) &&
//             (filters.phone === '' || customerPhone.includes(filters.phone)) &&
//             (filters.service === '' || serviceNames.includes(filters.service?.toLowerCase())) &&
//             (filters.provider === '' || providerName.includes(filters.provider?.toLowerCase())) &&
//             (filters.status === '' || requestStatus.includes(filters.status?.toLowerCase())) &&
//             (filters.date === '' || requestDate.includes(filters.date)) &&
//             (filters.address === '' || requestAddress.includes(filters.address?.toLowerCase()))
//         );
//     }) || [];

//     // Pagination logic
//     const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
//     const paginatedRequests = filteredRequests.slice(
//         (currentPage - 1) * rowsPerPage,
//         currentPage * rowsPerPage
//     );

//     const statusBadge = (status) => {
//         let statusClass = '';
//         switch (status) {
//             case 'pending':
//                 statusClass = 'bg-yellow-500 text-white';
//                 break;
//             case 'accepted':
//                 statusClass = 'bg-green-500 text-white';
//                 break;
//             case 'cancelled':
//                 statusClass = 'bg-[#930002] text-white';
//                 break;
//             case 'completed':
//                 statusClass = 'bg-[#009379] text-white';
//                 break;
//             default:
//                 statusClass = 'bg-gray-500 text-white';
//         }

//         return (
//             <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-24 text-center capitalize`}>
//                 {status.replace('_', ' ')}
//             </span>
//         );
//     };

//     const renderPagination = () => {
//         if (totalPages <= 1) return null;

//         return (
//             <div className="flex justify-between items-center mt-4 px-4 pb-1">
//                 <div className='text-xs'>
//                     Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
//                     {Math.min(currentPage * rowsPerPage, filteredRequests.length)} of{' '}
//                     {filteredRequests.length} entries
//                 </div>
//                 <div className="flex gap-1">
//                     <Button
//                         onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                         disabled={currentPage === 1}
//                         className="p-1"
//                     >
//                         <ChevronLeft className="h-4 w-4" />
//                     </Button>
//                     <span className="px-3 py-1">
//                         Page {currentPage} of {totalPages}
//                     </span>
//                     <Button
//                         onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                         disabled={currentPage === totalPages}
//                         className="p-1"
//                     >
//                         <ChevronRight className="h-4 w-4" />
//                     </Button>
//                 </div>
//             </div>
//         );
//     };

//     if (isRequestsError) {
//         return <div className="p-4 text-red-500">Error loading requests data</div>;
//     }

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-6 text-center">Requests Management</h1>

//             {/* Requests Table */}
//             <div className="shadow-2xl rounded-2xl overflow-hidden bg-white mt-6">
//                 {/* customer name Search */}
//                 <div className="p-4 border-b">
//                     <InputText
//                         value={filters.customer}
//                         onChange={(e) => handleFilterChange('customer', e.target.value)}
//                         placeholder="Search Customer..."
//                         className="px-3 py-2 rounded-xl shadow-sm focus:ring-2 w-full"
//                     />
//                 </div>

//                 {/* Table */}
//                 <div className="overflow-x-auto">
//                     <table className="w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="number"
//                                         placeholder="Phone"
//                                         value={filters.phone}
//                                         onChange={(e) => handleFilterChange('phone', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="text"
//                                         placeholder="Service"
//                                         value={filters.service}
//                                         onChange={(e) => handleFilterChange('service', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="text"
//                                         placeholder="Provider"
//                                         value={filters.provider}
//                                         onChange={(e) => handleFilterChange('provider', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="text"
//                                         placeholder="Status"
//                                         value={filters.status}
//                                         onChange={(e) => handleFilterChange('status', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="text"
//                                         placeholder="Address"
//                                         value={filters.address}
//                                         onChange={(e) => handleFilterChange('address', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     <input
//                                         type="text"
//                                         placeholder="Date"
//                                         value={filters.date}
//                                         onChange={(e) => handleFilterChange('date', e.target.value)}
//                                         className="text-xs p-1 border rounded w-full"
//                                     />
//                                 </th>
//                                 <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Feedback
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200 text-sm">
//                             {isRequestsLoading ? (
//                                 <tr>
//                                     <td colSpan="7" className="px-3 py-4 text-center">
//                                         <div className="flex justify-center items-center gap-2">
//                                             <Loader2 className="animate-spin" size={18} />
//                                             Loading requests...
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : paginatedRequests.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="7" className="px-3 py-4 text-center">
//                                         No requests found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 paginatedRequests.map((request) => (
//                                     <tr key={request.id} className="hover:bg-gray-50">
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             {request.customer?.first_name} {request.customer?.last_name}
//                                             <div className="text-gray-500 text-xs">{request.customer?.phone}</div>
//                                         </td>
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             <div className="flex flex-col gap-1">
//                                                 {request.services?.map((service, idx) => (
//                                                     <div key={`${request.id}-${service.id}-${idx}`}>
//                                                         {service.name?.en}
//                                                         <div className="text-gray-500 text-xs">${service.price}</div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                             {request.services?.length > 1 && (
//                                                 <div className="text-xs font-medium mt-1">
//                                                     Total: ${request.total_price ||
//                                                         request.services?.reduce((sum, s) => sum + parseFloat(s.price || 0), 0).toFixed(2)}
//                                                 </div>
//                                             )}
//                                         </td>
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             {request.assigned_provider ? (
//                                                 <>
//                                                     {request.assigned_provider.first_name} {request.assigned_provider.last_name}
//                                                     <div className="text-gray-500 text-xs capitalize">
//                                                         {request.assigned_provider.provider_type}
//                                                     </div>
//                                                 </>
//                                             ) : (
//                                                 <span className="text-gray-400">Not assigned</span>
//                                             )}
//                                         </td>
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             {statusBadge(request.status)}
//                                         </td>
//                                         <td className="px-3 py-4">
//                                             <div className="max-w-xs truncate">
//                                                 {request.address}
//                                             </div>
//                                         </td>
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             {new Date(request.created_at).toLocaleDateString()}
//                                         </td>
//                                         <td className="px-3 py-4 whitespace-nowrap">
//                                             {request.feedbacks?.length > 0 ? (
//                                                 <div className="flex items-center gap-1">
//                                                     <span className="text-yellow-500">
//                                                         {'★'.repeat(request.feedbacks[0].rating)}
//                                                         {'☆'.repeat(5 - request.feedbacks[0].rating)}
//                                                     </span>
//                                                     <span className="text-xs text-gray-500">
//                                                         ({request.feedbacks[0].rating}/5)
//                                                     </span>
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-gray-400">No feedback</span>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 {!isRequestsLoading && renderPagination()}
//             </div>

//             {/* Analytics Section */}
//             <div className="mt-7 flex flex-col gap-4">
//                 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                     <DateRangePicker
//                         onDateChange={handleDateChange}
//                         initialRange={dateRange}
//                     />
//                     <div className="flex justify-center items-center gap-2">
//                         {isAnalysisFetching && <Loader className='animate-spin text-primary' />}
//                         <button
//                             onClick={() => {
//                                 exportRequestsData(analysisData?.data?.data?.export_url);
//                             }}
//                             className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary_dark transition-colors"
//                             disabled={isAnalysisFetching}
//                         >
//                             {exportingData ? <Loader className='animate-spin text-white' /> : 'Export'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Metric Cards */}
//                 <div className="flex flex-col lg:flex-row gap-4">
//                     <MetricCard
//                         className={`w-full lg:w-1/4`}
//                         title="Total Requests"
//                         value={analysisData?.data?.data?.summary?.total_requests}
//                         icon={<Users2Icon size={18} />}
//                         bgColor="bg-blue-50"
//                         textColor="text-blue-800"
//                         borderColor="border-blue-100"
//                     />
//                     <MetricCard
//                         className={`w-full lg:w-1/4`}
//                         title="Completion Rate"
//                         value={analysisData?.data?.data?.summary?.completion_rate}
//                         icon={<ActivityIcon size={18} />}
//                         bgColor="bg-green-50"
//                         textColor="text-green-800"
//                         borderColor="border-green-100"
//                     />
//                     <MetricCard
//                         className={`w-full lg:w-1/4`}
//                         title="Total Revenue"
//                         value={`${analysisData?.data?.data?.summary?.total_revenue || 0} EGP`}
//                         icon={<GiReceiveMoney size={18} />}
//                         bgColor="bg-purple-50"
//                         textColor="text-purple-800"
//                         borderColor="border-purple-100"
//                     />
//                     <MetricCard
//                         className={`w-full lg:w-1/4`}
//                         title="Cancellation Rate"
//                         value={analysisData?.data?.data?.summary?.cancellation_rate}
//                         icon={<Users2Icon size={18} />}
//                         bgColor="bg-orange-50"
//                         textColor="text-orange-800"
//                         borderColor="border-orange-100"
//                     />
//                 </div>

//                 {/* Charts */}
//                 <div className="flex flex-col lg:flex-row justify-center gap-5 overflow-hidden">
//                     <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/4 ">
//                         <PieChart
//                             key={analysisData}
//                             label="Request Status Distribution"
//                             labels={analysisData?.data?.data?.charts?.status_distribution?.labels}
//                             dataPoints={analysisData?.data?.data?.charts?.status_distribution?.values}
//                         />
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/4 ">
//                         <LineChart
//                             key={analysisData}
//                             label='Request Trends'
//                             labels={analysisData?.data?.data?.charts?.request_trends?.labels}
//                             dataPoints={analysisData?.data?.data?.charts?.request_trends?.values}
//                         />
//                     </div>
//                 </div>

//                 <div className="flex flex-col gap-5">
//                     <div className="bg-white p-4 rounded-lg shadow w-full ">
//                         <LineChart
//                             key={analysisData}
//                             label='Top categories requested'
//                             labels={analysisData?.data?.data?.charts?.top_categories?.labels}
//                             dataPoints={analysisData?.data?.data?.charts?.top_categories?.values}
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
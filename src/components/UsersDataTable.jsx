import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import toast from 'react-hot-toast';
import { Tooltip } from '@heroui/tooltip';

export default function UsersDataTable({ users, loading, onStatusToggle }) {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        first_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        last_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
        gender: { value: null, matchMode: FilterMatchMode.EQUALS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [togglingUserId, setTogglingUserId] = useState(null);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const handleToggleClick = async (userId) => {
        setTogglingUserId(userId);
        try {
            await onStatusToggle(userId);
            toast.success("User status updated", {
                duration: 2000
            });
        } catch (error) {
            toast.error("Failed to update status", {
                duration: 3000
            });
        } finally {
            setTogglingUserId(null);
        }
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.first_name} {rowData.last_name}</span>
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        const statusClass = rowData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const isToggling = togglingUserId === rowData.id;

        return (
            <div className="flex align-items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                    {rowData.status}
                </span>
                <Tooltip
                    content={isToggling ? 'Updating...' : `${rowData.status === 'active' ? 'Deactivate' : 'Activate'} user`}
                    closeDelay={0}
                    delay={700}
                >
                    <Button
                        icon={`pi pi-${rowData.status === 'active' ? 'times' : 'check'}`}
                        className={`${rowData.status === 'active' ? 'text-red-500' : 'text-green-500'} ring-0`}
                        onClick={() => handleToggleClick(rowData.id)}
                        disabled={isToggling}
                        loading={isToggling}
                    />
                </Tooltip>
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return new Date(rowData.created_at).toLocaleDateString();
    };

    const header = (
        <div className="flex justify-content-between">
            <span className="p-input-icon-left">
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Search users..."
                    className="px-2 py-1 rounded-xl"
                />
            </span>
        </div>
    );

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden">
            <DataTable
                value={users}
                paginator
                rows={10}
                dataKey="id"
                filters={filters}
                filterDisplay="row"
                loading={loading}
                globalFilterFields={['first_name', 'last_name', 'email', 'phone', 'status']}
                header={header}
                emptyMessage="No users found."
            >
                <Column
                    header="Name"
                    filterField="first_name"
                    style={{ minWidth: '13rem' }}
                    className=''
                    body={nameBodyTemplate}
                    filter
                    filterPlaceholder="Search by name"
                />
                <Column
                    field="email"
                    header="Email"
                    filter
                    filterPlaceholder="Search by email"
                    style={{ minWidth: '16rem' }}
                />
                <Column
                    field="phone"
                    header="Phone"
                    filter
                    filterPlaceholder="Search by phone"
                    style={{ minWidth: '10rem' }}
                />
                <Column
                    field="gender"
                    header="Gender"
                    filter
                    filterPlaceholder="Search by gender"
                    style={{ minWidth: '8rem' }}
                />
                <Column
                    field="status"
                    header="Status"
                    style={{ minWidth: '12rem' }}
                    body={statusBodyTemplate}
                    filter
                    filterPlaceholder="Search by status"
                />
                <Column
                    field="created_at"
                    header="Joined Date"
                    style={{ minWidth: '6rem' }}
                    body={dateBodyTemplate}
                />
            </DataTable>
        </div>
    );
}
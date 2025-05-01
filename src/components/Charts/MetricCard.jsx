import React from 'react';

export default function MetricCard({
    className = '',
    title = '',
    value = 0,
    icon = null,
    bgColor = 'bg-white',
    textColor = 'text-gray-900',
    borderColor = 'border-gray-200',
    valueSize = 'text-2xl',
    titleSize = 'text-sm'
}) {
    return (
        <div className={`${bgColor} ${borderColor} border rounded-lg p-4 shadow-sm ${className}`}>
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    <span className={`${titleSize} font-medium ${textColor} capitalize`}>
                        {title}
                    </span>
                    {icon && (
                        <div className="p-2 rounded-full bg-opacity-20 bg-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
                <span className={`${valueSize} font-bold mt-2 ${textColor}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}
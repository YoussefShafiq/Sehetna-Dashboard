import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary components from Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({
    labels = [],
    dataPoints = [],
    backgroundColors = [
        '#bbe1ff',
        '#bdffd2',
        '#3499c5', // Dark Teal-Blue
        '#009379', // Teal

    ],

    hoverColors = [
        '#a8cae5',
        '#94e1ac',
        '#267192', // Brighter Teal
        '#009379', // Slightly Brighter Dark Teal-Blue

    ],
    borderWidth = 0,
    label = '',
    fontSize = 16,
    borderRadius = 10
}) {
    // Define chart data based on the props received
    const data = {
        labels: labels,
        datasets: [
            {
                label: label,
                data: dataPoints,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverColors,
                borderWidth: borderWidth,
                borderRadius: borderRadius,
            },
        ],
    };

    // Define chart options
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    padding: 10,
                    font: {
                        size: 12,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    pointRadius: 8,
                    align: 'start'
                },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const dataset = tooltipItem.dataset;
                        const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
                        const currentValue = dataset.data[tooltipItem.dataIndex];
                        const percentage = ((currentValue / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className='relative w-full'>
            {label && <h2 className='font-inter font-bold text-gray-900  mb-5 capitalize'>{label}</h2>}

            <Pie data={data} options={options} />

            {labels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {labels.map((label, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: backgroundColors[index] }}
                            ></div>
                            <span className="text-xs md:text-sm text-gray-800  capitalize">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
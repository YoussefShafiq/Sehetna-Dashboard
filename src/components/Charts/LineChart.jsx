import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register necessary components from Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Needed for area fill
);

export default function LineChart({
    labels,
    dataPoints,
    label,
    lineColors = [
        '#3499c5'
    ],
    pointColors = [
        '#3499c5',
    ],
    fillColors = [
        'rgba(52, 153, 197, 0.1)',
    ],
    borderWidth = 3,
    pointRadius = 5,
    tension = 0.4, // Higher tension for smoother curves
    fill = true, // Enable/disable area fill
}) {


    const data = {
        labels: labels,
        datasets: [
            {
                label: label,
                data: dataPoints,
                borderColor: lineColors[0],
                backgroundColor: fill ? fillColors[0] : 'transparent',
                pointBackgroundColor: pointColors,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: pointColors,
                pointHoverBorderColor: '#fff',
                borderWidth: borderWidth,
                pointRadius: pointRadius,
                pointHoverRadius: pointRadius + 2,
                tension: tension,
                fill: fill ? 'origin' : false, // Fill from origin (y=0)
                segment: {
                    // borderColor: ctx => ctx.p0.parsed.y > ctx.p1.parsed.y ? '#FF668E' : lineColors[0], // Change color if decreasing
                    borderColor: lineColors[0],
                },
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10,
                    padding: 5,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    pointRadius: 1,
                    align: 'start'
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        layout: {
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
        elements: {
            line: {
                cubicInterpolationMode: 'monotone', // Even smoother lines
            },
        },
    };

    return (
        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <Line
                data={data}
                options={options}
                height={400}
            />
        </div>
    );
}
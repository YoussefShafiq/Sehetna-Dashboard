import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components from Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function VerticalBarChart({
    labels,
    dataPoints,
    label = 'Progress',
    barSpacing = 0.5,
    backgroundColors = [
        '#3499c5'
    ],

    hoverColors = [
        '#3499c5',
    ],
    barThickness = 20,
    borderRadius = 50
}) {
    // Define chart data based on the props received
    const data = {
        labels: labels, // x-axis labels (e.g., task names or labels)
        datasets: [
            {
                label: label, // label for the dataset
                data: dataPoints, // y-axis data points representing progress (e.g., 50 for 50% progress)
                backgroundColor: backgroundColors,
                hoverColors: hoverColors, // bar color (progress bar color)
                borderWidth: 0,
                borderRadius: borderRadius, // Round the corners of the bars
                barThickness: barThickness, // Make the bars thicker (to simulate progress bars)
                hoverBackgroundColor: hoverColors, // Hover color effect
                hoverBorderColor: 'rgba(75, 192, 192, 1)', // Hover border color
            },
        ],
    };

    // Define chart options
    const options = {
        responsive: true,
        indexAxis: 'x', // Set to vertical bars (x-axis as the index axis)
        plugins: {
            title: {
                display: false,
                text: 'Vertical Bar Chart with Spacing',
            },
            legend: {
                position: 'top', // Position labels below the chart
                labels: {
                    boxWidth: 10, // Set the width of the color circle
                    padding: 5, // Add space between the legend text and the circle
                    usePointStyle: true, // Make legend labels circles instead of squares
                    pointStyle: 'circle', // Ensure the point style is a circle
                    pointRadius: 1, // Size of the circles
                    align: 'start'
                },
            },
        },
        layout: {
            backgroundColor: 'white', // Transparent background
        },
        scales: {
            x: {
                beginAtZero: true, // x-axis starts at zero (for progress)
                // Adjust spacing between bars using categoryPercentage
                categoryPercentage: barSpacing, // Adjust spacing between categories (bars)
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                beginAtZero: true, // y-axis starts at zero
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div>
            {/* <h2 className='font-inter font-bold text-gray-900'>{label}</h2> */}
            <Bar data={data} options={options} />
        </div>
    );
}

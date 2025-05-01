import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const DateRangePicker = ({ onDateChange, initialRange }) => {
    const [state, setState] = useState([
        {
            startDate: initialRange?.startDate || new Date(),
            endDate: initialRange?.endDate || new Date(),
            key: 'selection'
        }
    ]);

    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSelect = (ranges) => {
        const { selection } = ranges;
        setState([selection]);
        if (onDateChange) {
            onDateChange(selection);
        }
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    return (
        <div className="relative">
            <div
                className="flex items-center border rounded-md p-2 cursor-pointer bg-white"
                onClick={toggleDatePicker}
            >
                <span className="text-sm">
                    {format(state[0].startDate, 'MMM dd, yyyy')}
                    {' - '}
                    {format(state[0].endDate, 'MMM dd, yyyy')}
                </span>
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md">
                    <DateRange
                        editableDateInputs={true}
                        onChange={handleSelect}
                        moveRangeOnFirstSelection={false}
                        ranges={state}
                        maxDate={new Date()}
                    />
                    <div className="flex justify-end p-2 border-t">
                        <button
                            className="px-4 py-1 bg-blue-500 text-white rounded-md text-sm"
                            onClick={toggleDatePicker}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
import React, { useState, useRef, useEffect } from 'react';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './tasklist.css';
import clockicon from '../assets/clock.png';

function TaskList({ dateTime, onDatetimeChange }) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const dateTimePickerRef = useRef(null);

    const handleIconClick = () => {
        setIsPickerOpen(prev => !prev);
    };

    const handleClear = () => {
        onDatetimeChange(null);
        setIsPickerOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateTimePickerRef.current && !dateTimePickerRef.current.contains(event.target)) {
                setIsPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="input-with-datetime">
            
            <img className='clock-icon' onClick={handleIconClick} src={clockicon} height={30} width={30}/>
            {isPickerOpen && (
                <div ref={dateTimePickerRef} className="datetime-picker-wrapper">
                    <DateTime
                        value={dateTime}
                        onChange={(newDateTime) => {
                            onDatetimeChange(newDateTime);
                            setIsPickerOpen(false);
                        }}
                        input={false}
                        closeOnSelect={true}
                    />
                    <button className="clear-button" onClick={handleClear}>Clear</button>
                </div>
            )}
            <span className="selected-datetime" onClick={handleIconClick}>
                {dateTime ? dateTime.format('YYYY-MM-DD HH:mm') : 'Select Date & Time'}
            </span>
        </div>
    );
}

export default TaskList;

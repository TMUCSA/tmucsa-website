'use client';
import EventList from '@/components/events/eventList';
import LatestEvent from '@/components/events/latestEvent';
import { useState, useEffect } from 'react';

export default function Events() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try{
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error('Unable to load events');
                const payload = await response.json();
                const eventsData = payload.events.map(data => {
                    const date = new Date(data.date);
                    const images = data.images?.length ? data.images : (data.imageUrls || []).map((url) => ({ url, focalX: 0.5, focalY: 0.5 }))
                    return { 
                        ...data,
                        date: date,
                        images,
                        imageUrls: images.map((image) => image.url),
                    };
                });
                setAllEvents(eventsData);
                const years = [...new Set(eventsData.map(event => event.date.getFullYear()))].sort((a, b) => b - a);
                setAvailableYears(years);

                if(years.length > 0) {
                    setSelectedYear(years[0]);
                }

            } catch (err) {
                console.error("Error fetching events: ", err);
            }
        };

        fetchAllEvents();
    },[]);

    const filteredEvents = allEvents.filter(event => 
        event.date.getFullYear() === selectedYear
    );

    const mobileYears = availableYears.slice(0, 2);

    const yearButtonClass = "px-4 py-1 transition-all duration-200 hover:bg-transparent ";
    const buttonColor = "bg-[#1F1B3B] text-white";
    const buttonColorActive = "bg-white text-black hover:text-white px-8";

    const renderYearButtons = (years) =>
        years.map((year, index) => {
            const roundedClass = [
                index === 0 ? 'rounded-l-xl' : '',
                index === years.length - 1 ? 'rounded-r-xl' : ''
            ]
                .filter(Boolean)
                .join(' ');

            return (
                <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`${yearButtonClass} ${roundedClass} ${
                        selectedYear === year ? buttonColorActive : buttonColor
                    }`}
                >
                    {year}
                </button>
            );
        });

    return (
        <main className=' overflow-x-hidden pt-16 w-screen'>
            <LatestEvent />

            <div className='w-screen my-12 flex justify-center gap-1 text-xl text-white font-semibold font-jost md:hidden'>
                {renderYearButtons(mobileYears)}
            </div>

            <div className='hidden w-screen my-12 md:flex justify-center gap-1 text-xl text-white font-semibold font-jost'>
                {renderYearButtons(availableYears)}
            </div>

            {filteredEvents.length > 0 ? (
                <EventList events={filteredEvents} />
            ) : (
                <div className='w-screen py-8 px-6 text-center'>
                    No events found for {selectedYear}
                </div>
            )}
        </main>
    );
}

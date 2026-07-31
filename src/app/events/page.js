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

    const renderYearButtons = (years) =>
        years.map((year, index) => {
            return (
                <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`border px-5 py-2 font-jost text-sm tracking-wider transition sm:px-6 ${selectedYear === year ? 'border-beige bg-beige text-default' : 'border-white/15 text-white/55 hover:border-beige/50 hover:text-white'}`}
                >
                    {year}
                </button>
            );
        });

    return (
        <main className='relative overflow-hidden bg-default text-white'>
            <LatestEvent />

            <section className='relative mx-auto max-w-[1440px] px-6 pb-12 pt-24 sm:px-10 lg:px-16 lg:pb-16 lg:pt-32 xl:px-24'>
                <div className='pointer-events-none absolute right-[-12rem] top-0 h-96 w-96 rounded-full bg-navy/15 blur-[120px]' aria-hidden='true' />
                <div className='relative flex flex-col justify-between gap-10 border-b border-white/15 pb-10 md:flex-row md:items-end'>
                    <div>
                        <p className='font-jost text-xs tracking-[0.28em] text-beige/60'>THE ARCHIVE</p>
                        <h2 className='mt-5 font-josefin text-5xl font-semibold tracking-tight sm:text-7xl'>PAST EVENTS</h2>
                    </div>
                    <div className='flex max-w-full flex-wrap gap-2' aria-label='Filter events by year'>{renderYearButtons(availableYears)}</div>
                </div>
            </section>

            {filteredEvents.length > 0 ? (
                <EventList events={filteredEvents} />
            ) : (
                <div className='px-6 pb-28 pt-8 text-center font-jost text-white/55'>
                    No events found for {selectedYear}
                </div>
            )}
        </main>
    );
}

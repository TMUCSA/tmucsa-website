'use client';
import EventList from '@/components/events/eventList';
import LatestEvent from '@/components/events/latestEvent';
import Loader from '@/components/general/loader';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function Events() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try{
                const eventsQuery = query(
                    collection(db, 'events'),
                    orderBy('date', 'desc')
                );
                const querySnapshot = await getDocs(eventsQuery);
                const eventsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.date.toDate();
                    return { 
                        id: doc.id, 
                        ...data,
                        date: date
                    };
                });
                setAllEvents(eventsData);
                const years = [...new Set(eventsData.map(event => event.date.getFullYear()))].sort((a, b) => b - a);
                setAvailableYears(years);

                if(years.length > 0) {
                    setSelectedYear(years[0]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching events: ", err);
                setLoading(false);
            }
        };

        fetchAllEvents();
    },[]);

    const filteredEvents = allEvents.filter(event => 
        event.date.getFullYear() === selectedYear
    );

    const yearButtonClass = "px-4 py-1 transition-all duration-200 hover:bg-transparent ";
    const buttonColor = "bg-[#1F1B3B]";
    const buttonColorActive = "bg-[#3F3C59] px-8";

    if(loading){
        return <Loader />;
    }  

    return (
        <main className=' overflow-x-hidden pt-16 w-screen'>
            <LatestEvent />

            <div className='w-screen my-12 flex justify-center gap-1 text-xl text-white font-semibold font-jost'>
                <button onClick={() => setSelectedYear(availableYears[0])} className={`${yearButtonClass} rounded-l-xl ${selectedYear === availableYears[0] ? buttonColorActive : buttonColor }`}>
                    {availableYears[0]}
                </button>
                {availableYears.slice(1,availableYears.length-1).map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`${yearButtonClass} ${
                            selectedYear === year 
                                ? buttonColorActive : buttonColor
                        }`}
                    >
                        {year}
                    </button>
                ))}
                <button onClick={() => setSelectedYear(availableYears[availableYears.length - 1])} className={`${yearButtonClass} rounded-r-xl ${selectedYear === availableYears[availableYears.length - 1] ? buttonColorActive : buttonColor }`}>
                    {availableYears[availableYears.length - 1]}
                </button>
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
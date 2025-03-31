import React, { useEffect, useState } from 'react'
import Loader from '../general/loader';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const LatestEvent = () => {
    const [latestEvent, setLatestEvents] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        const fetchLatestEvent = async () => {
            try{
                const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'), limit(1));
                const querySnapshot = await getDocs(eventsQuery);
                const eventData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.date.toDate();
                    return { 
                        id: doc.id, 
                        ...data,
                        date: date
                    };
                });

                if(eventData.length > 0) {
                    setLatestEvents(eventData[0]);
                }
                setLoading(false);
            } catch(err) {
                console.error("Error fetching latest event: ", err);
                setLoading(false);
            }
        };

        fetchLatestEvent();
    },[]);

    if(loading){
        return <Loader />;
    }  

    if (!latestEvent) {
        return <div>No events found</div>;
      }
    
    return (
        <div 
            className='w-screen h-[80vh] relative bg-cover bg-center text-white font-jost'
            style={{ 
                backgroundImage: `url(${latestEvent.imageUrls[0]})`
            }}
        >
            <div className='absolute inset-0 bg-black bg-opacity-40'></div>
            
            <div className='relative z-10 p-6 flex flex-col justify-end h-full w-full gap-4'>
                <h2 className='text-6xl font-bold uppercase'>{latestEvent.name}</h2>
                <p className='text-3xl font-normal italic'>{latestEvent.description}</p>
                <div className='flex items-center justify-between w-full '>
                    <p className='text-xl '>
                        {format(latestEvent.date, 'MMMM d, yyyy')}
                    </p>
                    <a 
                        href={latestEvent.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className='flex items-center justify-center gap-4 text-white px-4 py-2 rounded hover:text-black text-2xl transition-all duration-200'
                    >
                        See More
                        <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                </div>
            </div>
        </div>
  )
}

export default LatestEvent
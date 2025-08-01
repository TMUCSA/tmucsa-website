import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

    const EventList = ({ events }) => {
        const [currentImageIndices, setCurrentImageIndices] = useState(events.map(() => 0));
        const intervalRef = useRef(null);
        const intervalTime = 5000;
      
        useEffect(() => {
          setCurrentImageIndices(events.map(() => 0));
      
          // start fresh interval
          startInterval();
          return () => clearInterval(intervalRef.current);
        }, [events]);
      
        const startInterval = () => {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setCurrentImageIndices(prev =>
              prev.map((idx, i) => {
                const len = events[i]?.imageUrls.length ?? 0;
                return len > 1 ? (idx + 1) % len : idx;
              })
            );
          }, intervalTime);
        };
      
        const handleDotClick = (eventIndex, imageIndex) => {
          clearInterval(intervalRef.current);              
          setCurrentImageIndices(prev => {
            const next = [...prev];
            next[eventIndex] = imageIndex;
            return next;
          });
          startInterval();
        };
        
        return (
            <div className='w-screen font-jost flex flex-col'>
                    {events.map((event,key) => (
                        <div 
                            key={event.id}
                            className={`flex overflow-hidden shadow-lg h-[60vw] md:h-[30vw] text-white ${key % 2 == 0 ? 'flex-row' : 'flex-row-reverse bg-black'}`}
                        >
                            <div className="flex flex-1 relative overflow-hidden">
                                <div 
                                className="flex transition-transform duration-500 ease-in-out h-full"
                                style={{ 
                                    transform: `translateX(-${currentImageIndices[key] * 100}%)`,
                                    width: `${event.imageUrls.length * 100}%`
                                }}
                            >
                                {event.imageUrls.map((url, index) => (
                                    <img 
                                        key={index}
                                        src={url} 
                                        alt={`${event.name} - Image ${index + 1}`}
                                        className='w-full h-full object-cover flex-shrink-0'
                                    />
                                ))}
                            </div>
                                {event.imageUrls.length > 1 && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2  bg-black bg-opacity-50 px-2 py-1 rounded-xl md:p-0 md:bg-opacity-0">
                                        {event.imageUrls.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleDotClick(key, index)}
                                                className={`w-3 h-3 rounded-full focus:outline-none hover:bg-gray-200 border border-black ${
                                                    currentImageIndices[key] === index 
                                                        ? 'bg-white' 
                                                        : 'bg-gray-500'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='absolute flex p-4 md:relative md:flex-1 flex-col md:px-12 md:justify-center'>
                                <h3 className='text-2xl md:text-5xl uppercase font-bold mb-2'>{event.name}</h3>
                                <p className='hidden md:block text-gray-400 mb-2 text-xl'>{event.description}</p>
                                <p className='text-sm md:text-lg mb-2'>
                                    {format(event.date, 'MMMM d, yyyy')}
                                </p>
                                <div className="flex items-center justify-end">
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='inline-flex items-center px-4 py-2 rounded-xl justify-end text-white md:bg-[#1F1B3B] hover:text-[#1F1B3B] md:hover:bg-white transition-all duration-100'
                                    >
                                        Details
                                        <FontAwesomeIcon icon={faArrowRight} className='ml-2 md:hidden' />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        );
    }

    export default EventList
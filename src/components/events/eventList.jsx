import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

const EventList = ({ events }) => {
    const [currentImageIndices, setCurrentImageIndices] = useState(events.map(() => 0));
    const [isPaused, setIsPaused] = useState(events.map(() => false));

    useEffect(() => {
        setCurrentImageIndices(events.map(() => 0));
        setIsPaused(events.map(() => false));
    }, [events]);

    useEffect(() => {
        const hasMultipleImages = events.some(event => event.imageUrls.length > 1);
        if (!hasMultipleImages) return;

        const interval = setInterval(() => {
            setCurrentImageIndices(prevIndices =>
                prevIndices.map((index, i) => {
                    if (i >= events.length || isPaused[i]) return index;
                    const totalImages = events[i].imageUrls.length;
                    return (index + 1) % totalImages;
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [events, isPaused]); // Added isPaused to dependencies

    const handleDotClick = (eventIndex, imageIndex) => {
        setCurrentImageIndices(prevIndices => {
            const newIndices = [...prevIndices];
            newIndices[eventIndex] = imageIndex;
            return newIndices;
        });
        setIsPaused(prevPaused => {
            const newPaused = [...prevPaused];
            newPaused[eventIndex] = true;
            return newPaused;
        });
    };

    return (
        <div className='w-screen font-jost flex flex-col'>
            {events.map((event, key) => (
                <div 
                    key={event.id}
                    className={`relative w-full overflow-hidden shadow-lg
                        md:flex md:h-[30vw] md:${key % 2 === 0 ? 'flex-row' : 'flex-row-reverse bg-black'}`}
                >
                    {/* Image Slider */}
                    <div className="relative w-full h-64 md:h-full md:flex-1 overflow-hidden">
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
                        {/* Navigation Dots */}
                        {event.imageUrls.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
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

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white md:relative md:flex-1 md:flex md:flex-col md:px-12 md:justify-center md:p-0">
                        <h3 className="text-2xl font-bold uppercase mb-2 md:text-5xl">{event.name}</h3>
                        {/* Hide description on mobile */}
                        <p className="hidden md:block text-gray-400 mb-2 text-xl">{event.description}</p>
                        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-2">
                            <p className="text-base md:text-lg">
                                {format(event.date, 'MMMM d, yyyy')}
                            </p>
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-xl text-white bg-[#1F1B3B] hover:text-[#1F1B3B] hover:bg-white transition-all duration-100 md:self-end"
                            >
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventList;
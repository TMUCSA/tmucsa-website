    import React, { useEffect, useState } from 'react'
    import { format } from 'date-fns';

    const EventList = ({ events }) => {
        const [currentImageIndices, setCurrentImageIndices] = useState(events.map(() => 0));
        const [isFading, setIsFading] = useState(events.map(() => false));

        useEffect(() => {
            setCurrentImageIndices(events.map(() => 0));
            setIsFading(events.map(() => false));
        }, [events]);

        useEffect(() => {
            const hasMultipleImages = events.some(event => event.imageUrls.length > 1);
            if (!hasMultipleImages) return;

            const interval = setInterval(() => {
                setIsFading(prev => prev.map(() => true));
                setTimeout(() => {
                    setCurrentImageIndices(prevIndices =>
                        prevIndices.map((index, i) => {
                            if (i >= events.length) return 0;
                            const totalImages = events[i].imageUrls.length;
                            return (index + 1) % totalImages;
                        })
                    );
                    setIsFading(prev => prev.map(() => false));
                }, 500);
            }, 5000);
    
            return () => clearInterval(interval);
        }, [events]);

        const handleDotClick = (eventIndex, imageIndex) => {
            setIsFading(prev => {
                const newFading = [...prev];
                newFading[eventIndex] = true;
                return newFading;
            });
            setTimeout(() => {
                setCurrentImageIndices(prevIndices => {
                    const newIndices = [...prevIndices];
                    newIndices[eventIndex] = imageIndex;
                    return newIndices;
                });
                setIsFading(prev => {
                    const newFading = [...prev];
                    newFading[eventIndex] = false;
                    return newFading;
                });
            }, 500);
        };
        
        return (
            <div className='w-screen font-jost flex flex-col'>
                    {events.map((event,key) => (
                        <div 
                            key={event.id}
                            className={`flex overflow-hidden shadow-lg h-[30vw] text-white ${key % 2 == 0 ? 'flex-row' : 'flex-row-reverse bg-black'}`}
                        >
                            <div className="flex flex-1 relative">
                                <img 
                                    src={event.imageUrls[currentImageIndices[key]]} 
                                    alt={`${event.name} - Image ${currentImageIndices[key] + 1}`}
                                    className={`w-full h-full object-cover transition-opacity duration-1000 ${
                                        isFading[key] ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                                {event.imageUrls.length > 1 && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {event.imageUrls.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleDotClick(key, index)}
                                                className={`w-2 h-2 rounded-full focus:outline-none hover:bg-gray-200 border border-black ${
                                                    currentImageIndices[key] === index 
                                                        ? 'bg-white' 
                                                        : 'bg-gray-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-1 flex-col px-12 justify-center'>
                                <h3 className='text-5xl uppercase font-bold mb-2'>{event.name}</h3>
                                <p className='text-gray-400 mb-2 text-xl'>{event.description}</p>
                                <p className='text-lg mb-2'>
                                    {format(event.date, 'MMMM d, yyyy')}
                                </p>
                                <div className="flex items-center justify-end">
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='inline-flex items-center px-4 py-2 rounded-xl justify-end text-white bg-[#1F1B3B] hover:text-[#1F1B3B] hover:bg-white transition-all duration-100'
                                    >
                                        Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        );
    }

    export default EventList
import React from 'react'
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const EventList = ({ events }) => {
    return (
        <div className='w-screen py-8 px-6 font-jost'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {events.map(event => (
                    <div 
                        key={event.id}
                        className='bg-white text-black rounded-lg overflow-hidden shadow-lg'
                    >
                        <img 
                            src={event.imageUrls[0]} 
                            alt={event.name}
                            className='w-full h-48 object-cover'
                        />
                        <div className='p-4'>
                            <h3 className='text-xl font-bold mb-2'>{event.name}</h3>
                            <p className='text-gray-600 mb-2'>{event.description}</p>
                            <p className='text-sm mb-2'>
                                {format(event.date, 'MMMM d, yyyy')}
                            </p>
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='inline-flex items-center text-blue-600 hover:text-blue-800'
                            >
                                Details
                                <FontAwesomeIcon icon={faArrowRight} className='ml-2' />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EventList
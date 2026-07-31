/* eslint-disable @next/next/no-img-element */
// Keep the pre-optimized event images native for predictable slideshow crop behavior.
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Arrow = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 17L17 7M8 7h9v9" /></svg>;

    const EventList = ({ events }) => {
        const [currentImageIndices, setCurrentImageIndices] = useState(events.map(() => 0));
        const intervalRef = useRef(null);
        const intervalTime = 5000;
      
        const startInterval = useCallback(() => {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setCurrentImageIndices(prev =>
              prev.map((idx, i) => {
                const len = events[i]?.images?.length ?? events[i]?.imageUrls?.length ?? 0;
                return len > 1 ? (idx + 1) % len : idx;
              })
            );
          }, intervalTime);
        }, [events]);

        useEffect(() => {
          setCurrentImageIndices(events.map(() => 0));
          startInterval();
          return () => clearInterval(intervalRef.current);
        }, [events, startInterval]);
      
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
            <div className='mx-auto flex max-w-[1440px] flex-col gap-16 px-6 pb-28 font-jost sm:px-10 lg:gap-24 lg:px-16 lg:pb-36 xl:px-24'>
                    {events.map((event,key) => (
                        <motion.article
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.65 }}
                            className={`grid overflow-hidden border border-white/15 bg-[#0E0C24] text-white md:grid-cols-2 ${key % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-black md:aspect-auto md:min-h-[500px]">
                                {(event.images || event.imageUrls.map((url) => ({ url }))).map((image, index) => (
                                    <img 
                                        key={index}
                                        src={image.url}
                                        alt={image.alt || `${event.name} - Image ${index + 1}`}
                                        loading={key === 0 && index === 0 ? 'eager' : 'lazy'}
                                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${currentImageIndices[key] === index ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ objectPosition: `${(image.focalX ?? 0.5) * 100}% ${(image.focalY ?? 0.5) * 100}%` }}
                                    />
                                ))}
                                {(event.images?.length || event.imageUrls.length) > 1 && (
                                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 bg-default/65 px-3 py-2 backdrop-blur-sm">
                                        {(event.images || event.imageUrls).map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleDotClick(key, index)}
                                                aria-label={`Show image ${index + 1} of ${event.name}`}
                                                className={`h-1.5 transition-all focus:outline-none ${
                                                    currentImageIndices[key] === index 
                                                        ? 'w-8 bg-beige'
                                                        : 'w-3 bg-white/40 hover:bg-white'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='relative flex min-h-[390px] flex-col justify-between p-7 sm:p-10 lg:p-14'>
                                <div className='flex items-start justify-between gap-6'>
                                    <p className='text-xs tracking-[0.25em] text-beige/55'>{String(key + 1).padStart(2, '0')} / EVENT</p>
                                    <p className='text-xs uppercase tracking-[0.16em] text-white/45'>{format(event.date, 'MMM d, yyyy')}</p>
                                </div>
                                <div className='my-12'>
                                    <h2 className='font-josefin text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-5xl'>{event.name}</h2>
                                    <p className='mt-6 font-light leading-7 text-white/60'>{event.description}</p>
                                </div>
                                <div className="border-t border-white/15 pt-6">
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='group inline-flex w-full items-center justify-between font-jost text-sm font-medium text-white transition hover:text-beige'
                                    >
                                        Explore this event
                                        <span className='text-beige transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5'><Arrow /></span>
                                    </a>
                                </div>
                            </div>
                        </motion.article>
                    ))}
            </div>
        );
    }

    export default EventList

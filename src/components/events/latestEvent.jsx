import React, { useEffect, useState } from 'react'
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function Arrow() {
    return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 12h14m-5-5 5 5-5 5" /></svg>
}

const LatestEvent = () => {
    const [latestEvent, setLatestEvents] = useState(null);
  
    useEffect(() => {
        const fetchLatestEvent = async () => {
            try{
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error('Unable to load events');
                const payload = await response.json();
                const eventData = payload.events.map(data => {
                    const date = new Date(data.date);
                    const images = data.images?.length ? data.images : (data.imageUrls || []).map((url) => ({ url, focalX: 0.5, focalY: 0.5 }))
                    return { 
                        ...data,
                        date: date,
                        images,
                        imageUrls: images.map((image) => image.url),
                    };
                });

                if(eventData.length > 0) {
                    setLatestEvents(eventData[0]);
                }
            } catch(err) {
                console.error("Error fetching latest event: ", err);
            }
        };

        fetchLatestEvent();
    },[]);

    if (!latestEvent) {
        return <section className="h-[78svh] min-h-[620px] animate-pulse bg-white/[0.03]" aria-label="Loading latest event" />;
      }
    
    return (
        <section
            className='relative h-[84svh] min-h-[680px] w-full overflow-hidden bg-cover bg-center text-white'
            style={{ 
                backgroundImage: `url(${latestEvent.images[0]?.url})`,
                backgroundPosition: `${(latestEvent.images[0]?.focalX ?? 0.5) * 100}% ${(latestEvent.images[0]?.focalY ?? 0.5) * 100}%`,
            }}
        >
            <div className='absolute inset-0 bg-gradient-to-r from-default/55 via-default/55 to-default/10' />
            <div className='absolute inset-0 bg-gradient-to-t from-default via-transparent to-default/35' />

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }} className='relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16 pt-32 sm:px-10 sm:pb-20 lg:px-16 xl:px-24'>
                <div className='mb-auto flex items-center gap-4 font-jost text-[11px] uppercase tracking-[0.28em] text-white/60 sm:text-xs'>
                    <span>Events</span><span className='h-px w-14 bg-beige/70' /><span>Latest</span>
                </div>
                <p className='font-jost text-xs uppercase tracking-[0.25em] text-beige/65'>Featured event · {format(latestEvent.date, 'MMMM d, yyyy')}</p>
                <h1 className='mt-5 max-w-5xl font-josefin text-[clamp(3.25rem,8vw,7.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.045em]'>{latestEvent.name}</h1>
                <div className='mt-8 flex max-w-4xl flex-col gap-7 border-t border-white/25 pt-7 sm:flex-row sm:items-end sm:justify-between'>
                    <p className='max-w-2xl font-jost text-lg font-light leading-8 text-white/70 sm:text-xl'>{latestEvent.description}</p>
                    <a 
                        href={latestEvent.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className='group inline-flex shrink-0 items-center justify-between gap-8 bg-beige px-6 py-4 font-jost text-sm font-medium text-default transition hover:bg-white'
                    >
                        View event
                        <span className='transition-transform group-hover:translate-x-1'><Arrow /></span>
                    </a>
                </div>
            </motion.div>
        </section>
  )
}

export default LatestEvent

import React, { useEffect, useRef, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export default function Banner() {
    const videoRef = useRef(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const offset = 1400;

    useEffect(() => {
        const fetchVideoUrl = async () => {
            try {
                const videoRef = ref(storage, 'parallax-banner/parallax-video.mp4');
                const url = await getDownloadURL(videoRef);
                setVideoUrl(url);
            } catch (error) {
                console.error('Error fetching parallax video: ', error);
            }
        };

        fetchVideoUrl();
    }, []);

    const handleScroll = () => {
        if (videoRef.current) {
            const scrollPosition = window.scrollY - offset;
            videoRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`; // Adjust the multiplier for the effect
        }
    };

    useEffect(() => {
        let requestId;

        const onScroll = () => {
            requestId = requestAnimationFrame(handleScroll);
        };

        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (requestId) {
                cancelAnimationFrame(requestId);
            }
        };
    }, []);

    return (
        <section className="relative h-[62vh] min-h-[460px] w-full overflow-hidden border-y border-white/10">
            <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-[115%] w-full object-cover"
                aria-label="Background video for parallax effect"
            />
            <div className="absolute inset-0 bg-default/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-default/75 via-transparent to-default/30" />
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div>
                    <p className="font-jost text-[10px] uppercase tracking-[0.4em] text-beige/70 sm:text-xs">More than a student group</p>
                    <h2 className="mt-5 font-josefin text-[clamp(2.75rem,7vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">Culture in<br /><span className="text-beige">motion.</span></h2>
                </div>
            </div>
        </section>
    );
}

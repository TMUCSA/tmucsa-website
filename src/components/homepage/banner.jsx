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
        <div className="w-screen h-[50vw] overflow-hidden relative">
            <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute transform h-screen w-screen object-cover"
                aria-label="Background video for parallax effect"
            />
            <div className="absolute inset-0 bg-black opacity-30" />
        </div>
    );
}
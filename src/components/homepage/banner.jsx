import React, { useEffect, useRef } from 'react';

export default function Banner() {
    const videoRef = useRef(null);
    const screenHeight = window.innerHeight;
    const offset = 300;

    const handleScroll = () => {
        if (videoRef.current) {
            const scrollPosition = window.scrollY - screenHeight - offset;
            videoRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`; // Adjust the multiplier for the effect
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-screen h-[700px] overflow-hidden relative">
            <video
                ref={videoRef}
                src="/videos/csa_picnic4.mp4" // Update this with the actual path to your video
                autoPlay
                loop
                muted
                className="absolute transform h-full w-full"
                style={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-black opacity-30" />
        </div>
    );
}

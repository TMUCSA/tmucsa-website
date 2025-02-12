'use client';
import { Carousel, Description, Follow } from '@/components';
import Banner from '@/components/homepage/banner';
import Body from '@/components/homepage/body';
import Actions from '@/components/homepage/actions';
import Loader from '@/components/general/loader';
import { useState, useEffect } from 'react';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Simulate loading process
        const timer = setTimeout(() => {
            setIsLoading(false); // Set loading to false when content is ready
        }, 100); // Adjust the timeout if needed

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    return (
        <main className=' overflow-x-hidden'>
            {isLoading ? (
                <Loader /> // Show the loader while loading
            ) : (
                <>
                    <Carousel />
                    <Description />
                    <Banner />
                    <Body />
                    {/* <Actions /> */}
                </>
            )}
        </main>
    );
};
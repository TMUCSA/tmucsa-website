'use client';
import { Carousel, Description, Follow } from '@/components';
import Banner from '@/components/homepage/banner';
import Body from '@/components/homepage/body';
import Actions from '@/components/homepage/actions';
import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        window.scrollTo({ top: 0 });
    },[]);

    return (
        <main>
            <Carousel />
            <Description />
            <Banner />
            <Body />
            {/* <Actions /> */}
        </main>
    );
};
'use client';
import { Carousel, Description, Follow } from '@/components';
import Banner from '@/components/homepage/banner';
import Body from '@/components/homepage/body';

export default function Home() {
    return (
        <main>
            <Carousel />
            <Description />
            <Banner />
            <Body />
        </main>
    );
};
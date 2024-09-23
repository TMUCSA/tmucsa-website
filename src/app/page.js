'use client';
import { Carousel, Description, Follow } from '@/components';
import Banner from '@/components/homepage/banner';

export default function Home() {
    return (
        <main>
            <Carousel />
            <Description />
            <Banner />
        </main>
    );
};
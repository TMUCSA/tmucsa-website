'use client';
import { Carousel, Description, Follow } from '@/components';
import Banner from '@/components/homepage/banner';
import Body from '@/components/homepage/body';
import Actions from '@/components/homepage/actions';

export default function Home() {
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
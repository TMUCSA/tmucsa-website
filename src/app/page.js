'use client';
import { Carousel, Description, Follow } from '@/components';
import './globals.css'
import '/src/app/fonts.css'

export default function Home() {
    return (
        <main className='bg-default'>
            <Carousel />
            <Description />
            <Follow />
        </main>
    );
};
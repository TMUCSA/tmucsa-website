'use client';
import LatestEvent from '@/components/events/latestEvent';
import { useState, useEffect } from 'react';

export default function Events() {
    return (
        <main className=' overflow-x-hidden pt-20'>
            <h1 className='font-josefin text-center font-black text-6xl uppercase text-white'> events </h1>
            <LatestEvent />
        </main>
    );
}
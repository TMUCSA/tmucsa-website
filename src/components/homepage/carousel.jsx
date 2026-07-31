import { useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Title from './title';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Carousel() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);
    
    const fetchImages = async () => {

        // try {
        //     const response = await fetch('/data/carousel-pictures.json');
        //     const data = await response.json();
        //     setImages(data);
        // } catch (err) {
        //     console.error(err);
        // }
        try{
            console.log("fetching carousel...");
            const querySnapshot = await getDocs(collection(db,'carousel-images'));
            const fetchedImages = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0));
            setImages(fetchedImages);
        } catch (err) {
            console.error("big error: ", err);
        }

    };

    return (
        <section className="relative min-h-[720px] h-[100svh] overflow-hidden bg-default">
            <Title/>
            
            <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                autoplay={{ delay: 2500 }}
                loop={images.length > 1 ? true : false}
                className="absolute inset-0 h-full w-full"
            >
                {images.map(image => (
                    <SwiperSlide key={image.id} className="swiper-slide relative">
                        <Image
                            src={image.imageUrl}
                            alt={image.imageAlt || 'TMUCSA community event'}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-default/90 via-default/30 to-transparent" />
                        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-default via-transparent to-default/20" />

                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="pointer-events-none absolute inset-x-6 bottom-8 z-20 h-px bg-white/15 sm:inset-x-10 lg:inset-x-16 xl:inset-x-24" aria-hidden="true" />
        </section>
    );
}

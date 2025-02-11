import { useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Title from './title';
import Image from "next/legacy/image";
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
            const fetchedImages = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
            console.log("fetched: ", fetchedImages);
            setImages(fetchedImages);
        } catch (err) {
            console.error("big error: ", err);
        }

    };

    return (
        <div className="relative">
            <Title/>
            
            <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                autoplay={{ delay: 2500 }}
                loop={images.length > 1 ? true : false}
                className="h-svh mt-12 relative overflow-hidden"
            >
                {/* {images.map((image, index) => (
                    <SwiperSlide key={index} className="swiper-slide relative">
                        <Image
                            src={image.path}
                            alt={image.alt}
                            layout='fill'
                            priority={true}
                            className="absolute inset-0 z-[-1] bg-fixed bg-cover bg-center object-cover"
                        />
                        <div className="absolute h-full inset-x-0 bottom-0 bg-gradient-to-t from-default to-transparent z-[1]" />

                    </SwiperSlide>
                ))} */}
                {images.map(image => (
                    <SwiperSlide key={image.id} className="swiper-slide relative">
                        <Image
                            src={image.imageUrl}
                            alt={image.imageAlt}
                            layout='fill'
                            priority={true}
                            className="absolute inset-0 z-[-1] bg-fixed bg-cover bg-center object-cover"
                        />
                        {/* Adding gradient overlay */}
                        <div className="absolute h-full inset-x-0 -bottom-1 bg-gradient-to-t from-default to-transparent z-[1]" />

                    </SwiperSlide>
                ))}
            </Swiper>

        </div>
    );
}

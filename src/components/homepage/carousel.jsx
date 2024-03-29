import { useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Title from './title';
import Image from "next/legacy/image";

export default function Carousel() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('/data/carousel-pictures.json');
            const data = await response.json();
            setImages(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative">
            <Title title="TMUCSA" />
            
            <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                autoplay={{ delay: 2500 }}
                loop={images.length > 1 ? true : false}
                className="h-screen relative overflow-hidden"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index} className="swiper-slide">
                        <Image
                            src={image.path}
                            alt={image.alt}
                            layout='fill'
                            priority={true}
                            className="absolute inset-0 z-[-1] bg-fixed bg-cover bg-center object-cover"
                        />
                    
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white z-10">
                            <h3 className="text-xl">{image.alt}</h3>
                        </div>    
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

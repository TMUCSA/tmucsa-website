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
            <Title/>
            
            <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                autoplay={{ delay: 2500 }}
                loop={images.length > 1 ? true : false}
                className="h-[1100px] lg:h-[800px] sm:h-[500px] mt-12 relative overflow-hidden"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index} className="swiper-slide relative">
                        <Image
                            src={image.path}
                            alt={image.alt}
                            layout='fill'
                            priority={true}
                            className="absolute inset-0 z-[-1] bg-fixed bg-cover bg-center object-cover"
                        />
                        {/* Adding gradient overlay */}
                        <div className="absolute h-full inset-x-0 bottom-0 bg-gradient-to-t from-default to-transparent z-[1]" />

                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

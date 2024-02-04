import { useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Title from './title';

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
            <Title />
            
            <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                autoplay={{ delay: 2500 }}
                loop={images.length > 1 ? true : false}
                className="h-[90vh] relative overflow-hidden"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index} className="swiper-slide">
                        <div
                            className="absolute inset-0 z-[-1] bg-fixed bg-cover bg-center"
                            style={{ backgroundImage: `url('${image.path}')` }}
                        ></div>
                    
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white z-10">
                            <h3 className="text-xl">{image.alt}</h3>
                        </div>    
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

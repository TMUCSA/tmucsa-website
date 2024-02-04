import { useState, useEffect } from 'react';

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

    console.log(images);

    return (
        <div>

        </div>
    );
}
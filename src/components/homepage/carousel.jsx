import useRemoteData from '@/hooks/useRemoteData';
import ContentStatus from '@/components/general/ContentStatus';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Title from './title';
import Image from 'next/image';
import { collection, getDocsFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function loadImages() {
  const snapshot = await getDocsFromServer(collection(db, 'carousel-images'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(image => image.imageUrl).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export default function Carousel() {
    const { data, loading, error, retry } = useRemoteData(loadImages);
    const images = data || [];

    return (
        <section className="relative min-h-[720px] h-[100svh] overflow-hidden bg-default">
            <Title/>
            <ContentStatus loading={loading} error={error} retry={retry} label="photos" emptyMessage={!images.length ? 'No photos have been published yet.' : null} className="absolute inset-x-0 top-24 z-20 bg-default/80 !py-4" />
            
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

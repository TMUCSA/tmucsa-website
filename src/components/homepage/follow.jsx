import { useEffect, useState } from 'react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Link from 'next/link';
import Image from 'next/legacy/image';

export default function Follow() {
    const [instagramData, setInstagramData] = useState([]);

    useEffect(() => {
        fetchInstagramData();
    }, []);

    const fetchInstagramData = async () => {
        try {
            const data = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,children{media_url,thumbnail_url}&access_token=${process.env.NEXT_PUBLIC_INSTAGRAM_KEY}`);
            const feed = await data.json();
            setInstagramData(feed.data.slice(0, 13));
        } catch (err) {
            console.error(err);
        }
    }

    console.log(instagramData);
    
    return (
        <main className='text-white'>
            <h1 className='text-center text-[2rem] md:text-[3rem] md:leading-[0.9] lg:text-[4rem] lg:leading-[0.9] font-bold mb-4'> Follow our Instagram! </h1>

            <p className='text-center md:text-[1.1rem] lg:text-2xl'>
                check out our instagram at <Link className='underline text-blue-400 hover:text-blue-600 hover:scale-110 transition-all' href='https://www.instagram.com/tmucsa/' target='_blank'>
                    @tmucsa
                </Link>
            </p>
            
            <div className='flex flex-wrap justify-center items-center'> 
                {instagramData.map((post) => (
                    <div key={post.id} className='w-[300px] h-[300px] relative m-4'>
                        {post.media_type === 'IMAGE' ? (
                            <Link href={post.permalink} target='_blank'>
                                <Image
                                    src={post.media_url}
                                    alt={post.id}
                                    layout='fill'
                                    className='w-full h-full object-cover rounded-lg'
                                />
                            </Link>
                        ) : post.media_type === 'VIDEO' ? (
                            <video
                                src={post.media_url}
                                alt={post.id}
                                className='w-full h-full object-cover rounded-lg'
                                controls
                            />
                        ) : post.media_type === 'CAROUSEL_ALBUM' ? (
                            <Link href={post.permalink} target='_blank'>
                                <Swiper
                                    modules={[Pagination, Autoplay]}
                                    slidesPerView={1}
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 2500 }}
                                    loop={post.children.data.length > 1 ? true : false}
                                    className="h-full relative overflow-hidden"
                                >
                                    {post.children.data.map((image, index) => (
                                        <SwiperSlide key={index} className="swiper-slide">
                                            <Image
                                                src={image.media_url}
                                                alt={post.id}
                                                layout='fill'
                                                priority={true}
                                                className='absolute inset-0 z-[-1] bg-fixed bg-cover bg-center object-cover rounded-lg'
                                            />
                                        </SwiperSlide>
                                    ))}
                                
                                </Swiper>
                            </Link>
                        ) : null}
                    </div>
                ))}
            </div>
        </main>
    );
}

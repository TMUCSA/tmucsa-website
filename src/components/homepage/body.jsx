import React from 'react';
import { useEffect, useState } from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSiteContent } from '@/components/general/SiteContentProvider';

function imageAlt(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

export default function Body() {
  const content = useSiteContent('home');
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [images,setImages] = useState([]);

  const { ref, inView } = useInView({
    threshold: 0.5, // Adjust this threshold as needed
    triggerOnce: true, // This ensures the animation only triggers once
  });

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const fetchImages = async () => {
    try{
      const querySnapshot = await getDocs(collection(db,'home-images'));
      const fetchedImages = Object.fromEntries(querySnapshot.docs.map(doc => [doc.id, {id: doc.id, ...doc.data() }]));
      setImages([fetchedImages.top, fetchedImages.bottom])
    } catch (err){
      console.error('failed to fetch body: ', err);
    }
  }

  useEffect(() => {
    fetchImages();
  },[]);

  useEffect(() => {
    if (inView && !animationTriggered) {
      setAnimationTriggered(true);
    }
  }, [inView, animationTriggered]);

  const topImageUrl = typeof images[0]?.imageUrl === 'string' ? images[0].imageUrl.trim() : '';
  const bottomImageUrl = typeof images[1]?.imageUrl === 'string' ? images[1].imageUrl.trim() : '';

  return (
    <div className="flex flex-col items-center justify-center gap-12 lg:gap-36 my-12 sm:my-24 lg:my-36 xl:mx-40">
      <div className="flex flex-col sm:flex-row gap-12 sm:gap-8 lg:gap-16 justify-between sm:items-center mx-6 sm:mx-12 lg:mx-40">
        <div className="text-white flex flex-col justify-between gap-12 sm:gap-12 lg:gap-24 sm:w-1/2">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView= "visible"
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left"
          >
            <h1 className="font-josefin font-semibold text-4xl lg:text-4xl lg:font-bold xl:text-2xl">OUR <span className="text-beige">GOAL</span></h1>
            <div className="mt-4 flex ">
              <div className="bg-white w-[3px] h-20 mr-8" />
              <p className="font-jost text-wrap font-light text-xl lg:text-2xl xl:text-lg">
                {content.ourGoal}
              </p>
            </div>
          </motion.div>
          <motion.div 
            variants={slideInRight} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className="text-right mt-0"
          >
            <h1 className="font-josefin font-semibold text-4xl lg:text-4xl lg:font-bold xl:text-2xl">WHAT WE <span className="text-navy">OFFER</span></h1>
            <div className="mt-4 flex ">
              <p className="font-jost text-wrap font-light text-xl lg:text-2xl xl:text-lg">
                {content.weOffer}
              </p>
              <div className="bg-white w-[3px] h-20 ml-8" />
            </div>
          </motion.div>
        </div>
        <motion.div 
          variants={fadeIn} 
          initial="hidden" 
          whileInView="visible" 
            viewport={{once: true}}
          transition={{ duration: 0.8 }}
          className="sm:w-1/2 relative h-64 sm:h-[30rem]">
          {topImageUrl ? (
            <Image
              src={topImageUrl}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              alt={imageAlt(images[0]?.imageAlt, 'TMUCSA community gathering')}
            />
          ) : (
            <div className="absolute inset-0 bg-white/5" aria-hidden="true" />
          )}
        </motion.div>
      </div>
      <div className="flex flex-col-reverse gap-12 sm:gap-8 lg:gap-16 sm:flex-row justify-between sm:items-center mx-6 sm:mx-12 lg:mx-40">
        <motion.div
          variants={fadeIn} 
          initial="hidden" 
          whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
          className="sm:w-1/2 relative h-64 sm:h-[30rem]">
            {bottomImageUrl ? (
              <Image
                src={bottomImageUrl}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                alt={imageAlt(images[1]?.imageAlt, 'TMUCSA student group activity')}
              />
            ) : (
              <div className="absolute inset-0 bg-white/5" aria-hidden="true" />
            )}
          </motion.div>
        <div className="text-white flex flex-col justify-between gap-12 sm:gap-12 lg:gap-24 sm:w-1/2">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left">
            <h1 className="font-josefin font-semibold text-4xl lg:text-4xl lg:font-bold xl:text-2xl">OUR <span className="text-beige">VALUES</span></h1>
            <div className="mt-4 flex ">
              <div className="bg-white w-[3px] h-20 mr-8" />
              <p className="font-jost text-wrap font-light text-xl lg:text-2xl xl:text-lg">
                {content.values}
              </p>
            </div>
          </motion.div>
          <motion.div 
            variants={slideInRight} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className="text-right"
            >
            <h1 className="font-josefin font-semibold text-4xl lg:text-4xl lg:font-bold xl:text-2xl"><span className="text-navy">JOIN</span> US</h1>
            <div className="mt-4 flex h-fit ">
              <p className="font-jost text-wrap font-light text-xl lg:text-2xl xl:text-lg">
                {content.joinUs}
              </p>
              <div className="bg-white w-[3px] h-20 ml-8" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

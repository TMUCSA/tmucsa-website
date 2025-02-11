import React from 'react';
import { useEffect, useState } from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Body() {
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [images,setImages] = useState([]);

  const { ref, inView } = useInView({
    threshold: 0.5, // Adjust this threshold as needed
    triggerOnce: true, // This ensures the animation only triggers once
  });

  const ourGoal = "To foster an inclusive community where Chinese students can celebrate culture, form lasting connections, and grow together academically and socially through engaging activities and events.";
  const weOffer = "Vibrant events, from lively parties to cultural celebrations, that create a welcoming space for students to connect and form lasting friendships.";
  const values = "We prioritize building meaningful student connections while celebrating, representing, and sharing the richness of Chinese culture with our community.";
  const joinUs = "Dive into a community where culture meets connection. Whether you're looking to make new friends or celebrate Chinese traditions, TMUCSA is your go-to spot to belong and have a great time.";

  const image1Path = "/images/csa-candid.jpg";
  const image2Path = "/images/orientation-2023.jpg";

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
      const fetchedImages = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
      console.log('fetched body 1: ', fetchedImages[0]);
      console.log('fetched body 2: ', fetchedImages[1]);
      setImages(fetchedImages);
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

  useEffect(() => {
    console.log('images updated: ', images);
  }, [images]); // This will run whenever `images` changes

  return (
    <div className="flex flex-col items-center justify-center gap-12 my-12 sm:my-24 lg:my-20 xl:mx-40">
      <div className="flex flex-col sm:flex-row justify-between mx-6 sm:mx-12">
        <div className="text-white flex flex-col justify-between sm:w-1/2">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView= "visible"
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left"
          >
            <h1 className="font-josefin font-semibold text-4xl sm:text-3xl xl:text-2xl">OUR <span className="text-beige">GOAL</span></h1>
            <div className="mt-4 flex ">
              <div className="bg-white w-[3px] h-20 mr-8" />
              <p className="font-jost text-wrap font-light text-xl xl:text-lg">
                {ourGoal}
              </p>
            </div>
          </motion.div>
          <motion.div 
            variants={slideInRight} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className="text-right mt-12 sm:mt-32"
          >
            <h1 className="font-josefin font-semibold text-4xl sm:text-3xl xl:text-2xl">WHAT WE <span className="text-navy">OFFER</span></h1>
            <div className="mt-4 flex ">
              <p className="font-jost text-wrap font-light text-xl xl:text-lg">
                {weOffer}
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
          className="mt-6 sm:w-1/2 sm:ml-20 relative h-64 sm:h-[30rem]">
          <Image
            src={images[1]?.imageUrl}
            layout="fill"
            objectFit="cover"
            alt={images[1]?.imageAlt}
          />
        </motion.div>
      </div>
      <div className="flex flex-col-reverse gap-12 sm:gap-0 sm:flex-row justify-between mx-6">
        <motion.div
          variants={fadeIn} 
          initial="hidden" 
          whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
          className="sm:mr-20 relative h-64 sm:h-[30rem]">
            <Image
              src={images[0]?.imageUrl}
              layout="fill"
              objectFit="cover"
              alt={images[0]?.imageAlt}
            />
          </motion.div>
        <div className="text-white flex flex-col justify-between gap-12">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left sm:mt-12">
            <h1 className="font-josefin font-semibold text-4xl xl:text-2xl">OUR <span className="text-beige">VALUES</span></h1>
            <div className="mt-4 flex ">
              <div className="bg-white w-[3px] h-20 mr-8" />
              <p className="font-jost text-wrap font-light text-xl xl:text-lg">
                {values}
              </p>
            </div>
          </motion.div>
          <motion.div 
            variants={slideInRight} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className="text-right sm:mt-32"
            >
            <h1 className="font-josefin font-semibold text-4xl xl:text-2xl"><span className="text-navy">JOIN</span> US</h1>
            <div className="mt-4 flex h-fit ">
              <p className="font-jost text-wrap font-light text-xl xl:text-lg">
                {joinUs}
              </p>
              <div className="bg-white w-[3px] h-20 ml-8" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
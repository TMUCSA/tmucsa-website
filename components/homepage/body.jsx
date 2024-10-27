import React from 'react';
import { useEffect, useState } from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Body() {
  const [animationTriggered, setAnimationTriggered] = useState(false);
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

  useEffect(() => {
    if (inView && !animationTriggered) {
      setAnimationTriggered(true);
    }
  }, [inView, animationTriggered]);

  return (
    <div className="flex flex-col items-center justify-center my-20 xl:mx-40">
      <div className="flex justify-between w-3/5 my-24">
        <div className="text-white flex flex-col justify-between w-1/2">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView= "visible"
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left"
          >
            <h1 className="font-josefin font-semibold text-3xl xl:text-2xl">OUR <span className="text-beige">GOAL</span></h1>
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
            className="text-right mt-32"
          >
            <h1 className="font-josefin font-semibold text-3xl xl:text-2xl">WHAT WE <span className="text-navy">OFFER</span></h1>
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
          className="w-1/2 ml-20 relative h-[30rem]">
          <Image
            src={image1Path}
            layout="fill"
            objectFit="cover"
            alt="Candid photo"
          />
        </motion.div>
      </div>
      <div className="flex justify-between w-3/5 my-24">
        <motion.div
          variants={fadeIn} 
          initial="hidden" 
          whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
          className="w-1/2 mr-20 relative h-[30rem]">
            <Image
              src={image2Path}
              layout="fill"
              objectFit="cover"
              alt="Orientation 2023"
            />
          </motion.div>
        <div className="text-white flex flex-col justify-between w-1/2">
          <motion.div 
            variants={slideInLeft} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once: true}}
            transition={{ duration: 0.8 }} 
            className=" text-left">
            <h1 className="font-josefin font-semibold text-3xl xl:text-2xl">OUR <span className="text-beige">VALUES</span></h1>
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
            className="text-right mt-32"
            >
            <h1 className="font-josefin font-semibold text-3xl xl:text-2xl"><span className="text-navy">JOIN</span> US</h1>
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
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
  const [images,setImages] = useState([]);

  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

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

  const topImageUrl = typeof images[0]?.imageUrl === 'string' ? images[0].imageUrl.trim() : '';
  const bottomImageUrl = typeof images[1]?.imageUrl === 'string' ? images[1].imageUrl.trim() : '';

  const statements = [
    { number: '01', title: 'OUR GOAL', text: content.ourGoal },
    { number: '02', title: 'WHAT WE OFFER', text: content.weOffer },
    { number: '03', title: 'OUR VALUES', text: content.values },
    { number: '04', title: 'JOIN US', text: content.joinUs },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0E0C24] py-24 text-white sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-white/15 pb-8 sm:flex-row sm:items-end lg:mb-20">
          <div>
            <p className="font-jost text-xs tracking-[0.28em] text-beige/60">02 / OUR COMMUNITY</p>
            <h2 className="mt-5 font-josefin text-4xl font-semibold tracking-tight sm:text-6xl">WHAT DRIVES US</h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} transition={{ duration: 0.8 }} className="relative aspect-[4/3] overflow-hidden lg:row-span-2 lg:aspect-auto lg:min-h-[680px]">
            {topImageUrl ? <Image src={topImageUrl} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" alt={imageAlt(images[0]?.imageAlt, 'TMUCSA community gathering')} /> : <div className="absolute inset-0 bg-white/5" aria-hidden="true" />}
            <div className="absolute inset-0 bg-gradient-to-t from-default/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-jost text-[10px] uppercase tracking-[0.28em] text-white/65 sm:bottom-7 sm:left-7">Culture · Community · Connection</p>
          </motion.div>

          <div className="grid border-t border-white/15 sm:grid-cols-2">
            {statements.slice(0, 2).map((statement, index) => (
              <motion.article key={statement.number} variants={index === 0 ? slideInRight : slideInLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'} transition={{ duration: 0.65, delay: index * 0.1 }} className="border-b border-white/15 py-8 sm:px-7 sm:first:border-r sm:first:pl-0">
                <p className="font-jost text-xs tracking-[0.25em] text-beige/50">{statement.number}</p>
                <h3 className="mt-8 font-josefin text-2xl font-semibold">{statement.title}</h3>
                <p className="mt-4 font-jost font-light leading-7 text-white/60">{statement.text}</p>
              </motion.article>
            ))}
          </div>

          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} transition={{ duration: 0.8, delay: 0.15 }} className="relative aspect-[16/9] overflow-hidden">
            {bottomImageUrl ? <Image src={bottomImageUrl} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" alt={imageAlt(images[1]?.imageAlt, 'TMUCSA student group activity')} /> : <div className="absolute inset-0 bg-white/5" aria-hidden="true" />}
          </motion.div>
        </div>

        <div className="mt-8 grid border-t border-white/15 sm:grid-cols-2 lg:ml-[calc(50%+1.25rem)]">
          {statements.slice(2).map((statement, index) => (
            <motion.article key={statement.number} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.65, delay: 0.2 + index * 0.1 }} className="border-b border-white/15 py-8 sm:px-7 sm:first:border-r sm:first:pl-0">
              <p className="font-jost text-xs tracking-[0.25em] text-beige/50">{statement.number}</p>
              <h3 className="mt-8 font-josefin text-2xl font-semibold">{statement.title}</h3>
              <p className="mt-4 font-jost font-light leading-7 text-white/60">{statement.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

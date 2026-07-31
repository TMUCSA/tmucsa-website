import React from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/components/general/SiteContentProvider';

export default function Title() {
    const content = useSiteContent('home');
    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.025,
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
        },
    };

    const AnimatedLine = ({ children, className = '' }) => (
        <div className={`whitespace-nowrap ${className}`}>
            {Array.from(children).map((letter, index) => (
                <motion.span key={index} variants={letterVariants} className="inline-block">
                    {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
            ))}
        </div>
    );

    return (
        <div className="absolute inset-0 z-10 mx-auto flex max-w-[1440px] items-end px-6 pb-20 pt-32 font-josefin sm:px-10 sm:pb-24 lg:px-16 xl:px-24">
            <div className="w-full max-w-6xl">
                <motion.div
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-7 flex items-center gap-4 font-jost text-[11px] tracking-[0.28em] text-white/65 sm:text-xs"
                >
                    <span>{content.heroEyebrow}</span>
                    <span className="h-px w-14 bg-beige/70" />
                </motion.div>
                <motion.h1
                    className="font-bold uppercase leading-[0.84] tracking-[-0.05em] text-beige"
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="text-[clamp(2.35rem,10.5vw,3.25rem)] sm:hidden">
                        <AnimatedLine className="text-white">{content.heroLineOne}</AnimatedLine>
                        <AnimatedLine>CHINESE</AnimatedLine>
                        <AnimatedLine>STUDENT</AnimatedLine>
                        <AnimatedLine>{content.heroLineThree}</AnimatedLine>
                    </div>
                    <div className="hidden text-[clamp(3.25rem,6.4vw,6.75rem)] sm:block">
                        <AnimatedLine className="text-white">{content.heroLineOne}</AnimatedLine>
                        <AnimatedLine>{content.heroLineTwo}</AnimatedLine>
                        <AnimatedLine>{content.heroLineThree}</AnimatedLine>
                    </div>
                </motion.h1>
                
                <motion.div
                    className="mt-8 flex max-w-2xl items-start gap-4 font-jost text-sm font-light uppercase tracking-[0.16em] text-white/70 sm:text-base"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                >
                    <span className="mt-2 h-px w-10 shrink-0 bg-beige" />
                    <p>{content.heroTagline}</p>
                </motion.div>
            </div>
        </div>
    );
}

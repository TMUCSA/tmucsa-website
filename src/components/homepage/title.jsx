import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/components/general/SiteContentProvider';

export default function Title() {
    const content = useSiteContent('home');
    const [showBottomText, setShowBottomText] = useState(false);

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.04,
                // Trigger the bottom text after the first animation completes
                onComplete: () => setShowBottomText(true),
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

    return (
        <div className="absolute inset-0 flex items-end justify-center z-10 font-josefin mx-6">
            <div className="flex flex-col">
                <motion.div
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-end justify-between mb-4"
                >
                    <h1 className="text-white text-xl font-normal sm:text-3xl sm:font-bold lg:text-4xl">{content.heroEyebrow}</h1>
                    <div className="bg-white h-[1px] w-1/3 sm:w-1/2" />
                </motion.div>
                <motion.h1
                    className="text-beige text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-left tracking-wider"
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="mb-2">
                        {Array.from(content.heroLineOne).map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="text-white inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                    <div className="mb-2">
                        {Array.from(content.heroLineTwo).map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                    <div>
                        {Array.from(content.heroLineThree).map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                </motion.h1>
                
                {showBottomText && (
                    <motion.h1 
                        className="text-white text-lg text-center mt-2 sm:flex hidden lg:text-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.4 }}
                    >
                        {content.heroTagline}
                    </motion.h1>
                )}
            </div>
        </div>
    );
}

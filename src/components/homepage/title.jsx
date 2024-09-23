import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Title() {
    const [showBottomText, setShowBottomText] = useState(false);

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.07,
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
        <div className="absolute inset-0 flex items-end justify-center z-10 font-josefin">
            <div className="flex flex-col">
                <motion.div
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-end justify-between mb-4"
                >
                    <h1 className="text-white text-2xl font-bold">WHO ARE WE?</h1>
                    <div className="bg-white h-[1px] w-2/3" />
                </motion.div>
                <motion.h1
                    className="text-beige text-5xl md:text-7xl lg:text-7xl font-bold text-left tracking-wider"
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="mb-2">
                        {Array.from("TORONTO MET").map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="text-white inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                    <div className="mb-2">
                        {Array.from("CHINESE STUDENT").map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                    <div>
                        {Array.from("ASSOCIATION").map((letter, index) => (
                            <motion.span key={index} variants={letterVariants} className="inline-block">
                                {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                        ))}
                    </div>
                </motion.h1>
                
                {showBottomText && (
                    <motion.h1 
                        className="text-white text-[30px] text-center mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 3 }}
                    >
                        CELEBRATING CULTURE | BUILDING CONNECTIONS | HAVING FUN
                    </motion.h1>
                )}
            </div>
        </div>
    );
}

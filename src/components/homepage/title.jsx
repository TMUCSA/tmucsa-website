import React from 'react';
import { motion } from 'framer-motion';

export default function Title({ title }) {
    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.5, // Adjust the delay between each letter animation
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
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <motion.h1 
                className="text-white text-5xl md:text-6xl lg:text-7xl font-bold text-center"
                variants={titleVariants}
                initial="hidden"
                animate="visible"
            >
                {Array.from(title).map((letter, index) => (
                    <motion.span key={index} variants={letterVariants} className="inline-block">
                        {letter}
                    </motion.span>
                ))}
            </motion.h1>
        </div>
    );
}

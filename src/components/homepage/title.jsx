import React from 'react';
import { motion } from 'framer-motion';

export default function Title({ title }) {
    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.3,
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
        <div className="title absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <motion.h1 
                className="text-white text-5xl md:text-6xl lg:text-9xl font-bold text-center tracking-widest"
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

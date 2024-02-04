import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Description() {
    const [animationTriggered, setAnimationTriggered] = useState(false);
    const { ref, inView } = useInView();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                delay: 0.2,
                ease: 'easeInOut',
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                delay: 0.4,
                ease: 'easeInOut',
            },
        },
    };

    useEffect(() => {
        if (inView && !animationTriggered) {
            setAnimationTriggered(true);
        }
    }, [inView, animationTriggered]);

    return (
        <div 
            ref={ref}
            className="h-[80vh] flex justify-center items-center bg-black text-white p-8"
        >
            <motion.div
                className="flex flex-col sm:flex-row items-center sm:items-start sm:w-[80%] xl:w-[50%]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="flex flex-col mr-0 sm:mr-12 mb-6 sm:mb-0"
                    variants={itemVariants}
                >
                    <motion.h2 className="text-[3rem] md:text-[5rem] md:leading-[0.9] lg:text-[6rem] lg:leading-[0.9] font-bold mb-4">
                        About Us
                    </motion.h2>
                    
                    <motion.hr className="border-white w-full my-4" />
                </motion.div>
                
                <motion.p 
                    className="text-justify md:text-[1.1rem] lg:text-2xl"
                    variants={itemVariants}
                >
                    TMUCSA is a dynamic community that brings together Chinese students from various backgrounds to foster cultural exchange, academic growth, and social connections.
                    We provide a welcoming space for students to explore their cultural identity, engage in meaningful activities, and build lifelong friendships.
                </motion.p>
            </motion.div>
        </div>
    );
}

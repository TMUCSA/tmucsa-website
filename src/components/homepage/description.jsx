import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Description() {
    const [animationTriggered, setAnimationTriggered] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0.5,
    });
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
                delay: 0.2,
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
            className="flex flex-col justify-between p-36 items-center text-white def-font bg-darker"
        >
            <motion.div
                className="h-[100vh] flex flex-1 flex-row md:flex-row sm:flex-col xs:flex-col items-start sm:items-start sm:w-[80%] xl:w-[80%]"
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div class="flex-1 text-center h-full">
                    <motion.h2 className="text-[2rem] md:text-[2rem] md:leading-[0.9] lg:text-[5rem] lg:leading-[0.9] font-bold mb-4 title text-center">
                        About Us
                    </motion.h2>
                </motion.div>
                
                <motion.p 
                    className="md:text-[1.1rem] lg:text-xl tracking-wide flex-1 lg:border-l-2 border-gray-400 pl-8"
                    variants={itemVariants}
                >
                    TMUCSA is a dynamic community that brings together Chinese students from various backgrounds to foster cultural exchange, academic growth, and social connections.
                    We provide a welcoming space for students to explore their cultural identity, engage in meaningful activities, and build lifelong friendships.
                </motion.p>
            </motion.div>
            <motion.div
                className="h-[100vh] flex flex-row md:flex-row sm:flex-col xs:flex-col items-start sm:items-start sm:w-[80%] xl:w-[80%]"
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div class="flex-1 text-center h-full">
                    <motion.h2 className="text-[2rem] md:text-[2rem] md:leading-[0.9] lg:text-[5rem] lg:leading-[0.9] font-bold mb-4 title text-center">
                        About Us
                    </motion.h2>
                </motion.div>
                
                <motion.p 
                    className="md:text-[1.1rem] lg:text-xl tracking-wide flex-1 lg:border-l-2 border-gray-400 pl-8"
                    variants={itemVariants}
                >
                    TMUCSA is a dynamic community that brings together Chinese students from various backgrounds to foster cultural exchange, academic growth, and social connections.
                    We provide a welcoming space for students to explore their cultural identity, engage in meaningful activities, and build lifelong friendships.
                </motion.p>
            </motion.div>
        </div>
    );
}

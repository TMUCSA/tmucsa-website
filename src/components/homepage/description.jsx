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
        hidden: { opacity: 0, y: 100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                delay: 0.6,
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
            className="py-40 flex justify-center items-center text-white mx-96"
        >
            <motion.div
                className="flex flex-col justify-center"
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div className="" variants={itemVariants}>
                    <motion.h2 className="">
                        WHO ARE WE?
                    </motion.h2>
                    
                    <motion.hr className="border-white w-full my-4" />
                </motion.div>
                
                <motion.p className="" variants={itemVariants}>
                        `TMUCSA is a dynamic community that brings together Chinese students from various backgrounds to foster cultural exchange, academic growth, and social connections.
                        We provide a welcoming space for students to explore their cultural identity, engage in meaningful activities, and build lifelong friendships.`
                </motion.p>
            </motion.div>
        </div>
    );
}

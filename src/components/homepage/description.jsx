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
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                delay: 0.3,
                ease: 'easeInOut',
            },
        },
    };

    useEffect(() => {
        if (inView && !animationTriggered) {
            setAnimationTriggered(true);
        }
    }, [inView, animationTriggered]);

    const description = "We are a dynamic community that brings together Chinese students from various backgrounds to foster cultural exchange, academic growth, and social connections. We provide a welcoming space for students to explore their cultural identity, engage in meaningful activities, and build lifelong friendships.";

    return (
        <div 
            ref={ref}
            className="py-60 flex justify-center items-center text-white"
        >
            <motion.div
                className="flex flex-col justify-center items-center "
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div className="font-josefin flex flex-col items-center justify-center" variants={itemVariants}>
                    <motion.h2 className="text-4xl font-semibold">
                        WHAT IS <span className="text-beige">CSA</span>?
                    </motion.h2>
                    
                    <motion.hr className="border-white w-1/2 my-4" />
                </motion.div>
                
                <motion.p className="font-jost text-xl tracking-wide font-light text-center w-1/3" variants={itemVariants}>
                    {description}
                </motion.p>
            </motion.div>
        </div>
    );
}

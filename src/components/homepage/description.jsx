import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSiteContent } from '@/components/general/SiteContentProvider';

export default function Description() {
    const content = useSiteContent('home');
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

    return (
        <div 
            ref={ref}
            className="py-12 sm:py-24 lg:py-40 flex justify-center items-center text-white"
        >
            <motion.div
                className="flex flex-col justify-center items-center mx-8 sm:mx-12 lg:mx-40 "
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div className="font-josefin flex flex-col items-center justify-center" variants={itemVariants}>
                    <motion.h2 className="text-2xl sm:text-3xl sm:font-bold lg:text-5xl font-semibold">
                        {content.descriptionTitle}
                    </motion.h2>
                    
                    <motion.hr className="border-white w-1/2 sm:w-3/4 my-4" />
                </motion.div>
                
                <motion.p className="font-jost text-xl lg:text-3xl tracking-wide font-light text-left" variants={itemVariants}>
                    {content.description}
                </motion.p>
            </motion.div>
        </div>
    );
}

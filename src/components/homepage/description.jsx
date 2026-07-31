import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSiteContent } from '@/components/general/SiteContentProvider';

export default function Description() {
    const content = useSiteContent('home');
    const headingParts = String(content.descriptionTitle || '').trim().split(/\s+/);
    const headingLast = headingParts.pop();
    const headingLead = headingParts.join(' ');
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
        <section
            ref={ref}
            className="relative overflow-hidden border-b border-white/10 bg-default py-24 text-white sm:py-32 lg:py-40"
        >
            <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-navy/15 blur-[120px]" aria-hidden="true" />
            <motion.div
                className="relative mx-auto grid max-w-[1440px] gap-10 px-6 sm:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-16 xl:px-24"
                variants={containerVariants}
                initial="hidden"
                animate={inView || animationTriggered ? "visible" : "hidden"}
            >
                <motion.div className="font-josefin" variants={itemVariants}>
                    <p className="mb-7 font-jost text-xs tracking-[0.28em] text-beige/60">01 / ABOUT US</p>
                    <motion.h2 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                        {headingLead ? <>{headingLead}<br /></> : null}
                        <span className="text-beige">{headingLast}</span>
                    </motion.h2>
                </motion.div>
                
                <motion.div className="flex items-start gap-5 self-end" variants={itemVariants}>
                    <span className="mt-2 block h-24 w-[3px] shrink-0 bg-beige" />
                    <p className="max-w-3xl font-jost text-xl font-light leading-8 text-white/75 sm:text-2xl sm:leading-9">{content.description}</p>
                </motion.div>
            </motion.div>
        </section>
    );
}

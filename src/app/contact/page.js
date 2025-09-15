'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Contact() {

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-default">
            {/* Hero Section */}
            <motion.div 
                className="pt-24 pb-12 text-center text-white"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
            >
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-josefin mb-4">
                        GET IN <span className="text-beige">TOUCH</span>
                    </h1>
                    <div className="w-32 h-1 bg-beige mx-auto mb-6"></div>
                    <p className="text-xl md:text-2xl font-jost max-w-3xl mx-auto">
                        The official medium of communication with the TMUCSA is via email. All executive members can be reached via execs@tmucsa.com. For individual member emails, check out our Team page.
                    </p>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
                className="container mx-auto px-6 pb-16"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-4xl mx-auto">
                    {/* Contact Information */}
                    <motion.div 
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8"
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-beige/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white font-josefin mb-2">Email</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-300 font-jost">execs@tmucsa.com</p>
                                    <p className="text-gray-300 font-jost">For individual member emails, check out our Team page.</p>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-beige/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white font-josefin mb-2">Our Office</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-300 font-jost">87 Gerrard St E, Toronto, ON M5B 2M2</p>
                                    <p className="text-gray-300 font-jost">Room: EPH 442-D</p>
                                    <p className="text-gray-300 font-jost text-sm">You can find us at our office on the 4th floor of Eric Palin Hall. We'll often do pick ups and office hours in here.</p>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-beige/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white font-josefin mb-2">Meeting Requests</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-300 font-jost text-sm">You can complete this form to meet with one of our top-tier execs for any questions/such concerns you may want to address either in person or virtually.</p>
                                    <Link href="#" className="text-beige hover:text-white transition-colors duration-300 text-sm underline">
                                        Request Meeting
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Media */}
                    <motion.div 
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8"
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-bold text-white font-josefin mb-6 text-center">
                            Follow Us
                        </h2>
                        
                        <div className="flex justify-center space-x-6">
                            <Link 
                                href="https://www.instagram.com/tmucsa/" 
                                target="_blank"
                                className="group"
                            >
                                <div className="bg-beige/10 p-3 rounded-full hover:bg-beige/20 transition-colors duration-300">
                                    <Image 
                                        src="/icons/socials/instagram.png" 
                                        width={24} 
                                        height={24} 
                                        alt="Instagram" 
                                        className="group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            </Link>
                            
                            <Link 
                                href="https://www.linkedin.com/company/toronto-metropolitan-university-chinese-student-association/" 
                                target="_blank"
                                className="group"
                            >
                                <div className="bg-beige/10 p-3 rounded-full hover:bg-beige/20 transition-colors duration-300">
                                    <Image 
                                        src="/icons/socials/linkedin.png" 
                                        width={24} 
                                        height={24} 
                                        alt="LinkedIn" 
                                        className="group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            </Link>
                            
                            <Link 
                                href="https://tiktok.com/@tmucsa" 
                                target="_blank"
                                className="group"
                            >
                                <div className="bg-beige/10 p-3 rounded-full hover:bg-beige/20 transition-colors duration-300">
                                    <Image 
                                        src="/icons/socials/tik-tok.png" 
                                        width={24} 
                                        height={24} 
                                        alt="TikTok" 
                                        className="group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            </Link>
                            
                            <Link 
                                href="https://discord.gg/K2Pu8W56EV" 
                                target="_blank"
                                className="group"
                            >
                                <div className="bg-beige/10 p-3 rounded-full hover:bg-beige/20 transition-colors duration-300">
                                    <Image 
                                        src="/icons/socials/discord.png" 
                                        width={24} 
                                        height={24} 
                                        alt="Discord" 
                                        className="group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Team Images */}
                    <motion.div 
                        className="grid md:grid-cols-2 gap-8"
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="relative h-64 rounded-2xl overflow-hidden">
                            <Image 
                                src="/images/csa-candid.jpg" 
                                alt="TMUCSA Team" 
                                layout="fill"
                                objectFit="cover"
                                className="hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        
                        <div className="relative h-64 rounded-2xl overflow-hidden">
                            <Image 
                                src="/images/orientation-2023.jpg" 
                                alt="TMUCSA Event" 
                                layout="fill"
                                objectFit="cover"
                                className="hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
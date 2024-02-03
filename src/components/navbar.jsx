import { useState, useEffect } from 'react';
import navItems from '../../public/data/nav-items.json'
import Link from "next/link"

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Initial screen width
        setScreenWidth(window.innerWidth);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const isCurrentlyScrolled = scrollTop > 150;
            setIsScrolled(isCurrentlyScrolled);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={`w-full top-0 left-0 fixed z-50 transition-all duration-300 ease-in ${isScrolled ? (screenWidth < 768 ? '' : 'bg-black bg-opacity-40') : (screenWidth < 768 ? '' : 'bg-default')} ${isMenuOpen ? 'bg-black bg-opacity-40': ''}`}>
            <div className='container mx-auto flex flex-row items-center justify-between py-2'>
                <div className={`logo ${isMenuOpen || screenWidth < 768 ? 'hidden' : ''}`}>
                    <Link href='/'>
                        <img className=' h-24 w-24 hover:scale-110 transition-all duration-100 ease-in-out' src="/icons/logo5.png" alt="CSA LOGO" />
                    </Link>
                </div>
                <div className={`nav-links md:flex flex-row space-x-4 ${isMenuOpen ? 'block text-s ml-8 text-white' : 'hidden text-xl text-gray-400'}`}>
                    {navItems.map((route, index) => (
                        <Link href={route.href} key={index} className='p-4 hover:scale-110 transition-all duration-200 ease-in-out underline-on-hover hover:text-white hover:-translate-y-1'>
                            <p>{route.text}</p>
                        </Link>
                    ))}
                </div>
                <div className="md:hidden">
                    <button className="text-white focus:outline-none px-6 py-2" onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    const [navItems, setNavItems] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);
    const [active,setActive] = useState('Home');

    useEffect(() => {
        fetchData();
        handleScroll();
        handleResize();
    
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        // Initial screen width
        setScreenWidth(window.innerWidth);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/data/nav-items.json');
            const data = await response.json();
            setNavItems(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleScroll = async () => {
        const scrollTop = window.scrollY;
        const isCurrentlyScrolled = scrollTop > 150;
        setIsScrolled(isCurrentlyScrolled);
    };

    const handleResize = () => {
        setScreenWidth(window.innerWidth);
    };

    const toggleMenu = async () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleActive = (str) =>{
        setActive(str);
        // close the menu if it is open
        if(isMenuOpen){
            setIsMenuOpen(false);
        }
    }

    return (
        <nav className={`w-full font-josefin top-0 
        
        fixed flex md:items-center md:justify-center z-50 transition-all duration-200 ease-in 
        
        ${isScrolled ? (screenWidth < 768 ? '' : 'bg-opacity-0') : (screenWidth < 768 ? '' : 'bg-default')} 
        
        ${isMenuOpen ? '': ''} 
        
        bg-opacity-100 md:hover:bg-default`}
        >
            <div className='container flex flex-row items-center justify-between md:px-8 xl:px-40'>
                <div className={`logo ${isMenuOpen || screenWidth < 768 ? 'hidden' : ''}`}>
                    <Link href='/'>
                        <Image className='h-16 w-16' src="/icons/logo5.png" width={300} height={300} alt="CSA LOGO" />
                    </Link>
                </div>
                
                <div className={`nav-links md:flex flex-row space-x-4 ${isMenuOpen ? 'fixed top-0 right-0 w-2/3 bg-default text-3xl text-white pl-8 pt-12 md:pl-0 md:text-center h-svh z-30 transform transition-all -translate-x-0 opacity-100' : screenWidth < 768 ? 'fixed top-0 right-0 pt-8 w-2/3 h-svh bg-default z-30 transform transition-all duration-300 ease-in-out translate-x-full opacity-0' : 'hidden text-xl text-gray-400'}`}>
                    {navItems.map((route, index) => (
                        <Link href={route.href} key={index} onClick={() => handleActive(route.text)} className={`p-4 font-light ${active == route.text ? 'text-white font-bold' : ''} ${isMenuOpen ? active == route.text ? 'font-black text-white' : '' : 'hover:scale-110 transition-all duration-200 ease-in-out underline-on-hover hover:text-white hover:-translate-y-1'}`}>
                            <p>{route.text}</p>
                        </Link>
                    ))}
                </div>
                
                <div className="md:hidden">
                    <button className="text-white focus:outline-none mx-6 my-6 z-50 absolute right-0 top-0" onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

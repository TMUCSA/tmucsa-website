import { useState, useEffect } from 'react';
import navItems from '../../public/data/nav-items.json'
import Link from "next/link"

export default function Navbar() {
    console.log(navItems)

    const [fetchItems, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/data/nav-items.json');
                const data = await res.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
}, []);

const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const isCurrentlyScrolled = scrollTop > 0;
    setIsScrolled(isCurrentlyScrolled);
  };

  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, []);

    return (
        <nav className={`w-full top-0 left-0 fixed z-50 transition-all duration-150 ease-in ${isScrolled ? 'bg-black bg-opacity-40' : 'bg-default text-white'}`}>
            <div className='flex flex-row text-white items-center'>
                <div class="logo flex pl-32 flex-1">
                    <Link href='/'>
                        <img className='h-28 w-28 hover:scale-110 transition-all duration-100 ease-in-out' src="/icons/logo5.png" alt="CSA LOGO" />
                    </Link>
                </div>
                <div class="nav-links flex flex-row flex-1 justify-around text-xl">
                    {fetchItems.map((route, index) => (
                        <Link href={route.href} key={index} className='p-4 hover:scale-110 transition-all duration-200 ease-in-out underline-on-hover'>
                            <p>{route.text}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
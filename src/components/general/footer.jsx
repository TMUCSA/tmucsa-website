import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";




export default function Footer() {
    const [navItems, setNavItems] = useState([]);
    const [footerItems, setFooterItems] = useState([]);
    const [teamItems, setTeamItems] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response1 = await fetch('/data/nav-items.json');
            const data1 = await response1.json();
            setNavItems(data1);
            const response2 = await fetch('/data/footer-items.json');
            const data2 = await response2.json();
            setFooterItems(data2);
            const response3 = await fetch('/data/meet-the-team-items.json');
            const data3 = await response3.json();
            setTeamItems(data3);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <footer className="text-gray-300 py-4 bg-[#131224]">
            <div className="container mx-auto flex justify-between pr-4 md:pr-12">
                <div className="md:flex md:w-1/3 flex w-1/2 align-text-bottom flex-col border-r-2 border-zinc-500">
                    <Image className=' h-44 w-44 hover:scale-110 transition-all duration-100 ease-in-out' src="/icons/logo5.png" width={300} height={300} alt="CSA LOGO" />
                    <h1 className="text-5xl font-bold mt-3 mr-20 pl-4">TMUCSA</h1>
                    <p className="text-sm mt-16 pl-4 pr-8 text-zinc-400">The TMUCSA is an unparalleled social club driven to build a fun, inclusive student community while boosting the student life at TMU.</p>
                </div>

                <div className="footer-links md:flex md:w-1/8 flex-col items-left space-y-32">
                    <h3 className="text-lg text-zinc-400 pl-5">GENERAL</h3>
                    <ul>
                        {navItems.map((route, index) => (
                            <li key={index} className="pl-5">
                                <Link href={route.href} className="hover:text-white">
                                    <p>{route.text}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:flex md:w-1/8 flex-col items-left space-y-24">
                    <h3 className="text-lg text-zinc-400">MEET THE TEAM</h3>
                    <ul>
                        {teamItems.map((route, index) => (
                            <li key={index}>
                                <Link href={route.href} className="hover:text-white">
                                    <p>{route.text}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:flex md:w-1/8 flex-col items-left space-y-32">
                    <h3 className="text-lg text-zinc-400 ">SOCIAL</h3>
                    <ul>
                        {footerItems.map((route, index) => (
                            <li key={index}>
                                <Link href={route.href} className="hover:text-white">
                                    <p>{route.text}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
            </div>
            <p className="pt-4 text-xs text-center text-zinc-400">Copyright &copy; 2024 TMUCSA | All Rights Reserved </p>
        </footer>
    );
}
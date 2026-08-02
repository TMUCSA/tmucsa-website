import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useSiteContent } from './SiteContentProvider';

export default function Navbar() {
    const { navItems } = useSiteContent('global');
    const visibleNavItems = navItems.some((item) => item.href === '/links')
        ? navItems
        : [...navItems.slice(0, 2), { href: '/links', text: 'Links' }, ...navItems.slice(2)];
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        handleScroll();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isMenuOpen]);

    const handleScroll = async () => {
        const scrollTop = window.scrollY;
        const isCurrentlyScrolled = scrollTop > 150;
        setIsScrolled(isCurrentlyScrolled);
    };

    const toggleMenu = () => {
        setIsMenuOpen((open) => !open);
    };

    const isActiveRoute = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }

    return (
        <nav className={`fixed top-0 z-50 w-full font-josefin transition-colors duration-300 ${isScrolled ? 'bg-default/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none' : 'bg-transparent'} md:hover:bg-default`}>
            <div className='mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:h-16 md:px-8 xl:px-24'>
                <div className='relative z-50'>
                    <Link href='/'>
                        <Image className='h-12 w-12 md:h-16 md:w-16' src="/icons/logo5.png" width={300} height={300} alt="TMUCSA home" />
                    </Link>
                </div>

                <div className='hidden flex-row items-center space-x-4 text-xl text-gray-400 md:flex'>
                    {visibleNavItems.map((route, index) => (
                        <Link href={route.href} key={index} className={`p-4 font-light transition-all duration-200 ease-in-out hover:-translate-y-1 hover:text-white ${isActiveRoute(route.href) ? 'font-bold text-white' : 'underline-on-hover'}`}>
                            <p>{route.text}</p>
                        </Link>
                    ))}
                </div>

                <button className="relative z-50 flex h-11 w-11 items-center justify-center border border-white/20 text-white transition hover:border-beige/60 md:hidden" onClick={toggleMenu} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 16h14" />
                            )}
                        </svg>
                </button>
            </div>

            <button type="button" aria-label="Close navigation menu" onClick={() => setIsMenuOpen(false)} className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} />

            <div id="mobile-navigation" className={`fixed right-0 top-0 z-40 flex h-svh w-[min(84vw,360px)] flex-col border-l border-white/10 bg-default px-7 pb-8 pt-28 text-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <p className='font-jost text-[10px] uppercase tracking-[0.3em] text-beige/50'>Navigate</p>
                <div className='mt-7 border-t border-white/15'>
                    {visibleNavItems.map((route, index) => {
                        const active = isActiveRoute(route.href);
                        return (
                            <Link href={route.href} key={route.href} onClick={() => setIsMenuOpen(false)} className={`group flex min-h-16 items-center justify-between border-b border-white/15 py-4 transition ${active ? 'text-beige' : 'text-white/70 hover:text-white'}`}>
                                <span className='flex items-center gap-4'>
                                    <span className={`font-jost text-[10px] tracking-[0.2em] ${active ? 'text-beige/60' : 'text-white/30'}`}>{String(index + 1).padStart(2, '0')}</span>
                                    <span className='text-2xl font-medium'>{route.text}</span>
                                </span>
                                <svg className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${active ? 'opacity-100' : 'opacity-35'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14m-5-5 5 5-5 5" /></svg>
                            </Link>
                        )
                    })}
                </div>
                <p className='mt-auto font-jost text-xs font-light leading-5 text-white/35'>Culture · Community · Connection</p>
            </div>
        </nav>
    );
}

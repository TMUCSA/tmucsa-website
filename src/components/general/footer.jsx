'use client'

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from './SiteContentProvider';

export default function Footer() {
    const { socialLinks, footerCopyright } = useSiteContent('global')

    return (
        <footer className=" w-screen h-fit sm:px-20 flex text-white my-8 font-josefin">
            <div className="flex flex-col gap-6 justify-center items-center w-full h-full mx-4">
                <div className="w-full flex items-center justify-center">
                    <Image className='h-14 w-14 hover:rotate-[720deg] transition-all duration-1000 ease-in-out' src="/icons/logo5.png" width={300} height={300} alt="CSA LOGO" />
                </div>
                <div className="flex gap-12 items-center justify-around sm:px-28 h-full">
                    <Link href={socialLinks.linkedin} target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer ' src="/icons/socials/linkedin.png" width={300} height={300} alt="Linkedin" />
                    </Link>
                    <Link href={socialLinks.instagram} target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/instagram.png" width={300} height={300} alt="Instagram" />
                    </Link>
                    <Link href={socialLinks.tiktok} target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/tik-tok.png" width={300} height={300} alt="TikTok" />
                    </Link>
                    <Link href={socialLinks.discord} target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/discord.png" width={300} height={300} alt="Discord" />
                    </Link>
                </div>
                <div className="text-center font-thin w-full text-xs lg:text-md lg:tracking-wider text-gray-100">
                    <p>{footerCopyright}</p>
                </div>
            </div>
        </footer>
    );
}

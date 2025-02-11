import Image from "next/image";
import Link from "next/link";

export default function Footer() {

    return (
        <footer className=" w-screen h-fit sm:px-20 flex text-white my-8 font-josefin">
            <div className="flex flex-col gap-6 justify-center items-center w-full h-full">
                <div className="w-full flex items-center justify-center">
                    <Image className='h-14 w-14 hover:rotate-[720deg] transition-all duration-1000 ease-in-out' src="/icons/logo5.png" width={300} height={300} alt="CSA LOGO" />
                </div>
                <div className="flex gap-12 items-center justify-around sm:px-28 sm:w-1/3 h-full">
                    <Link href="https://www.linkedin.com/company/toronto-metropolitan-university-chinese-student-association/" target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer ' src="/icons/socials/linkedin.png" width={300} height={300} alt="Linkedin" />
                    </Link>
                    <Link href="https://www.instagram.com/tmucsa/" target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/instagram.png" width={300} height={300} alt="Instagram" />
                    </Link>
                    <Link href="https://tiktok.com/@tmucsa" target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/tik-tok.png" width={300} height={300} alt="TikTok" />
                    </Link>
                    <Link href="https://discord.gg/K2Pu8W56EV" target="_blank">
                        <Image className='h-6 w-6 opacity-70 hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer' src="/icons/socials/discord.png" width={300} height={300} alt="Discord" />
                    </Link>
                </div>
                <div className="text-center font-thin w-full text-md tracking-wider text-gray-100">
                    <p>© 2024 TMUCSA (Toronto Metropolitan Chinese Student Association) | All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
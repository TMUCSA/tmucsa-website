'use client'

import Image from 'next/image'

export default function HeroBanner({ heroImageAlt, heroImageUrl, title, yearLabel }) {
	return (
		<section className='relative h-[55svh] min-h-[480px] w-full overflow-hidden md:h-[68svh] md:min-h-[620px]'>
			<Image
				alt={heroImageAlt}
				src={heroImageUrl}
				fill
				priority
				sizes='100vw'
				className='scale-105 object-cover object-center'
			/>
			<div className='absolute inset-0 bg-gradient-to-r from-default/85 via-default/35 to-transparent' />
			<div className='absolute inset-0 bg-gradient-to-t from-default/80 via-transparent to-default/20' />

			<div className='absolute inset-0 mx-auto flex max-w-[1440px] flex-col justify-end px-6 pb-14 pt-28 sm:px-10 sm:pb-20 lg:px-16 xl:px-24'>
				<div className='mb-auto flex items-center gap-4 font-jost text-[11px] uppercase tracking-[0.28em] text-white/60 sm:text-xs'><span>Our people</span><span className='h-px w-14 bg-beige/70' /><span>TMUCSA</span></div>
				<h1 className='max-w-5xl font-josefin text-[clamp(3.5rem,8vw,7.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.045em] text-white'>
					{title}
				</h1>
				<div className='mt-7 flex items-center gap-4 font-jost text-sm uppercase tracking-[0.22em] text-beige'><span className='h-px w-10 bg-beige' />{yearLabel}</div>
			</div>
		</section>
	)
}

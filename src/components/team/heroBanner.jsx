'use client'

import Image from 'next/image'

export default function HeroBanner({ heroImageAlt, heroImageUrl, title, yearLabel }) {
	return (
		<section className='relative w-full h-[33vh] md:h-[60vh] min-h-[240px] overflow-hidden'>
			<Image
				alt={heroImageAlt}
				src={heroImageUrl}
				fill
				priority
				sizes='100vw'
				className='object-cover object-center blur-sm scale-110'
			/>
			<div className='absolute inset-0 bg-black/40' />

			<div className='absolute inset-0 flex items-center justify-center px-4 flex-col'>
				<h1 className='text-white font-josefin font-bold text-4xl sm:text-5xl md:text-6xl text-center'>
					{title}
				</h1>
				<h2 className='text-beige font-jost font-normal text-sm sm:text-md md:text-lg text-center'>
					{yearLabel}
				</h2>
			</div>
		</section>
	)
}

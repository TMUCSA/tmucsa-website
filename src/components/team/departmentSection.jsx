'use client'

import Image from 'next/image'

export default function DepartmentSection({ id, department }) {
	if (!department) return null

	return (
		<section id={id} className='relative w-screen h-[65vh] min-h-[520px] border border-beige overflow-hidden'>
			{department.backgroundImageUrl ? (
				<Image
					alt={department.backgroundImageAlt || department.name}
					src={department.backgroundImageUrl}
					fill
					sizes='100vw'
					className='object-cover object-center opacity-80'
				/>
			) : (
				<div className='absolute inset-0 bg-default' />
			)}

			<div className='absolute top-4 left-4'>
				<h2 className='font-josefin uppercase tracking-widest text-white text-3xl font-bold'>
					{String(department.name || '').toUpperCase()}
				</h2>
			</div>
		</section>
	)
}

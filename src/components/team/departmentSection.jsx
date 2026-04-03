'use client'

import Image from 'next/image'

function formatOrdinalYear(year) {
	const value = Number(year)
	if (!Number.isFinite(value) || value <= 0) return ''
	const mod100 = value % 100
	if (mod100 >= 11 && mod100 <= 13) return `${value}th`
	const mod10 = value % 10
	if (mod10 === 1) return `${value}st`
	if (mod10 === 2) return `${value}nd`
	if (mod10 === 3) return `${value}rd`
	return `${value}th`
}

function MemberLine({ member }) {
	const yearValue = Number(member?.year)
	const yearText = formatOrdinalYear(yearValue)
	const programText = member?.program || ''
	const yearProgram =
		programText && yearText
			? `${yearText} Year ${programText}`
			: programText && yearValue === 0
				? programText
				: ''

	return (
		<div className='leading-tight'>
			<div className='text-beige font-josefin text-base'>
            {member?.displayName}
			{yearProgram ? (
				<span className='text-white/70 font-josefin italic text-xs font-light mt-0.5 ml-2'>{yearProgram}</span>
			) : null}
            </div>
		</div>
	)
}

function SubteamCard({ subteam, membersById }) {
	const sortedMemberIds = subteam?.memberIds ?? []
	const subteamMembers = sortedMemberIds.map((id) => membersById?.[id]).filter(Boolean)

	return (
		<div className='group relative w-[20vw] self-start border border-white overflow-hidden'>
			{subteam?.imageUrl ? (
				<img
					alt={subteam.imageAlt || subteam.name}
					src={subteam.imageUrl}
					className='w-full h-auto block transition duration-200 group-hover:blur-0 blur-[1px]'
					loading='lazy'
				/>
			) : (
				<div className='w-full min-h-[220px] bg-black/10 flex items-center justify-center'>
					<span className='font-josefin text-white/80'>No image</span>
				</div>
			)}

			<div className='absolute inset-0 bg-black/40 transition duration-200 group-hover:bg-black/0' />

			<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group-hover:top-4 group-hover:-translate-y-0'>
				<div className='font-josefin tracking-widest text-white lg:text-3xl text-2xl font-bold text-center transition-all duration-300 group-hover:text-xl'>
					{String(subteam?.name || '').toUpperCase()}
				</div>
			</div>

			<div className='absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
				<div className='bg-black/75 px-4 py-4'>
					<div className='flex flex-col gap-3'>
						{subteamMembers.map((member) => (
							<MemberLine key={member.displayName} member={member} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default function DepartmentSection({ id, department, membersById }) {
	if (!department) return null

	const subteams = (department.subteams ?? []).slice().sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))

	return (
		<section id={id} className='w-screen'>
			{/* Mobile (< md): show full image without cropping */}
			<div className='md:hidden relative border border-beige'>
				{department.backgroundImageUrl ? (
					<img
						alt={department.backgroundImageAlt || department.name}
						src={department.backgroundImageUrl}
						className='w-full h-auto block opacity-80'
						loading='lazy'
					/>
				) : (
					<div className='w-full min-h-[520px] bg-default' />
				)}

				<div className='absolute top-4 left-4'>
					<h2 className='font-josefin uppercase tracking-widest text-white text-3xl font-bold'>
						{String(department.name || '').toUpperCase()}
					</h2>
				</div>
			</div>

			{/* Desktop (md+): dynamic height with padding and cards */}
			<div className='hidden md:block relative overflow-hidden'>
				{department.backgroundImageUrl ? (
					<Image
						alt={department.backgroundImageAlt || department.name}
						src={department.backgroundImageUrl}
						fill
						sizes='100vw'
						className='object-cover object-center opacity-80 blur-[1.5px]'
					/>
				) : (
					<div className='absolute inset-0 bg-default' />
				)}

				<div className='relative z-10 lg:px-32 px-16 py-16'>
					<h2 className='text-center font-josefin uppercase tracking-widest text-white text-4xl font-bold'>
						{String(department.name || '').toUpperCase()}
					</h2>

					<div className='mt-12 flex flex-wrap items-start justify-center gap-16'>
						{subteams.map((subteam) => (
							<SubteamCard key={subteam.id} subteam={subteam} membersById={membersById} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

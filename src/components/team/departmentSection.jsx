'use client'

/* eslint-disable @next/next/no-img-element */
// Native dimensions preserve each uploaded team photo's natural aspect ratio.
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
		<div tabIndex={0} className='group relative w-[clamp(220px,20vw,340px)] self-start overflow-hidden border border-white/35 bg-default/20 shadow-2xl shadow-black/20 outline-none transition duration-300 hover:-translate-y-1 hover:border-beige/70 focus:-translate-y-1 focus:border-beige/70'>
			{subteam?.imageUrl ? (
				<img
					alt={subteam.imageAlt || subteam.name}
					src={subteam.imageUrl}
					className='block h-auto w-full transition duration-300 group-hover:blur-0 group-focus:blur-0 blur-[1px]'
					loading='lazy'
				/>
			) : (
				<div className='w-full min-h-[220px] bg-black/10 flex items-center justify-center'>
					<span className='font-josefin text-white/80'>No image</span>
				</div>
			)}

			<div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20 transition duration-300 group-hover:from-black/35 group-hover:via-transparent group-hover:to-transparent group-focus:from-black/35 group-focus:via-transparent group-focus:to-transparent' />

			<div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-4 transition-all duration-300 group-hover:top-4 group-hover:-translate-y-0 group-focus:top-4 group-focus:-translate-y-0'>
				<div className='text-center font-josefin text-2xl font-bold tracking-widest text-white drop-shadow-lg transition-all duration-300 group-hover:text-xl group-focus:text-xl lg:text-3xl'>
					{String(subteam?.name || '').toUpperCase()}
				</div>
			</div>

			<div className='absolute bottom-0 left-0 right-0 max-h-[72%] translate-y-full overflow-y-auto transition-transform duration-300 group-hover:translate-y-0 group-focus:translate-y-0'>
				<div className='border-t border-white/15 bg-default/90 px-4 py-4 backdrop-blur-md'>
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
		<section id={id} className='w-screen border-b border-white/10'>
			{/* Mobile (< md): show full image without cropping */}
			<div className='relative border-x border-b border-beige/30 md:hidden'>
				{department.backgroundImageUrl ? (
					<img
						alt={department.backgroundImageAlt || department.name}
						src={department.backgroundImageUrl}
						className='block h-auto w-full opacity-85'
						loading='lazy'
					/>
				) : (
					<div className='w-full min-h-[520px] bg-default' />
				)}

				<div className='absolute inset-0 bg-gradient-to-t from-default/75 via-transparent to-default/15' />
				<div className='absolute bottom-5 left-5 right-5'>
					<h2 className='font-josefin text-3xl font-bold uppercase tracking-widest text-white drop-shadow-lg'>
						{String(department.name || '').toUpperCase()}
					</h2>
					<p className='mb-2 font-jost text-[9px] uppercase tracking-[0.28em] text-beige/65'>Department</p>
				</div>
			</div>

			{/* Desktop (md+): dynamic height with padding and cards */}
			<div className='relative hidden overflow-hidden md:block'>
				{department.backgroundImageUrl ? (
					<Image
						alt={department.backgroundImageAlt || department.name}
						src={department.backgroundImageUrl}
						fill
						sizes='100vw'
						className='object-cover object-center opacity-65 blur-[1.5px]'
					/>
				) : (
					<div className='absolute inset-0 bg-default' />
				)}

				<div className='absolute inset-0 bg-gradient-to-b from-default/60 via-default/15 to-default/70' />

				<div className='relative z-10 px-16 py-16 lg:px-32'>
					<h2 className='mt-3 text-center font-josefin text-4xl font-bold uppercase tracking-widest text-white drop-shadow-lg'>
						{String(department.name || '').toUpperCase()}
					</h2>
					<p className='text-center font-jost text-[10px] uppercase tracking-[0.3em] text-beige/65'>Department</p>

					<div className='mt-12 flex flex-wrap items-start justify-center gap-10 xl:gap-14'>
						{subteams.map((subteam) => (
							<SubteamCard key={subteam.id} subteam={subteam} membersById={membersById} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

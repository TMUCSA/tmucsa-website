'use client'

import Image from 'next/image'

function formatExecRole(roleTitle) {
	return roleTitle.toUpperCase()
}

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

function ExecCard({ member, size = 'md' }) {
	const imageSizeClass = size === 'lg' ? 'w-40 h-40' : 'w-32 h-32'
	const roleClass = size === 'lg' ? 'text-base' : 'text-sm'
	const nameClass = size === 'lg' ? 'text-lg' : 'text-base'
	const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase()

	return (
		<div className='flex flex-col items-center text-center font-josefin tracking-wide'>
			<div className={`relative ${imageSizeClass}`}>
				{member.headshotUrl ? (
					<Image
						alt={member.headshotAlt || member.displayName}
						src={member.headshotUrl}
						fill
						sizes={size === 'lg' ? '160px' : '112px'}
						className='object-cover object-center rounded-2xl border border-beige'
					/>
				) : (
					<div className='w-full h-full rounded-2xl border border-beige bg-white/10 flex items-center justify-center'>
						<span className='font-jost font-bold text-white text-xl'>{initials}</span>
					</div>
				)}
			</div>

			<div className={`mt-3 tracking-widest font-semibold text-beige ${roleClass}`}>
				{formatExecRole(member.roleTitle)}
			</div>
			<div className={`mt-1 tracking-widest font-normal text-white ${nameClass}`}>{member.displayName}</div>
		</div>
	)
}

function ExecCardDesktop({ member, variant }) {
	const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase()
	const yearText = formatOrdinalYear(member.year)
	const programText = member.program || ''
	const yearProgram = yearText && programText ? `${yearText} Year ${programText}` : ''

	const isPresident = variant === 'president'
	const isEvP = variant === 'evp'
	const shapeClass = isPresident ? 'rounded-2xl' : isEvP ? 'rounded-3xl' : 'rounded-full'
	const imageSizeClass = isPresident ? 'w-44 h-44 lg:w-64 lg:h-64' : 'w-36 h-36 lg:w-56 lg:h-56'

	return (
		<div className='flex flex-col items-center text-center font-josefin'>
			<div className={`relative ${imageSizeClass}`}>
				{member.headshotUrl ? (
					<Image
						alt={member.headshotAlt || member.displayName}
						src={member.headshotUrl}
						fill
						sizes={isPresident ? '176px' : '144px'}
						className={`object-cover object-center ${shapeClass} border border-beige`}
					/>
				) : (
					<div className={`w-full h-full ${shapeClass} border border-beige bg-white/10 flex items-center justify-center`}>
						<span className='font-jost font-bold text-white text-xl'>{initials}</span>
					</div>
				)}
			</div>

			<div className={`mt-4 tracking-widest font-semibold text-beige ${isPresident ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>{formatExecRole(member.roleTitle)}</div>
			<div className={`font-normal text-white ${isPresident ? 'text-xl lg:text-2xl' : 'text-lg lg:text-xl'}`}>{member.displayName}</div>
			{yearProgram ? (
				<div className='font-light text-white/80 text-sm lg:text-base'>{yearProgram}</div>
			) : null}
		</div>
	)
}

export default function ExecutiveSection({ section, membersById }) {
	const memberIds = section?.memberIds ?? []
	const execMembers = memberIds
		.map((id) => {
			const member = membersById?.[id]
			return member ? { id, ...member } : null
		})
		.filter(Boolean)
		.sort((a, b) => (a.executiveOrder ?? 0) - (b.executiveOrder ?? 0))

	const president = execMembers.find((m) => m.executiveOrder === 1) ?? execMembers[0]
	const externalEvp = execMembers.find((m) => m.executiveOrder === 2)
	const internalEvp = execMembers.find((m) => m.executiveOrder === 3)
	const othersMobile = execMembers.filter((m) => m !== president)
	const othersDesktop = execMembers.filter((m) => ![president, externalEvp, internalEvp].includes(m))

	return (
		<section id='executives' className='w-full'>
			{/* Mobile (< md) */}
			<div className='px-4 py-10 md:hidden'>
				<div className='mx-auto max-w-4xl'>
					<div className='h-14 flex items-center justify-center'>
						<h2 className='font-josefin tracking-wider font-bold text-white text-2xl'>{section?.name ?? 'EXECUTIVES'}</h2>
					</div>

					{president ? (
						<div className='mt-8 flex justify-center'>
							<ExecCard member={president} size='lg' />
						</div>
					) : null}

					{othersMobile.length ? (
						<div className='mt-10 grid grid-cols-2 gap-x-6 gap-y-10'>
							{othersMobile.map((member) => (
								<ExecCard key={member.id} member={member} />
							))}
						</div>
					) : null}
				</div>
			</div>

			{/* Desktop (md+) */}
			<div className='hidden md:block relative bg-default overflow-hidden px-8 py-16'>
				{section?.backgroundImageUrl ? (
					<Image
						alt={section.backgroundImageAlt || section.name}
						src={section.backgroundImageUrl}
						fill
						sizes='100vw'
						className='object-cover object-center opacity-60 blur-[2px]'
					/>
				) : null}

				<div className='relative z-10 mx-auto max-w-6xl'>
					<div className='grid grid-cols-3 items-start justify-items-center gap-x-8'>
						<div className='flex justify-center w-full mt-10'>
							{externalEvp ? <ExecCardDesktop member={externalEvp} variant='evp' /> : null}
						</div>
						<div className='flex justify-center w-full'>
							{president ? <ExecCardDesktop member={president} variant='president' /> : null}
						</div>
						<div className='flex justify-center w-full mt-10'>
							{internalEvp ? <ExecCardDesktop member={internalEvp} variant='evp' /> : null}
						</div>
					</div>

					{othersDesktop.length ? (
						<div className='mt-14 flex flex-wrap justify-center gap-x-12 lg:gap-x-28 gap-y-12'>
							{othersDesktop.map((member) => (
								<div key={member.id} className='w-[220px] flex justify-center'>
									<ExecCardDesktop member={member} variant='member' />
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>
		</section>
	)
}

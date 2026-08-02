'use client'
import HeroBanner from '@/components/team/heroBanner'
import ExecutiveSection from '@/components/team/executiveSection'
import DepartmentSection from '@/components/team/departmentSection'
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function Team() {
    const [pageData, setPageData] = useState(null)
    const [membersById, setMembersById] = useState({})
    const [availablePages, setAvailablePages] = useState([])
    const [selectedPageId, setSelectedPageId] = useState('current')

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // 1) Team page structure (fields live on doc; sections live in a subcollection)
                const currentPageRef = doc(db, 'teamPages', selectedPageId)
                const currentPageSnap = await getDoc(currentPageRef)

                if (!currentPageSnap.exists()) {
                    setPageData(null)
                    return
                }

                const pageFields = currentPageSnap.data() ?? {}

                // Fetch subcollection: teamPages/current/sections
                const sectionsSnap = await getDocs(collection(currentPageRef, 'sections'))
                const sections = {}
                sectionsSnap.forEach((sectionDoc) => {
                    sections[sectionDoc.id] = sectionDoc.data()
                })

                const nextPageData = {
                    ...pageFields,
                    // common normalization if your Firestore uses `year` instead of `yearLabel`
                    yearLabel: pageFields.yearLabel ?? pageFields.year,
                    sections,
                }

                setPageData(nextPageData)

                console.log('Fetched team page data:', nextPageData) // Debug log

                // 2) Members lookup table
                const membersSnap = await getDocs(selectedPageId === 'current' ? collection(db, 'members') : collection(currentPageRef, 'memberSnapshots'))
                const nextMembersById = {}
                membersSnap.forEach((memberDoc) => {
                    nextMembersById[memberDoc.id] = memberDoc.data()
                })
                setMembersById(nextMembersById)

                if (selectedPageId === 'current') {
                    const pagesSnap = await getDocs(collection(db, 'teamPages'))
                    const historical = pagesSnap.docs
                        .filter((pageDoc) => pageDoc.id !== 'current' && pageDoc.data()?.status === 'published' && pageDoc.data()?.yearLabel !== nextPageData.yearLabel)
                        .map((pageDoc) => ({ id: pageDoc.id, yearLabel: pageDoc.data()?.yearLabel || pageDoc.id }))
                        .sort((a, b) => b.yearLabel.localeCompare(a.yearLabel))
                    setAvailablePages([{ id: 'current', yearLabel: nextPageData.yearLabel }, ...historical])
                }
            } catch (err) {
                console.error('Error fetching team data:', err)
                setPageData(null)
                setMembersById({})
            }
        }

        fetchTeamData()
    }, [selectedPageId])

    if (!pageData) {
        return <main className='overflow-x-hidden lg:pt-16 w-screen' />
    }

    const departmentSections = Object.entries(pageData.sections ?? {})
        .filter(([, section]) => section?.type === 'department')
        .sort(([, a], [, b]) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(([id, department]) => ({ id, department }))

    return (
        <main className='overflow-x-hidden bg-default'>
            <HeroBanner heroImageAlt={pageData.heroImageAlt} heroImageUrl={pageData.heroImageUrl} title={pageData.title} yearLabel={pageData.yearLabel} />

            {availablePages.length > 1 ? (
                <nav className='flex flex-wrap items-center justify-center gap-2 border-y border-white/10 bg-[#0E0C24]/95 px-4 py-6 font-josefin backdrop-blur-md' aria-label='Team years'>
                    {availablePages.map((teamPage) => (
                        <button key={teamPage.id} onClick={() => setSelectedPageId(teamPage.id)} className={`border px-5 py-2 text-sm tracking-wider transition ${selectedPageId === teamPage.id ? 'border-beige bg-beige text-default' : 'border-white/15 text-white/60 hover:border-beige/60 hover:text-white'}`}>
                            {teamPage.yearLabel}
                        </button>
                    ))}
                </nav>
            ) : null}

            <ExecutiveSection section={pageData.sections?.executives} membersById={membersById} />

            {departmentSections.map(({ id, department }) => (
				<DepartmentSection key={id} id={id} department={department} membersById={membersById} />
            ))}
        </main>
    );
}

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

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // 1) Team page structure (fields live on doc; sections live in a subcollection)
                const currentPageRef = doc(db, 'teamPages', 'current')
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
                const membersSnap = await getDocs(collection(db, 'members'))
                const nextMembersById = {}
                membersSnap.forEach((memberDoc) => {
                    nextMembersById[memberDoc.id] = memberDoc.data()
                })
                setMembersById(nextMembersById)

                console.log('Fetched members data:', nextMembersById) // Debug log
            } catch (err) {
                console.error('Error fetching team data:', err)
                setPageData(null)
                setMembersById({})
            }
        }

        fetchTeamData()
    }, [])

    if (!pageData) {
        return <main className='overflow-x-hidden lg:pt-16 w-screen' />
    }

    const departmentSections = Object.entries(pageData.sections ?? {})
        .filter(([, section]) => section?.type === 'department')
        .sort(([, a], [, b]) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(([id, department]) => ({ id, department }))

    return (
        <main className='overflow-x-hidden lg:pt-16 w-screen'>
            <HeroBanner heroImageAlt={pageData.heroImageAlt} heroImageUrl={pageData.heroImageUrl} title={pageData.title} yearLabel={pageData.yearLabel} />

            <ExecutiveSection section={pageData.sections?.executives} membersById={membersById} />

            {departmentSections.map(({ id, department }) => (
				<DepartmentSection key={id} id={id} department={department} membersById={membersById} />
            ))}
        </main>
    );
}
'use client'
import HeroBanner from '@/components/team/heroBanner'
import ExecutiveSection from '@/components/team/executiveSection'
import DepartmentSection from '@/components/team/departmentSection'
import { db } from '@/lib/firebase';
import { collection, doc, getDocFromServer, getDocsFromServer } from 'firebase/firestore';
import { useState } from 'react';
import useRemoteData from '@/hooks/useRemoteData';
import ContentStatus from '@/components/general/ContentStatus';

async function loadTeam({ key: selectedPageId }) {
    const pageRef = doc(db, 'teamPages', selectedPageId)
    const pageSnap = await getDocFromServer(pageRef)
    if (!pageSnap.exists()) return null
    const [sectionsSnap, membersSnap, pagesSnap] = await Promise.all([
        getDocsFromServer(collection(pageRef, 'sections')),
        getDocsFromServer(selectedPageId === 'current' ? collection(db, 'members') : collection(pageRef, 'memberSnapshots')),
        getDocsFromServer(collection(db, 'teamPages')),
    ])
    const pageFields = pageSnap.data()
    const pageData = {
        ...pageFields,
        yearLabel: pageFields.yearLabel ?? pageFields.year,
        sections: Object.fromEntries(sectionsSnap.docs.map(document => [document.id, document.data()])),
    }
    const current = pagesSnap.docs.find(document => document.id === 'current')?.data()
    const currentYear = current?.yearLabel ?? current?.year
    const historical = pagesSnap.docs
        .filter(document => document.id !== 'current' && document.data().status === 'published' && document.data().yearLabel !== currentYear)
        .map(document => ({ id: document.id, yearLabel: document.data().yearLabel || document.id }))
        .sort((a, b) => b.yearLabel.localeCompare(a.yearLabel))
    return {
        pageData,
        membersById: Object.fromEntries(membersSnap.docs.map(document => [document.id, document.data()])),
        availablePages: [...(current ? [{ id: 'current', yearLabel: currentYear }] : []), ...historical],
    }
}

export default function Team() {
    const [selectedPageId, setSelectedPageId] = useState('current')
    const { data, loading, error, retry } = useRemoteData(loadTeam, selectedPageId)

    if (loading || error || !data) {
        return <main className="min-h-[70svh] pt-28">
            <ContentStatus loading={loading} error={error} retry={retry} label="the team" emptyMessage="This team page hasn’t been published yet." />
            {!loading && selectedPageId !== 'current' ? <button onClick={() => setSelectedPageId('current')} className="mx-auto block pb-12 text-beige underline">Back to the current team</button> : null}
        </main>
    }

    const { pageData, membersById, availablePages } = data

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

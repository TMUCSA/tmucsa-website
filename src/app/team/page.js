'use client'
import { teamPages, members } from "./teamData";
import HeroBanner from '@/components/team/heroBanner'
import ExecutiveSection from '@/components/team/executiveSection'
import DepartmentSection from '@/components/team/departmentSection'
export default function Team() {

    const pageData = teamPages.current
    const departmentSections = Object.entries(pageData.sections)
        .filter(([, section]) => section?.type === 'department')
        .sort(([, a], [, b]) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(([id, department]) => ({ id, department }))

    return (
        <main className='overflow-x-hidden lg:pt-16 w-screen'>
            <HeroBanner heroImageAlt={pageData.heroImageAlt} heroImageUrl={pageData.heroImageUrl} title={pageData.title} yearLabel={pageData.yearLabel} />

            <ExecutiveSection section={pageData.sections.executives} membersById={members} />

            {departmentSections.map(({ id, department }) => (
                <DepartmentSection key={id} id={id} department={department} />
            ))}
        </main>
    );
}
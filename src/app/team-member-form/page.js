'use client';

import TeamMemberForm from '@/components/general/TeamMemberForm';

export default function AddTeamMemberPage() {
    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white font-jost">
                        Add New Team Member
                    </h1>
                    <p className="mt-4 text-lg text-gray-200 font-josefin">
                        Fill out the form below to add a new team member to the database.
                    </p>
                </div>
                
                <TeamMemberForm />
            </div>
        </div>
    );
}

'use client';

import TeamMemberForm from '@/components/general/TeamMemberForm';

export default function AddTeamMemberPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add New Team Member
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Fill out the form below to add a new team member to the database.
                    </p>
                </div>
                
                <TeamMemberForm />
                
                <div className="mt-8 text-center">
                    <a 
                        href="/"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}

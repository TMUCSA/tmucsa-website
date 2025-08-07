import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        
        // Extract form fields
        const department = formData.get('department');
        const name = formData.get('name');
        const program = formData.get('program');
        const role = formData.get('role');
        const year = formData.get('year');
        const imageFile = formData.get('image');

        // Validate required fields
        if (!department || !name || !program || !role || !year) {
            return NextResponse.json(
                { error: 'Missing required fields: department, name, program, role, year' },
                { status: 400 }
            );
        }

        let photoUrl = '';

        // Handle image upload if provided
        if (imageFile && imageFile instanceof File) {
            try {
                // Create a unique filename
                const timestamp = Date.now();
                const fileExtension = imageFile.name.split('.').pop();
                const filename = `team-members/${timestamp}-${name.replace(/\s+/g, '-')}.${fileExtension}`;
                
                // Create storage reference
                const storageRef = ref(storage, filename);
                
                // Convert File to ArrayBuffer for upload
                const arrayBuffer = await imageFile.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                
                // Upload file to Firebase Storage
                const uploadResult = await uploadBytes(storageRef, bytes, {
                    contentType: imageFile.type
                });
                
                // Get download URL
                photoUrl = await getDownloadURL(uploadResult.ref);
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload image to storage' },
                    { status: 500 }
                );
            }
        }

        // Create team member document
        const teamMemberData = {
            department,
            name,
            photoUrl,
            program,
            role,
            year: parseInt(year), // Convert year to number
            createdAt: new Date().toISOString()
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'team-members'), teamMemberData);

        return NextResponse.json(
            { 
                success: true,
                id: docRef.id,
                data: teamMemberData
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding team member:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Retrieve all team members
        const teamMembersSnapshot = await getDocs(collection(db, 'team-members'));
        const teamMembers = teamMembersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            success: true,
            data: teamMembers
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team members' },
            { status: 500 }
        );
    }
}

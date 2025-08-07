import { useState } from 'react';

export default function TeamMemberForm() {
    const [formData, setFormData] = useState({
        department: '',
        name: '',
        program: '',
        role: '',
        year: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setMessage('Please select a valid image file (JPEG, PNG, or WebP)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image file size must be less than 5MB');
                return;
            }
            
            setImageFile(file);
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate that an image is selected
        if (!imageFile) {
            setMessage('Please select a photo');
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            
            // Append form fields
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            
            // Append image if selected
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const response = await fetch('/api/team-members', {
                method: 'POST',
                body: submitData
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('Team member added successfully!');
                // Reset form
                setFormData({
                    department: '',
                    name: '',
                    program: '',
                    role: '',
                    year: ''
                });
                setImageFile(null);
                // Reset file input
                const fileInput = document.getElementById('image');
                if (fileInput) fileInput.value = '';
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Add Team Member</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department *
                    </label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                        Program *
                    </label>
                    <input
                        type="text"
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role *
                    </label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year *
                    </label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="6"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Photo *
                    </label>
                    <input
                        type="file"
                        id="image"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        required
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        JPEG, PNG, or WebP. Max file size: 5MB
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                >
                    {loading ? 'Adding...' : 'Add Team Member'}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-md ${
                    message.includes('Error') || message.includes('Network error')
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
}

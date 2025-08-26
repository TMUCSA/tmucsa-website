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
    const [previewUrl, setPreviewUrl] = useState(null);

    const departmentOptions = [
        'Executives',
        'Marketing',
        'Events',
        'Corporate Relations',
        'Finance',
        'Internals'
    ]

    const roleOptions = {
        'Executives': ['President', 'Vice President', 'VP Marketing', 'VP Events', 'VP Corporate Relations', 'VP Finance', 'VP Internals'],
        'Marketing': ['VP Marketing', 'Graphics Director', 'Marketing Associate', 'Graphics Associate', 'Photographer', 'Videographer', 'Web Developer'],
        'Events': ['VP Events', 'Events Director', 'Events Associate'],
        'Corporate Relations': ['VP Corporate Relations', 'Corporate Director', 'Corporate Associate'],
        'Finance': ['VP Finance', 'Finance Director', 'Finance Associate'],
        'Internals': ['VP Internals', 'Internals Director', 'Internals Associate']
    }

    const yearOptions = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

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
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setMessage('Please select a valid image file (JPEG, PNG, or WebP)');
                return;
            }
    
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image file size must be less than 5MB');
                return;
            }
    
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 🎉 preview
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
            setImageFile(null);
            setPreviewUrl(null);            
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-gray-200 p-6 rounded-lg shadow-md font-jost">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="text-md font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border-gray-600 shadow-lg text-md p-2 bg-gray-100"
                    />
                </div>

                <div>
                    <label htmlFor="program" className="text-md font-medium text-gray-700">
                        Program <span className='text-xs'>(e.g. Business Management, Computer Science)</span>
                    </label>
                    <input
                        type="text"
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border-gray-600 shadow-lg text-md p-2 bg-gray-100"
                    />
                </div>

                <div>
                    <label htmlFor="department" className="text-md font-medium text-gray-700">
                        Department
                    </label>
                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={(e) => {
                        handleInputChange(e);
                        // reset role when department changes
                        setFormData((prev) => ({ ...prev, role: "" }));
                        }}
                        required
                        className="w-full rounded-md border-gray-600 shadow-lg text-md p-2 bg-gray-100"
                    >
                        <option value="">-- Select Department --</option>
                        {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="role" className="text-md font-medium text-gray-700">
                        Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.department}
                        className={`w-full rounded-md border-gray-600 shadow-lg text-md p-2 bg-gray-100 ${
                        !formData.department ? "cursor-not-allowed bg-gray-300" : ""
                        }`}
                    >
                        <option value="">-- Select Role --</option>
                        {formData.department &&
                        roleOptions[formData.department].map((role) => (
                            <option key={role} value={role}>
                            {role}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="year" className="text-md font-medium text-gray-700">
                        Year
                    </label>
                    <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border-gray-600 shadow-lg text-md p-2 bg-gray-100"
                    >
                        <option value="">-- Select Year --</option>
                        {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="image" className="text-md font-medium text-gray-700">
                        Photo
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
                    
                    {previewUrl && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-48 rounded-md shadow-md border border-gray-300"
                            />
                        </div>
                    )}
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

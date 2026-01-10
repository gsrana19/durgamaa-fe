import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout, getAdminTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../../services/api';

const AdminTeamMembers = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    mobileNumber: '',
    displayOrder: 0,
    image: null
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const data = await getAdminTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
      setErrorMessage('Failed to load team members. Please try again.');
    }
  };

  const checkAuthStatus = async () => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      position: '',
      mobileNumber: '',
      displayOrder: teamMembers.length,
      image: null
    });
    setImagePreview(null);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      position: member.position,
      mobileNumber: member.mobileNumber || '',
      displayOrder: member.displayOrder || 0,
      image: null
    });
    setImagePreview(member.imageUrl ? getFullImageUrl(member.imageUrl) : null);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        await loadTeamMembers();
        setSuccessMessage('Team member deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting team member:', error);
        setErrorMessage('Failed to delete team member. Please try again.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: type === 'number' ? parseInt(value) || 0 : value });
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Name is required');
      return;
    }
    if (!formData.position.trim()) {
      setErrorMessage('Position is required');
      return;
    }
    if (!editingId && !formData.image) {
      setErrorMessage('Image is required when adding a new team member');
      return;
    }

    try {
      if (editingId) {
        await updateTeamMember(
          editingId,
          formData.name,
          formData.position,
          formData.mobileNumber,
          formData.displayOrder,
          formData.image
        );
        setSuccessMessage('Team member updated successfully!');
      } else {
        await createTeamMember(
          formData.name,
          formData.position,
          formData.mobileNumber,
          formData.displayOrder,
          formData.image
        );
        setSuccessMessage('Team member added successfully!');
      }
      await loadTeamMembers();
      setShowForm(false);
      setFormData({ name: '', position: '', mobileNumber: '', displayOrder: 0, image: null });
      setImagePreview(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving team member:', error);
      let errorMsg = 'Failed to save team member. Please try again.';
      if (error.response) {
        errorMsg = error.response.data?.message || error.response.data?.error || errorMsg;
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        errorMsg = 'Network error. Please check if the API Gateway is running.';
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', position: '', mobileNumber: '', displayOrder: 0, image: null });
    setImagePreview(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return backendBaseUrl + (url.startsWith('/') ? url : '/' + url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white flex items-center justify-center">
        <div className="text-saffron-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-saffron-600">
            Team Members Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm md:text-base font-semibold min-h-[44px]"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm md:text-base font-semibold min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
            {errorMessage}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={handleAdd}
            className="bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold min-h-[44px]"
          >
            ➕ Add Team Member
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
              {editingId ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Shri Ram Kumar"
                  required
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., President, Secretary, Treasurer"
                  required
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g., +91 9876543210"
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
                <p className="text-gray-500 text-sm mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Photo <span className="text-red-500">*</span> {editingId && <span className="text-gray-500 text-sm">(Leave empty to keep current image)</span>}
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required={!editingId}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold min-h-[44px]"
                >
                  {editingId ? 'Update' : 'Add'} Team Member
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-base md:text-lg font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-6">
            Team Members ({teamMembers.length})
          </h2>
          {teamMembers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No team members added yet. Click "Add Team Member" to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={getFullImageUrl(member.imageUrl)}
                      alt={member.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = '/temple-hero.jpeg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-saffron-600 mb-2">{member.name}</h3>
                    <p className="text-gray-600 mb-2 italic">{member.position}</p>
                    {member.mobileNumber && (
                      <p className="text-gray-500 mb-4 text-sm">
                        📞 {member.mobileNumber}
                      </p>
                    )}
                    {!member.mobileNumber && <div className="mb-4"></div>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 bg-saffron-500 text-white px-4 py-2 rounded-lg hover:bg-saffron-600 text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeamMembers;


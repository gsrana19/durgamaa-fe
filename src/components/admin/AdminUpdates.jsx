import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUpdates, createUpdate, updateUpdate, deleteUpdate, checkAuth, logout } from '../../services/api';

const AdminUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '', imageUrl: '' });
  const navigate = useNavigate();
  
  useEffect(() => {
    loadUpdates();
  }, []);
  
  const loadUpdates = async () => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
        return;
      }
      const data = await getAdminUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUpdate(editingId, formData);
      } else {
        await createUpdate(formData);
      }
      setFormData({ title: '', message: '', imageUrl: '' });
      setShowForm(false);
      setEditingId(null);
      await loadUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
      alert('Error saving update');
    }
  };
  
  const handleEdit = (update) => {
    setFormData({
      title: update.title,
      message: update.message,
      imageUrl: update.imageUrl || '',
    });
    setEditingId(update.id);
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this update?')) {
      return;
    }
    try {
      await deleteUpdate(id);
      await loadUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      alert('Error deleting update');
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
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-saffron-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Manage Updates</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/donations')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Donations
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        <div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', message: '', imageUrl: '' });
            }}
            className="w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold"
          >
            {showForm ? 'Cancel' : 'Add New Update'}
          </button>
        </div>
        
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              {editingId ? 'Edit Update' : 'Create New Update'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="Update title"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="Update message"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e => setFormData({ ...formData, imageUrl: e.target.value }))}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        )}
        
        {/* Mobile: Card Layout */}
        <div className="md:hidden space-y-4">
          {updates.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg p-6">
              No updates found
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{update.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{update.message}</p>
                    <p className="text-xs text-gray-500">ID: {update.id} | {new Date(update.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(update)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(update.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Desktop: Table Layout */}
        <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-saffron-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Message</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {updates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No updates found
                    </td>
                  </tr>
                ) : (
                  updates.map((update) => (
                    <tr key={update.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{update.id}</td>
                      <td className="px-6 py-4 font-semibold">{update.title}</td>
                      <td className="px-6 py-4 max-w-md">{update.message.substring(0, 50)}...</td>
                      <td className="px-6 py-4">{new Date(update.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(update)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(update.id)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdates;

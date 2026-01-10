import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout, getEvents, createEvent, updateEvent, deleteEvent, getEventMedia, uploadEventMedia, deleteEventMedia, getDeletedEventMedia, restoreEventMedia, permanentlyDeleteEventMedia } from '../../services/api';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    dateRange: '',
    dateRangeHi: '',
    shortDescription: '',
    shortDescriptionHi: '',
    morningSchedule: '',
    morningScheduleHi: '',
    afternoonSchedule: '',
    afternoonScheduleHi: '',
    eveningSchedule: '',
    eveningScheduleHi: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventMedia, setEventMedia] = useState({}); // { eventId: [media items] }
  const [deletedMedia, setDeletedMedia] = useState({}); // { eventId: [deleted media items] }
  const [uploadingMedia, setUploadingMedia] = useState({}); // { eventId: boolean }
  const [selectedFile, setSelectedFile] = useState({}); // { eventId: File }
  const [showDeleted, setShowDeleted] = useState({}); // { eventId: boolean }

  useEffect(() => {
    checkAuthStatus();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      // Transform backend response to match frontend structure (preserve Hindi fields)
      const transformedEvents = data.map(event => ({
        id: event.id,
        name: event.name,
        nameHi: event.nameHi || '',
        dateRange: event.dateRange,
        dateRangeHi: event.dateRangeHi || '',
        shortDescription: event.shortDescription,
        shortDescriptionHi: event.shortDescriptionHi || '',
        schedule: {
          morning: event.schedule.morning,
          afternoon: event.schedule.afternoon,
          evening: event.schedule.evening
        },
        scheduleHi: event.scheduleHi || {
          morning: '',
          afternoon: '',
          evening: ''
        }
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
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
      nameHi: '',
      dateRange: '',
      dateRangeHi: '',
      shortDescription: '',
      shortDescriptionHi: '',
      morningSchedule: '',
      morningScheduleHi: '',
      afternoonSchedule: '',
      afternoonScheduleHi: '',
      eveningSchedule: '',
      eveningScheduleHi: ''
    });
    setSuccessMessage('');
    setErrorMessage('');
    setFieldErrors({});
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      name: event.name || '',
      nameHi: event.nameHi || '',
      dateRange: event.dateRange || '',
      dateRangeHi: event.dateRangeHi || '',
      shortDescription: event.shortDescription || '',
      shortDescriptionHi: event.shortDescriptionHi || '',
      morningSchedule: event.schedule?.morning || '',
      morningScheduleHi: event.scheduleHi?.morning || '',
      afternoonSchedule: event.schedule?.afternoon || '',
      afternoonScheduleHi: event.scheduleHi?.afternoon || '',
      eveningSchedule: event.schedule?.evening || '',
      eveningScheduleHi: event.scheduleHi?.evening || ''
    });
    setSuccessMessage('');
    setShowForm(true);
  };

  const handleViewMedia = async (eventId) => {
    if (selectedEventId === eventId) {
      // Hide media section
      setSelectedEventId(null);
      setShowDeleted({ ...showDeleted, [eventId]: false });
    } else {
      // Show media section
      setSelectedEventId(eventId);
      try {
        const media = await getEventMedia(eventId);
        setEventMedia({ ...eventMedia, [eventId]: media });
        // Load deleted media
        try {
          const deleted = await getDeletedEventMedia(eventId);
          setDeletedMedia({ ...deletedMedia, [eventId]: deleted });
        } catch (error) {
          console.error('Error loading deleted media:', error);
          setDeletedMedia({ ...deletedMedia, [eventId]: [] });
        }
      } catch (error) {
        console.error('Error loading event media:', error);
        setEventMedia({ ...eventMedia, [eventId]: [] });
      }
    }
  };

  const handleToggleDeleted = async (eventId) => {
    const currentState = showDeleted[eventId] || false;
    setShowDeleted({ ...showDeleted, [eventId]: !currentState });
    
    if (!currentState) {
      // Load deleted media when showing
      try {
        const deleted = await getDeletedEventMedia(eventId);
        setDeletedMedia({ ...deletedMedia, [eventId]: deleted });
      } catch (error) {
        console.error('Error loading deleted media:', error);
        setDeletedMedia({ ...deletedMedia, [eventId]: [] });
      }
    }
  };

  const handleFileSelect = (eventId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ ...selectedFile, [eventId]: file });
    }
  };

  const handleUploadMedia = async (eventId) => {
    const file = selectedFile[eventId];
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploadingMedia({ ...uploadingMedia, [eventId]: true });
    try {
      const response = await uploadEventMedia(eventId, file);
      // Reload media for this event
      const media = await getEventMedia(eventId);
      setEventMedia({ ...eventMedia, [eventId]: media });
      setSelectedFile({ ...selectedFile, [eventId]: null });
      // Reset file input
      const fileInput = document.getElementById(`file-input-${eventId}`);
      if (fileInput) fileInput.value = '';
      setSuccessMessage('Media uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploadingMedia({ ...uploadingMedia, [eventId]: false });
    }
  };

  const handleDeleteMedia = async (eventId, mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media? It will be moved to deleted items and can be restored later.')) {
      return;
    }

    try {
      await deleteEventMedia(eventId, mediaId);
      // Reload media for this event
      const media = await getEventMedia(eventId);
      setEventMedia({ ...eventMedia, [eventId]: media });
      // Reload deleted media
      const deleted = await getDeletedEventMedia(eventId);
      setDeletedMedia({ ...deletedMedia, [eventId]: deleted });
      setSuccessMessage('Media deleted successfully! You can restore it from deleted items.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media. Please try again.');
    }
  };

  const handleRestoreMedia = async (eventId, mediaId) => {
    try {
      await restoreEventMedia(eventId, mediaId);
      // Reload media for this event
      const media = await getEventMedia(eventId);
      setEventMedia({ ...eventMedia, [eventId]: media });
      // Reload deleted media
      const deleted = await getDeletedEventMedia(eventId);
      setDeletedMedia({ ...deletedMedia, [eventId]: deleted });
      setSuccessMessage('Media restored successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error restoring media:', error);
      alert('Failed to restore media. Please try again.');
    }
  };

  const handlePermanentlyDeleteMedia = async (eventId, mediaId) => {
    if (!window.confirm('Are you sure you want to permanently delete this media? This action cannot be undone!')) {
      return;
    }

    try {
      await permanentlyDeleteEventMedia(eventId, mediaId);
      // Reload deleted media
      const deleted = await getDeletedEventMedia(eventId);
      setDeletedMedia({ ...deletedMedia, [eventId]: deleted });
      setSuccessMessage('Media permanently deleted!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error permanently deleting media:', error);
      alert('Failed to permanently delete media. Please try again.');
    }
  };

  const getFullMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return backendBaseUrl + (url.startsWith('/') ? url : '/' + url);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        await loadEvents();
        setSuccessMessage('Event deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage('');
    setFieldErrors({});
    
    // Validate that at least one language is provided for each field
    const errors = {};
    let hasErrors = false;
    
    if (!formData.name?.trim() && !formData.nameHi?.trim()) {
      errors.name = 'Please provide Event Name in either English or Hindi (or both)';
      hasErrors = true;
    }
    if (!formData.dateRange?.trim() && !formData.dateRangeHi?.trim()) {
      errors.dateRange = 'Please provide Date Range in either English or Hindi (or both)';
      hasErrors = true;
    }
    if (!formData.shortDescription?.trim() && !formData.shortDescriptionHi?.trim()) {
      errors.shortDescription = 'Please provide Short Description in either English or Hindi (or both)';
      hasErrors = true;
    }
    if (!formData.morningSchedule?.trim() && !formData.morningScheduleHi?.trim()) {
      errors.morningSchedule = 'Please provide Morning Schedule in either English or Hindi (or both)';
      hasErrors = true;
    }
    if (!formData.afternoonSchedule?.trim() && !formData.afternoonScheduleHi?.trim()) {
      errors.afternoonSchedule = 'Please provide Afternoon Schedule in either English or Hindi (or both)';
      hasErrors = true;
    }
    if (!formData.eveningSchedule?.trim() && !formData.eveningScheduleHi?.trim()) {
      errors.eveningSchedule = 'Please provide Evening Schedule in either English or Hindi (or both)';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in all required fields in at least one language.');
      return;
    }
    
    const eventData = {
      name: formData.name || '',
      nameHi: formData.nameHi || '',
      dateRange: formData.dateRange || '',
      dateRangeHi: formData.dateRangeHi || '',
      shortDescription: formData.shortDescription || '',
      shortDescriptionHi: formData.shortDescriptionHi || '',
      morningSchedule: formData.morningSchedule || '',
      morningScheduleHi: formData.morningScheduleHi || '',
      afternoonSchedule: formData.afternoonSchedule || '',
      afternoonScheduleHi: formData.afternoonScheduleHi || '',
      eveningSchedule: formData.eveningSchedule || '',
      eveningScheduleHi: formData.eveningScheduleHi || ''
    };

    try {
      if (editingId) {
        // Update existing event
        await updateEvent(editingId, eventData);
        setSuccessMessage('Event updated successfully!');
      } else {
        // Add new event
        await createEvent(eventData);
        setSuccessMessage('Event added successfully!');
      }

      await loadEvents();
      setShowForm(false);
      setEditingId(null);
      setErrorMessage('');
      setFieldErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save event. Please try again.';
      setErrorMessage(errorMsg);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      nameHi: '',
      dateRange: '',
      dateRangeHi: '',
      shortDescription: '',
      shortDescriptionHi: '',
      morningSchedule: '',
      morningScheduleHi: '',
      afternoonSchedule: '',
      afternoonScheduleHi: '',
      eveningSchedule: '',
      eveningScheduleHi: ''
    });
    setErrorMessage('');
    setFieldErrors({});
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
            Event Management
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
            ➕ Add Event
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
              {editingId ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Event Name (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Navratri Utsav"
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Event Name (Hindi) / कार्यक्रम का नाम (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <input
                  type="text"
                  name="nameHi"
                  value={formData.nameHi}
                  onChange={handleChange}
                  placeholder="e.g., नवरात्रि उत्सव"
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Date Range (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <input
                  type="text"
                  name="dateRange"
                  value={formData.dateRange}
                  onChange={handleChange}
                  placeholder="e.g., October 15 - October 24, 2024"
                  className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                    fieldErrors.dateRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.dateRange && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.dateRange}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Date Range (Hindi) / तारीख सीमा (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <input
                  type="text"
                  name="dateRangeHi"
                  value={formData.dateRangeHi}
                  onChange={handleChange}
                  placeholder="e.g., 15 अक्टूबर - 24 अक्टूबर, 2024"
                  className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                    fieldErrors.dateRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.dateRange && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.dateRange}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Short Description (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Nine days of devotion and celebration..."
                  className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                    fieldErrors.shortDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.shortDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Short Description (Hindi) / संक्षिप्त विवरण (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                </label>
                <textarea
                  name="shortDescriptionHi"
                  value={formData.shortDescriptionHi}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., नौ दिनों की भक्ति और उत्सव..."
                  className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                    fieldErrors.shortDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.shortDescription}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Morning Schedule (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="morningSchedule"
                      value={formData.morningSchedule}
                      onChange={handleChange}
                      placeholder="e.g., Morning Puja: 6:00 AM - 8:00 AM"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.morningSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.morningSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.morningSchedule}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Morning Schedule (Hindi) / सुबह का कार्यक्रम (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="morningScheduleHi"
                      value={formData.morningScheduleHi}
                      onChange={handleChange}
                      placeholder="e.g., सुबह की पूजा: सुबह 6:00 - 8:00"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.morningSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.morningSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.morningSchedule}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Afternoon Schedule (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="afternoonSchedule"
                      value={formData.afternoonSchedule}
                      onChange={handleChange}
                      placeholder="e.g., Afternoon Bhog: 12:00 PM - 1:00 PM"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.afternoonSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.afternoonSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.afternoonSchedule}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Afternoon Schedule (Hindi) / दोपहर का कार्यक्रम (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="afternoonScheduleHi"
                      value={formData.afternoonScheduleHi}
                      onChange={handleChange}
                      placeholder="e.g., दोपहर का भोग: दोपहर 12:00 - 1:00"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.afternoonSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.afternoonSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.afternoonSchedule}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Evening Schedule (English) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="eveningSchedule"
                      value={formData.eveningSchedule}
                      onChange={handleChange}
                      placeholder="e.g., Evening Aarti: 6:00 PM - 8:00 PM"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.eveningSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.eveningSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.eveningSchedule}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Evening Schedule (Hindi) / शाम का कार्यक्रम (हिंदी) <span className="text-gray-500 text-xs">(At least one language required)</span>
                    </label>
                    <input
                      type="text"
                      name="eveningScheduleHi"
                      value={formData.eveningScheduleHi}
                      onChange={handleChange}
                      placeholder="e.g., शाम की आरती: शाम 6:00 - 8:00"
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        fieldErrors.eveningSchedule ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.eveningSchedule && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.eveningSchedule}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold min-h-[44px]"
                >
                  {editingId ? 'Update' : 'Add Event'}
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

        <div className="space-y-4 md:space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg p-6 md:p-8"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-saffron-600 mb-2">
                    {event.name || event.nameHi || 'Untitled Event'}
                  </h3>
                  {event.name && event.nameHi && (
                    <p className="text-lg md:text-xl font-semibold text-saffron-500 mb-1">
                      {event.nameHi}
                    </p>
                  )}
                  <p className="text-saffron-500 font-semibold mb-3 text-sm md:text-base">
                    {event.dateRange || event.dateRangeHi || 'No date range'}
                  </p>
                  {event.dateRange && event.dateRangeHi && (
                    <p className="text-saffron-400 font-semibold mb-3 text-sm md:text-base">
                      {event.dateRangeHi}
                    </p>
                  )}
                  <p className="text-gray-700 mb-4 text-base md:text-lg">
                    {event.shortDescription || event.shortDescriptionHi || 'No description'}
                  </p>
                  {event.shortDescription && event.shortDescriptionHi && (
                    <p className="text-gray-600 mb-4 text-base md:text-lg">
                      {event.shortDescriptionHi}
                    </p>
                  )}
                  <div className="bg-saffron-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm md:text-base mb-1">
                      <strong>Morning:</strong> {event.schedule?.morning || event.scheduleHi?.morning || 'Not specified'}
                    </p>
                    {event.schedule?.morning && event.scheduleHi?.morning && (
                      <p className="text-gray-600 text-sm md:text-base mb-1 ml-4">
                        {event.scheduleHi.morning}
                      </p>
                    )}
                    <p className="text-gray-700 text-sm md:text-base mb-1">
                      <strong>Afternoon:</strong> {event.schedule?.afternoon || event.scheduleHi?.afternoon || 'Not specified'}
                    </p>
                    {event.schedule?.afternoon && event.scheduleHi?.afternoon && (
                      <p className="text-gray-600 text-sm md:text-base mb-1 ml-4">
                        {event.scheduleHi.afternoon}
                      </p>
                    )}
                    <p className="text-gray-700 text-sm md:text-base">
                      <strong>Evening:</strong> {event.schedule?.evening || event.scheduleHi?.evening || 'Not specified'}
                    </p>
                    {event.schedule?.evening && event.scheduleHi?.evening && (
                      <p className="text-gray-600 text-sm md:text-base ml-4">
                        {event.scheduleHi.evening}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => handleEdit(event)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm md:text-base font-semibold min-h-[44px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleViewMedia(event.id)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm md:text-base font-semibold min-h-[44px]"
                >
                  {selectedEventId === event.id ? 'Hide Media' : 'Manage Media'}
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm md:text-base font-semibold min-h-[44px]"
                >
                  Delete
                </button>
              </div>

              {/* Event Media Gallery Section */}
              {selectedEventId === event.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg md:text-xl font-bold text-saffron-600 mb-4">
                    Event Gallery (Admin)
                  </h4>
                  
                  {/* Upload Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      Upload Image or Video
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        id={`file-input-${event.id}`}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileSelect(event.id, e)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                      />
                      <button
                        onClick={() => handleUploadMedia(event.id)}
                        disabled={!selectedFile[event.id] || uploadingMedia[event.id]}
                        className={`px-6 py-2 rounded-lg text-sm md:text-base font-semibold min-h-[44px] ${
                          !selectedFile[event.id] || uploadingMedia[event.id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-saffron-500 text-white hover:bg-saffron-600'
                        }`}
                      >
                        {uploadingMedia[event.id] ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Media Gallery */}
                  {eventMedia[event.id] && eventMedia[event.id].length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {eventMedia[event.id].map((media) => (
                        <div key={media.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
                          {media.mediaType === 'IMAGE' ? (
                            <img
                              src={getFullMediaUrl(media.mediaUrl)}
                              alt={media.originalName || 'Event image'}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          ) : (
                            <video
                              src={getFullMediaUrl(media.mediaUrl)}
                              controls
                              className="w-full h-48 object-cover"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <button
                            onClick={() => handleDeleteMedia(event.id, media.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-xs font-semibold"
                          >
                            Delete
                          </button>
                          {media.originalName && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                              {media.originalName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No media uploaded yet for this event.</p>
                  )}

                  {/* Deleted Media Section */}
                  <div className="mt-8 pt-6 border-t border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-base md:text-lg font-bold text-gray-600">
                        Deleted Media
                      </h5>
                      <button
                        onClick={() => handleToggleDeleted(event.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        {showDeleted[event.id] ? 'Hide' : 'Show'} Deleted
                      </button>
                    </div>

                    {showDeleted[event.id] && (
                      <>
                        {deletedMedia[event.id] && deletedMedia[event.id].length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {deletedMedia[event.id].map((media) => (
                              <div key={media.id} className="relative bg-gray-200 rounded-lg overflow-hidden opacity-75">
                                {media.mediaType === 'IMAGE' ? (
                                  <img
                                    src={getFullMediaUrl(media.mediaUrl)}
                                    alt={media.originalName || 'Deleted event image'}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                      e.target.src = '/placeholder-image.png';
                                    }}
                                  />
                                ) : (
                                  <video
                                    src={getFullMediaUrl(media.mediaUrl)}
                                    controls
                                    className="w-full h-48 object-cover"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                  DELETED
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 flex gap-2">
                                  <button
                                    onClick={() => handleRestoreMedia(event.id, media.id)}
                                    className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-green-600"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handlePermanentlyDeleteMedia(event.id, media.id)}
                                    className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-700"
                                  >
                                    Delete Forever
                                  </button>
                                </div>
                                {media.originalName && (
                                  <div className="absolute top-10 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                                    {media.originalName}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No deleted media for this event.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;


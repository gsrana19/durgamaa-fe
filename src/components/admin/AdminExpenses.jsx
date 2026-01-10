import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminExpenses, createExpense, updateExpense, deleteExpense, checkAuth, logout, getExpenseStats, uploadDocument } from '../../services/api';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseStats, setExpenseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [searchDescription, setSearchDescription] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    category: '', 
    notes: '',
    purchaseDate: '',
    supportingDocument: ''
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [documentUploadMessage, setDocumentUploadMessage] = useState('');
  const [documentUploadSuccess, setDocumentUploadSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Helper function to convert relative URLs to full URLs
  const getFullDocumentUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, construct full URL
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return backendBaseUrl + (url.startsWith('/') ? url : '/' + url);
  };
  
  useEffect(() => {
    loadExpenses(0, '');
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchDescription) {
        setSearchDescription(searchInput);
        setCurrentPage(0);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  // Load expenses when search description or page changes
  useEffect(() => {
    loadExpenses(currentPage, searchDescription);
  }, [currentPage, searchDescription]);
  
  const loadExpenses = async (page, description) => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
        return;
      }
      const [data, stats] = await Promise.all([
        getAdminExpenses(page, pageSize, description),
        getExpenseStats()
      ]);
      console.log('Loaded expenses:', data);
      // Check if data is paginated response
      if (data.expenses) {
        setExpenses(data.expenses);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        // Fallback for non-paginated response
        setExpenses(data);
        setCurrentPage(0);
        setTotalPages(1);
        setTotalElements(data.length);
      }
      setExpenseStats(stats);
    } catch (error) {
      console.error('Error loading expenses:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setAmountError('');
    
    // Validate amount before submitting
    if (amountError) {
      return; // Don't submit if there's an amount error
    }
    
    try {
      const expenseAmount = parseFloat(formData.amount);
      
      const expenseData = {
        description: formData.description,
        amount: expenseAmount,
        category: formData.category || null,
        notes: formData.notes || null,
        purchaseDate: formData.purchaseDate,
        supportingDocument: formData.supportingDocument && formData.supportingDocument.trim() !== '' ? formData.supportingDocument : null
      };
      
      if (editingId) {
        await updateExpense(editingId, expenseData);
      } else {
        await createExpense(expenseData);
      }
      setFormData({ description: '', amount: '', category: '', notes: '', purchaseDate: '', supportingDocument: '' });
      setSelectedDocument(null);
      setAmountError('');
      setDocumentUploadMessage('');
      setDocumentUploadSuccess(false);
      setShowForm(false);
      setEditingId(null);
      await loadExpenses(currentPage, searchDescription);
    } catch (error) {
      console.error('Error saving expense:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      // Check if it's an amount-related error
      if (errorMessage.toLowerCase().includes('exceeds') || errorMessage.toLowerCase().includes('balance')) {
        setAmountError(errorMessage);
      } else {
        alert(`Error saving expense: ${errorMessage}`);
      }
    }
  };
  
  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value });
    
    // Clear error when user starts typing
    if (amountError) {
      setAmountError('');
    }
    
    // Validate amount in real-time
    if (value && !isNaN(parseFloat(value))) {
      const expenseAmount = parseFloat(value);
      if (expenseStats && expenseStats.remaining !== undefined) {
        const remaining = parseFloat(expenseStats.remaining);
        if (editingId) {
          // For edit: find current expense amount
          const currentExpense = expenses.find(e => e.id === editingId);
          const currentAmount = currentExpense ? parseFloat(currentExpense.amount) : 0;
          const adjustedRemaining = remaining + currentAmount;
          
          if (expenseAmount > adjustedRemaining) {
            setAmountError(`Amount exceeds remaining balance. Maximum allowed: ₹${adjustedRemaining.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
          } else {
            setAmountError('');
          }
        } else {
          // For new expense
          if (expenseAmount > remaining) {
            setAmountError(`Amount exceeds remaining balance. Maximum allowed: ₹${remaining.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
          } else {
            setAmountError('');
          }
        }
      }
    }
  };
  
  const handleEdit = (expense) => {
    const purchaseDate = expense.purchaseDate ? expense.purchaseDate.split('T')[0] : '';
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category || '',
      notes: expense.notes || '',
      purchaseDate: purchaseDate,
      supportingDocument: expense.supportingDocument || ''
    });
    setSelectedDocument(null);
    setAmountError('');
    setDocumentUploadMessage('');
    setDocumentUploadSuccess(false);
    setEditingId(expense.id);
    setShowForm(true);
    // Reset file input
    setTimeout(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }, 100);
  };
  
  const handleDocumentSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedDocument(file);
      // Clear the old document URL when a new file is selected
      setFormData({ ...formData, supportingDocument: '' });
      // Clear any previous upload messages
      setDocumentUploadMessage('');
      setDocumentUploadSuccess(false);
    }
  };
  
  const handleUploadDocument = async () => {
    if (!selectedDocument) {
      setDocumentUploadMessage('Please select a document first');
      setDocumentUploadSuccess(false);
      return;
    }
    
    // Clear previous messages
    setDocumentUploadMessage('');
    setDocumentUploadSuccess(false);
    
    // Verify authentication before upload
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        setDocumentUploadMessage('Your session has expired. Please log in again.');
        setDocumentUploadSuccess(false);
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
        return;
      }
    } catch (authError) {
      console.error('Auth check failed:', authError);
      setDocumentUploadMessage('Authentication failed. Please log in again.');
      setDocumentUploadSuccess(false);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      return;
    }
    
    try {
      setUploadingDocument(true);
      const response = await uploadDocument(selectedDocument);
      // Construct full URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
      const backendBaseUrl = apiBaseUrl.replace('/api', '');
      const documentUrl = backendBaseUrl + response.url;
      setFormData({ ...formData, supportingDocument: documentUrl });
      setDocumentUploadMessage('Document uploaded successfully!');
      setDocumentUploadSuccess(true);
      setSelectedDocument(null);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDocumentUploadMessage('');
        setDocumentUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.response?.statusText || error.message || 'Unknown error';
      if (error.response?.status === 403) {
        setDocumentUploadMessage('Access denied. Your session may have expired. Please log in again.');
        setDocumentUploadSuccess(false);
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setDocumentUploadMessage(`Error uploading document: ${errorMessage}. Please try again.`);
        setDocumentUploadSuccess(false);
      }
    } finally {
      setUploadingDocument(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    try {
      await deleteExpense(id);
      await loadExpenses(currentPage, searchDescription);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
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
  
  const formatAmount = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-saffron-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Manage Expenses</h1>
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
                onClick={() => navigate('/admin/updates')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Updates
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
        {/* Summary Stats */}
        {expenseStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-saffron-600 mb-2">
                {formatAmount(expenseStats.totalDonations)}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Total Amount Deposited</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">
                {formatAmount(expenseStats.totalExpenses)}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Total Expenses</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                {formatAmount(expenseStats.remaining)}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Remaining</div>
            </div>
          </div>
        )}
        
        <div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ description: '', amount: '', category: '', notes: '', purchaseDate: '', supportingDocument: '' });
              setSelectedDocument(null);
              setAmountError('');
            }}
            className="w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold"
          >
            {showForm ? 'Cancel' : '➕ Add Expenditure'}
          </button>
        </div>
        
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="Expense description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-gray-700 font-semibold text-sm md:text-base">
                      Amount (₹) *
                    </label>
                    {amountError && (
                      <span className="text-red-600 font-bold text-sm">{amountError}</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={editingId 
                      ? expenseStats && expenses.find(e => e.id === editingId)
                        ? (parseFloat(expenseStats.remaining) + parseFloat(expenses.find(e => e.id === editingId).amount))
                        : expenseStats?.remaining
                      : expenseStats?.remaining}
                    required
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                      amountError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {expenseStats && expenseStats.remaining !== undefined && !amountError && (
                    <p className="text-xs text-gray-500 mt-1">
                      Remaining balance: ₹{parseFloat(expenseStats.remaining).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      {editingId && expenses.find(e => e.id === editingId) && (
                        <span className="text-green-600">
                          {' '}(Max: ₹{(parseFloat(expenseStats.remaining) + parseFloat(expenses.find(e => e.id === editingId).amount)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.purchaseDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const today = new Date().toISOString().split('T')[0];
                      if (selectedDate <= today) {
                        setFormData({ ...formData, purchaseDate: selectedDate });
                      }
                    }}
                    className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="e.g., Construction, Materials, Labor"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                  placeholder="Additional notes (optional)"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Supporting Document (Optional)
                </label>
                {documentUploadMessage && (
                  <div className={`mb-2 text-sm font-semibold ${documentUploadSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {documentUploadMessage}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentSelect}
                      key={editingId || 'new'} // Force re-render when editing changes
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                    />
                    {selectedDocument && (
                      <button
                        type="button"
                        onClick={handleUploadDocument}
                        disabled={uploadingDocument}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                          uploadingDocument
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {uploadingDocument ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div>
                  {formData.supportingDocument && !selectedDocument && (
                    <div className="text-sm text-gray-600">
                      <a href={getFullDocumentUrl(formData.supportingDocument)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Current Document
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, supportingDocument: '' });
                          setSelectedDocument(null);
                          // Reset file input
                          const fileInput = document.querySelector('input[type="file"]');
                          if (fileInput) fileInput.value = '';
                        }}
                        className="ml-3 text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {selectedDocument && (
                    <div className="text-sm text-green-600 font-semibold">
                      New document selected: {selectedDocument.name}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold"
              >
                {editingId ? 'Update' : 'Add Expense'}
              </button>
            </form>
          </div>
        )}
        
        {/* Search and Pagination Controls */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="w-full md:w-auto flex-1">
              <input
                type="text"
                placeholder="Search by description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
              />
            </div>
            <div className="text-sm text-gray-600 font-semibold">
              Total Records: {totalElements}
            </div>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }`}
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }`}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }`}
              >
                Last
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile: Card Layout */}
        <div className="md:hidden space-y-4">
          {expenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg p-6">
              No expenses found
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{expense.description}</h3>
                    {expense.category && (
                      <p className="text-sm text-saffron-600 mb-2">{expense.category}</p>
                    )}
                    <p className="text-xs text-gray-500">Purchase: {expense.purchaseDate ? new Date(expense.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p className="text-xs text-gray-500">{formatDate(expense.createdAt)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-red-600">
                      {formatAmount(expense.amount)}
                    </div>
                  </div>
                </div>
                {expense.notes && (
                  <div className="pt-2 border-t mb-3">
                    <p className="text-sm text-gray-600">{expense.notes}</p>
                  </div>
                )}
                {expense.supportingDocument && (
                  <div className="pt-2 border-t mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Document:</strong>{' '}
                      <a 
                        href={getFullDocumentUrl(expense.supportingDocument)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        📄 View Supporting Document
                      </a>
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
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
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Description</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Purchase Date</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Document</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{expense.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{expense.description}</div>
                        {expense.notes && (
                          <div className="text-sm text-gray-500 mt-1">{expense.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">{expense.category || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        {formatAmount(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {expense.purchaseDate ? new Date(expense.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {expense.supportingDocument ? (
                          <a 
                            href={getFullDocumentUrl(expense.supportingDocument)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline font-semibold text-sm"
                          >
                            📄 View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
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

export default AdminExpenses;


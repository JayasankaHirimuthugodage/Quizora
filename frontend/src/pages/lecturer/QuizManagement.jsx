// frontend/src/pages/lecturer/QuizManagement.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { quizService } from '../../services/quizService';
import { moduleService } from '../../services/moduleService';
import QuizModal from '../../components/lecturer/QuizModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  PlayCircle
} from 'lucide-react';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    moduleCode: 'all'
  });

  // Use ref to store interval ID for better control
  const intervalRef = useRef(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const filterParams = {};
      
      // Only add non-default filter values
      if (filters.search.trim()) filterParams.search = filters.search.trim();
      if (filters.status !== 'all') filterParams.status = filters.status;
      if (filters.moduleCode !== 'all') filterParams.moduleCode = filters.moduleCode;

      const response = await quizService.getQuizzes(filterParams);
      setQuizzes(response.quizzes || []);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchModules = useCallback(async () => {
    try {
      const response = await moduleService.getModules();
      setModules(response.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  }, []);

  // Manual status refresh
  const handleRefreshStatuses = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log('Manually refreshing quiz statuses...');
      
      await quizService.updateQuizStatuses();
      await fetchQuizzes();
      
      console.log('Quiz statuses refreshed successfully');
    } catch (err) {
      console.error('Error refreshing quiz statuses:', err);
      setError('Error refreshing quiz statuses: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchQuizzes]);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    // Clear existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only start auto-refresh if modal is not open
    if (!showModal && !deleteConfirm) {
      intervalRef.current = setInterval(() => {
        console.log('Auto-refreshing quizzes...');
        fetchQuizzes();
      }, 60000); // Changed to 60 seconds (1 minute) - less aggressive
    }
  }, [fetchQuizzes, showModal, deleteConfirm]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial load and setup auto-refresh
  useEffect(() => {
    fetchQuizzes();
    fetchModules();
  }, [fetchQuizzes, fetchModules]);

  // Handle auto-refresh based on modal state
  useEffect(() => {
    if (showModal || deleteConfirm) {
      // Stop auto-refresh when modal is open
      stopAutoRefresh();
      console.log('Auto-refresh stopped - modal/dialog open');
    } else {
      // Start auto-refresh when modal is closed
      startAutoRefresh();
      console.log('Auto-refresh started - modal/dialog closed');
    }

    // Cleanup on unmount
    return () => stopAutoRefresh();
  }, [showModal, deleteConfirm, startAutoRefresh, stopAutoRefresh]);

  // Handle page visibility change - pause auto-refresh when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
        console.log('Auto-refresh paused - page hidden');
      } else if (!showModal && !deleteConfirm) {
        startAutoRefresh();
        console.log('Auto-refresh resumed - page visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showModal, deleteConfirm, startAutoRefresh, stopAutoRefresh]);

  const handleCreateQuiz = useCallback(() => {
    setEditingQuiz(null);
    setShowModal(true);
  }, []);

  const handleEditQuiz = useCallback((quiz) => {
    setEditingQuiz(quiz);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingQuiz(null);
  }, []);

  const handleSaveQuiz = useCallback(async () => {
    setShowModal(false);
    setEditingQuiz(null);
    // Fetch immediately after save
    await fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDeleteQuiz = useCallback((quiz) => {
    setDeleteConfirm(quiz);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const response = await quizService.deleteQuiz(deleteConfirm._id);
      
      if (response.warning) {
        alert(`${response.message}\n\n${response.warning}`);
      }
      
      await fetchQuizzes();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirm, fetchQuizzes]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  const getQuizStatus = useCallback((quiz) => {
    // Use the status from the database first
    if (quiz.status) {
      return quiz.status;
    }

    // Fallback calculation
    const now = new Date();
    const start = new Date(quiz.startDateTime);
    const end = new Date(quiz.endDateTime);

    if (quiz.status === 'cancelled') return 'cancelled';
    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'active';
    return 'scheduled';
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800 animate-pulse';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={14} />;
      case 'active':
        return <PlayCircle size={14} className="animate-pulse" />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  }, []);

  const formatDateTime = useCallback((dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const isQuizEditable = useCallback((quiz) => {
    const now = new Date();
    const end = new Date(quiz.endDateTime);
    return now <= end && quiz.status !== 'cancelled';
  }, []);

  const getEditTooltip = useCallback((quiz) => {
    const status = getQuizStatus(quiz);
    if (status === 'active') {
      return 'Quiz is active - limited editing available';
    } else if (status === 'completed') {
      return 'Quiz has ended - cannot edit';
    } else if (status === 'cancelled') {
      return 'Quiz is cancelled - cannot edit';
    }
    return 'Edit quiz';
  }, [getQuizStatus]);

  const getDeleteTooltip = useCallback((quiz) => {
    const status = getQuizStatus(quiz);
    if (status === 'active') {
      return 'Cancel active quiz';
    } else if (status === 'completed') {
      return 'Delete completed quiz';
    }
    return 'Delete quiz';
  }, [getQuizStatus]);

  // Filter quizzes based on current filters
  const filteredQuizzes = quizzes.filter(quiz => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = (
        quiz.title?.toLowerCase().includes(searchLower) ||
        quiz.moduleCode?.toLowerCase().includes(searchLower) ||
        quiz.moduleId?.moduleName?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      const quizStatus = getQuizStatus(quiz);
      if (quizStatus !== filters.status) return false;
    }

    // Module filter
    if (filters.moduleCode !== 'all') {
      if (quiz.moduleCode !== filters.moduleCode) return false;
    }

    return true;
  });

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-sm text-gray-600">
            Create and manage your quizzes. 
            {!showModal && !deleteConfirm && (
              <span className="text-green-600"> Auto-refresh: Active (60s intervals)</span>
            )}
            {(showModal || deleteConfirm) && (
              <span className="text-orange-600"> Auto-refresh: Paused</span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          {/* Manual refresh button */}
          <button
            onClick={handleRefreshStatuses}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh quiz statuses"
          >
            <RefreshCw 
              size={16} 
              className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={handleCreateQuiz}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Create Quiz
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-sm text-red-600 underline hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="sm:w-48">
            <select
              value={filters.moduleCode}
              onChange={(e) => handleFilterChange('moduleCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module._id} value={module.moduleCode}>
                  {module.moduleCode} - {module.moduleName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status !== 'all' || filters.moduleCode !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first quiz'
              }
            </p>
            {!filters.search && filters.status === 'all' && filters.moduleCode === 'all' && (
              <button
                onClick={handleCreateQuiz}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Create Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuizzes.map((quiz) => {
                  const status = getQuizStatus(quiz);
                  return (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quiz.moduleCode} - {quiz.moduleId?.moduleName}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Questions: {quiz.questionCount || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>Start: {formatDateTime(quiz.startDateTime)}</div>
                          <div>End: {formatDateTime(quiz.endDateTime)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quiz.duration} minutes
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditQuiz(quiz)}
                            disabled={!isQuizEditable(quiz)}
                            title={getEditTooltip(quiz)}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz)}
                            title={getDeleteTooltip(quiz)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {showModal && (
        <QuizModal
          quiz={editingQuiz}
          modules={modules}
          onClose={handleCloseModal}
          onSave={handleSaveQuiz}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {getQuizStatus(deleteConfirm) === 'active' ? 'Cancel Quiz' : 'Delete Quiz'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    {getQuizStatus(deleteConfirm) === 'active' 
                      ? `Are you sure you want to cancel "${deleteConfirm.title}"? This will stop the quiz immediately and students won't be able to continue.`
                      : `Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`
                    }
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? 'Processing...' : (getQuizStatus(deleteConfirm) === 'active' ? 'Cancel Quiz' : 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
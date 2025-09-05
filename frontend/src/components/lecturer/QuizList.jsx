// frontend\src\components\lecturer\QuizList.jsx

import { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { Plus, Edit, Trash2, Calendar, Clock, Users, Key, AlertTriangle, CheckCircle } from 'lucide-react';

const QuizList = ({ onCreateQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    moduleCode: ''
  });
  const [stats, setStats] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchStats();
    
    // Set up real-time refresh for active quizzes
    const interval = setInterval(() => {
      fetchQuizzes();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [filters]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzes(filters);
      setQuizzes(response.quizzes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await quizService.getQuizStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    setDeleteConfirm(quiz);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const response = await quizService.deleteQuiz(deleteConfirm._id);
      
      if (response.warning) {
        alert(`Warning: ${response.warning}`);
      }
      
      fetchQuizzes();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startDateTime);
    const end = new Date(quiz.endDateTime);

    if (quiz.status === 'cancelled') return 'cancelled';
    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'active';
    return 'scheduled';
  };

  const getStatusColor = (status) => {
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
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={14} />;
      case 'active':
        return <CheckCircle size={14} className="animate-pulse" />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isQuizEditable = (quiz) => {
    const now = new Date();
    const end = new Date(quiz.endDateTime);
    return now <= end && quiz.status !== 'cancelled';
  };

  const isQuizDeletable = (quiz) => {
    const now = new Date();
    const end = new Date(quiz.endDateTime);
    return now <= end && quiz.status !== 'cancelled';
  };

  const getEditTooltip = (quiz) => {
    const status = getQuizStatus(quiz);
    if (status === 'active') {
      return 'Quiz is active - limited editing available';
    } else if (status === 'completed') {
      return 'Quiz has ended - cannot edit';
    } else if (status === 'cancelled') {
      return 'Quiz is cancelled - cannot edit';
    }
    return 'Edit quiz';
  };

  const getDeleteTooltip = (quiz) => {
    const status = getQuizStatus(quiz);
    if (status === 'active') {
      return 'Warning: This will cancel the active quiz';
    } else if (status === 'completed') {
      return 'Quiz has ended - cannot delete';
    } else if (status === 'cancelled') {
      return 'Quiz is already cancelled';
    }
    return 'Delete quiz';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-sm text-gray-600">Create and manage quiz schedules with real-time editing</p>
        </div>
        <button
          onClick={onCreateQuiz}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Create Quiz
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-lg font-semibold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600 animate-pulse" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Now</p>
                <p className="text-lg font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Module
            </label>
            <input
              type="text"
              placeholder="Enter module code"
              value={filters.moduleCode}
              onChange={(e) => setFilters(prev => ({ ...prev, moduleCode: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchQuizzes}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 gap-6">
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">Create your first quiz to get started</p>
            <button
              onClick={onCreateQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            const editable = isQuizEditable(quiz);
            const deletable = isQuizDeletable(quiz);

            return (
              <div key={quiz._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {quiz.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </span>
                      {status === 'active' && (
                        <div className="ml-2 flex items-center text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">{quiz.moduleCode}</span>
                      {quiz.moduleId?.moduleName && ` - ${quiz.moduleId.moduleName}`}
                    </div>

                    {quiz.description && (
                      <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-500">Start</p>
                          <p className="font-medium">{formatDateTime(quiz.startDateTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-500">End</p>
                          <p className="font-medium">{formatDateTime(quiz.endDateTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">{quiz.duration} mins</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Key className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-500">Passcode</p>
                          <p className="font-medium font-mono">{quiz.passcode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {editable && (
                      <button
                        onClick={() => onEditQuiz(quiz)}
                        className={`p-2 rounded transition-colors ${
                          status === 'active' 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={getEditTooltip(quiz)}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    
                    {deletable && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz)}
                        className={`p-2 rounded transition-colors ${
                          status === 'active'
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={getDeleteTooltip(quiz)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {!editable && !deletable && (
                      <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        {status === 'completed' ? 'Completed' : 'Cancelled'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Eligible Students:</p>
                  <div className="flex flex-wrap gap-2">
                    {quiz.eligibilityCriteria.map((criteria, index) => (
                      <span key={index} className="inline-flex px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                        {criteria.degreeTitle} - Year {criteria.year}, Sem {criteria.semester}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {quiz.eligibilityCriteria.length} eligible group{quiz.eligibilityCriteria.length !== 1 ? 's' : ''}
                    </div>
                    
                    {status === 'active' && (
                      <div className="text-xs text-green-600 font-medium">
                        Students can access this quiz now
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              {getQuizStatus(deleteConfirm) === 'active' ? (
                <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              ) : (
                <Trash2 className="w-6 h-6 text-red-500 mr-3" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {getQuizStatus(deleteConfirm) === 'active' ? 'Cancel Active Quiz?' : 'Delete Quiz?'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              {getQuizStatus(deleteConfirm) === 'active' 
                ? `Are you sure you want to cancel "${deleteConfirm.title}"? This quiz is currently active and students may be taking it. This action cannot be undone.`
                : `Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`
              }
            </p>
            
            {getQuizStatus(deleteConfirm) === 'active' && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Warning:</strong> Students currently taking this quiz will be notified that it has been cancelled.
                </p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  getQuizStatus(deleteConfirm) === 'active'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? 'Processing...' : getQuizStatus(deleteConfirm) === 'active' ? 'Cancel Quiz' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;
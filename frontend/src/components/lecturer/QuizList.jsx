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
    
    const interval = setInterval(() => {
      fetchQuizzes();
    }, 30000);

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
        alert(`${response.message}\n\n${response.warning}`);
      }
      
      await fetchQuizzes();
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
      return 'Cancel active quiz';
    } else if (status === 'completed') {
      return 'Delete completed quiz';
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
          <p className="text-sm text-gray-600">Create and manage quiz schedules</p>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Module</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter module code..."
              value={filters.moduleCode}
              onChange={(e) => setFilters(prev => ({ ...prev, moduleCode: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first quiz</p>
            <button
              onClick={onCreateQuiz}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Create Quiz
            </button>
          </div>
        ) : (
          quizzes.map(quiz => {
            const status = getQuizStatus(quiz);
            const editable = isQuizEditable(quiz);

            return (
              <div key={quiz._id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </span>
                      {quiz.passcode && (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          <Key className="w-3 h-3 mr-1" />
                          Protected
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Module:</span>
                        <span className="ml-1 font-medium">{quiz.moduleId?.moduleCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{quiz.duration} min</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Start:</span>
                        <span className="ml-1 font-medium">{formatDateTime(quiz.startDateTime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">End:</span>
                        <span className="ml-1 font-medium">{formatDateTime(quiz.endDateTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {editable && (
                      <button
                        onClick={() => handleEditQuiz(quiz)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={getEditTooltip(quiz)}
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    {/* Always show delete button */}
                    <button
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={getDeleteTooltip(quiz)}
                    >
                      <Trash2 size={16} />
                    </button>
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
              <Trash2 className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Quiz?</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.title}"? This will remove it from your quiz list.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;
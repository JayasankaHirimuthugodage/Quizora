import { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { Plus, Edit, Trash2, Calendar, Clock, Users, Key, MoreVertical } from 'lucide-react';

const QuizList = ({ onCreateQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    moduleCode: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchQuizzes();
    fetchStats();
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
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await quizService.deleteQuiz(quiz._id);
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    return !quiz.hasStarted && quiz.status !== 'cancelled';
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
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-lg font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
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
          quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      {quiz.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quiz.status)}`}>
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </span>
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
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{quiz.duration} mins</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-500">Eligible Groups</p>
                        <p className="font-medium">{quiz.eligibilityCriteria.length}</p>
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
                  {isQuizEditable(quiz) && (
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Quiz"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Quiz"
                    disabled={quiz.hasStarted}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;
import { useState } from 'react';
import { Calendar, Clock, Key, Users, BookOpen, AlertCircle } from 'lucide-react';

const QuizCard = ({ quiz, onStartQuiz }) => {
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isQuizActive = () => {
    const now = new Date();
    const start = new Date(quiz.startDateTime);
    const end = new Date(quiz.endDateTime);
    return now >= start && now <= end;
  };

  const getQuizStatus = () => {
    const now = new Date();
    const start = new Date(quiz.startDateTime);
    const end = new Date(quiz.endDateTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  const getStatusColor = () => {
    const status = getQuizStatus();
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    const status = getQuizStatus();
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active Now';
      case 'ended':
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  const handleAccessQuiz = () => {
    if (!isQuizActive()) {
      setError('Quiz is not currently active');
      return;
    }
    setShowPasscodeInput(true);
    setError('');
  };

  const handleSubmitPasscode = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the quiz passcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onStartQuiz(quiz._id, passcode.trim());
    } catch (err) {
      setError(err.message || 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowPasscodeInput(false);
    setPasscode('');
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
            <p className="text-sm text-gray-600">
              {quiz.moduleId?.moduleCode} - {quiz.moduleId?.moduleName}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {quiz.description && (
          <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
            <div>
              <p className="text-gray-500">Start Time</p>
              <p className="font-medium">{formatDateTime(quiz.startDateTime)}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-red-500 mr-2" />
            <div>
              <p className="text-gray-500">End Time</p>
              <p className="font-medium">{formatDateTime(quiz.endDateTime)}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 text-green-500 mr-2" />
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">{quiz.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <BookOpen className="w-4 h-4 text-purple-500 mr-2" />
            <div>
              <p className="text-gray-500">Questions</p>
              <p className="font-medium">{quiz.questionCount}</p>
            </div>
          </div>
        </div>

        {/* Passcode Input Form */}
        {showPasscodeInput ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <form onSubmit={handleSubmitPasscode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Quiz Passcode
                </label>
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Start Quiz'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Action Button */
          <div className="flex justify-end">
            {getQuizStatus() === 'active' ? (
              <button
                onClick={handleAccessQuiz}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <Key className="w-4 h-4 mr-2" />
                Access Quiz
              </button>
            ) : getQuizStatus() === 'upcoming' ? (
              <button
                disabled
                className="flex items-center px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Starts {formatDateTime(quiz.startDateTime)}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Quiz Ended
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
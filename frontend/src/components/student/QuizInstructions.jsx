import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const QuizInstructions = ({ quiz, onStartQuiz, onCancel }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async () => {
    if (!acknowledged) {
      alert('Please acknowledge that you have read and understood the instructions');
      return;
    }

    setLoading(true);
    try {
      await onStartQuiz();
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(quiz.endDateTime);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Quiz has ended';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-blue-100 mt-1">
                  {quiz.moduleCode} - Quiz Instructions
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-blue-100">
                  <Clock className="w-5 h-5 mr-2" />
                  {getTimeRemaining()}
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Details */}
          <div className="px-8 py-6 bg-blue-50 border-b border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">{quiz.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="text-gray-600">Questions</p>
                  <p className="font-semibold text-gray-900">{quiz.questionCount}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                <div>
                  <p className="text-gray-600">Ends at</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(quiz.endDateTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
              Important Instructions
            </h2>

            <div className="prose max-w-none text-gray-700">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">Before You Begin</h3>
                    <p className="text-sm text-yellow-700">
                      Please read all instructions carefully. Once you start the quiz, the timer will begin 
                      and cannot be paused. Ensure you have a stable internet connection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quiz-Specific Instructions:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {quiz.instructions}
                  </div>
                </div>
              </div>

              {/* General Rules */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">General Rules:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    You have {quiz.duration} minutes to complete all {quiz.questionCount} questions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Your answers will be automatically saved as you progress
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    You can navigate between questions using the navigation panel
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Make sure to click "Submit Quiz" when you're finished
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                    The quiz will automatically submit when time runs out
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Do not refresh or close the browser window during the quiz
                  </li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Technical Requirements:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Stable internet connection</li>
                    <li>• Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                    <li>• JavaScript enabled</li>
                    <li>• Screen resolution of at least 1024x768</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgment and Start */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="acknowledge"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acknowledge" className="ml-3 text-sm text-gray-700">
                I have read and understood all the instructions above, and I am ready to begin the quiz.
              </label>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              <button
                onClick={handleStartQuiz}
                disabled={!acknowledged || loading}
                className="flex items-center px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    Start Quiz
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;
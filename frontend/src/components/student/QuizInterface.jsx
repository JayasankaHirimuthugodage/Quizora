// frontend/src/components/student/QuizInterface.jsx

import { useState, useEffect, useCallback } from 'react';
import { Clock, BookOpen, ChevronLeft, ChevronRight, Flag, CheckCircle, AlertTriangle } from 'lucide-react';

const QuizInterface = ({ quiz, questions, onSubmitQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Initialize timer
  useEffect(() => {
    const endTime = new Date(quiz.endDateTime).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeRemaining(remaining);
  }, [quiz.endDateTime]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto submit when time expires
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto submit when time expires
  const handleAutoSubmit = useCallback(() => {
    console.log('Auto-submitting quiz due to time expiry');
    submitQuizData();
  }, [answers, startTime, onSubmitQuiz]);

  // Submit quiz data
  const submitQuizData = () => {
    console.log('=== FRONTEND QUIZ SUBMISSION ===');
    console.log('Current answers object:', answers);
    
    // Convert answers object to array format expected by backend
    const answersArray = Object.entries(answers).map(([questionId, answer]) => {
      console.log(`Converting: ${questionId} -> ${answer}`);
      return {
        questionId,
        answer
      };
    });

    console.log('Converted answers array:', answersArray);

    const submissionData = {
      answers: answersArray,
      timeTaken: Date.now() - startTime,
      startTime: new Date(startTime).toISOString()
    };

    console.log('Final submission data:', submissionData);
    onSubmitQuiz(submissionData);
  };

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    console.log(`Answer changed for question ${questionId}:`, answer);
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      console.log('Updated answers object:', newAnswers);
      return newAnswers;
    });
  };

  // Toggle question flag
  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Navigation
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    console.log('Submit button clicked');
    setShowSubmitConfirm(false);
    submitQuizData();
  };

  // Get answered count
  const getAnsweredCount = () => {
    return Object.keys(answers).filter(qId => {
      const answer = answers[qId];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining > 300 ? 'bg-green-100 text-green-800' :
                timeRemaining > 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeRemaining)}
              </div>
              
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 mb-6">
                {questions.map((question, index) => {
                  const isAnswered = answers[question._id] !== undefined && 
                                   answers[question._id] !== null && 
                                   answers[question._id] !== '';
                  const isFlagged = flaggedQuestions.has(question._id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question._id}
                      onClick={() => goToQuestion(index)}
                      className={`
                        relative w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${isCurrent 
                          ? 'bg-blue-600 text-white' 
                          : isAnswered 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium">{getAnsweredCount()}/{questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Flagged:</span>
                  <span className="font-medium">{flaggedQuestions.size}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {currentQuestion.type}
                    </span>
                    <button
                      onClick={() => toggleFlag(currentQuestion._id)}
                      className={`p-1 rounded ${
                        flaggedQuestions.has(currentQuestion._id)
                          ? 'text-orange-500'
                          : 'text-gray-400 hover:text-orange-500'
                      }`}
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-800 leading-relaxed">{currentQuestion.questionText}</p>
                  </div>

                  {/* Question Image */}
                  {currentQuestion.image && (
                    <div className="mb-6">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/uploads/${currentQuestion.image}`}
                        alt="Question"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="space-y-4">
                    {currentQuestion.type === 'MCQ' && (
                      <div className="space-y-3">
                        {currentQuestion.options?.map((option, index) => (
                          <label key={index} className="flex items-start cursor-pointer p-3 rounded-lg border hover:bg-gray-50">
                            <input
                              type="radio"
                              name={`question_${currentQuestion._id}`}
                              value={option.text}
                              checked={answers[currentQuestion._id] === option.text}
                              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                              className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-800">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {(currentQuestion.type === 'Structured' || currentQuestion.type === 'Essay') && (
                      <div>
                        <textarea
                          value={answers[currentQuestion._id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                          placeholder="Type your answer here..."
                          rows={currentQuestion.type === 'Essay' ? 8 : 4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                          {currentQuestion.type === 'Essay' 
                            ? 'Write a detailed essay response'
                            : 'Provide a structured answer with clear explanations'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  {getAnsweredCount()}/{questions.length} answered
                </div>

                <button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Submit Quiz?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You have answered {getAnsweredCount()} out of {questions.length} questions.
            </p>
            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizInterface;
// frontend\src\pages\student\QuizPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import QuizInstructions from '../../components/student/QuizInstructions';
import QuizInterface from '../../components/student/QuizInterface';
import { AlertCircle, CheckCircle, Trophy } from 'lucide-react';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState('loading');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    initializeQuiz();
  }, [id, location.state]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if quiz data was passed via navigation state (after passcode verification)
      if (location.state?.quizData) {
        console.log('Using quiz data from navigation state:', location.state.quizData);
        setQuiz(location.state.quizData);
        setCurrentStep('instructions');
      } else {
        // If no quiz data in state, redirect back to dashboard
        console.log('No quiz data found, redirecting to dashboard');
        navigate('/student/dashboard', { 
          replace: true,
          state: { message: 'Please access the quiz from your dashboard' }
        });
        return;
      }
    } catch (err) {
      console.error('Error initializing quiz:', err);
      setError(err.message || 'Failed to initialize quiz');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizQuestions = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizQuestions(id);
      setQuestions(response.questions || []);
      setCurrentStep('quiz');
    } catch (err) {
      console.error('Error loading quiz questions:', err);
      setError(err.message || 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    await loadQuizQuestions();
  };

  const handleCancelQuiz = () => {
    navigate('/student/dashboard');
  };

  const handleSubmitQuiz = async (submissionData) => {
    try {
      setLoading(true);
      
      const response = await quizService.submitQuiz(id, {
        answers: submissionData.answers,
        timeTaken: submissionData.timeTaken,
        startTime: submissionData.startTime
      });

      // Store result for display
      setQuizResult(response.result);
      setCurrentStep('completed');
      
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Completion state
  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          
          {quizResult && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  Grade: {quizResult.grade}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Score</p>
                  <p className="font-semibold">{quizResult.score}/{quizResult.totalMarks}</p>
                </div>
                <div>
                  <p className="text-gray-600">Percentage</p>
                  <p className="font-semibold">{quizResult.percentage}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Time Taken</p>
                  <p className="font-semibold">{quizResult.timeTaken} min</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Submitted</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Your quiz has been submitted successfully. 
            You will be redirected to your dashboard shortly.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Instructions step
  if (currentStep === 'instructions' && quiz) {
    return (
      <QuizInstructions
        quiz={quiz}
        onStartQuiz={handleStartQuiz}
        onCancel={handleCancelQuiz}
      />
    );
  }

  // Quiz step
  if (currentStep === 'quiz' && quiz && questions.length > 0) {
    return (
      <QuizInterface
        quiz={quiz}
        questions={questions}
        onSubmitQuiz={handleSubmitQuiz}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing quiz...</p>
      </div>
    </div>
  );
};

export default QuizPage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import QuizInstructions from '../../components/student/QuizInstructions';
import QuizInterface from '../../components/student/QuizInterface';
import { AlertCircle } from 'lucide-react';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('instructions'); // 'instructions', 'quiz', 'completed'
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentStep === 'instructions' && quiz) {
      // Quiz data is already loaded from verification
      setLoading(false);
    } else if (currentStep === 'quiz') {
      loadQuizQuestions();
    }
  }, [currentStep, id]);

  const loadQuizQuestions = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizQuestions(id);
      setQuestions(response.questions || []);
      setQuiz(prev => ({ ...prev, ...response.quiz }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // This function will be called from QuizCard after passcode verification
  const initializeQuiz = (quizData) => {
    setQuiz(quizData);
    setCurrentStep('instructions');
    setLoading(false);
  };

  const handleStartQuiz = async () => {
    setCurrentStep('quiz');
  };

  const handleCancelQuiz = () => {
    navigate('/student/dashboard');
  };

  const handleSubmitQuiz = async (submissionData) => {
    try {
      // Here you would typically send the submission to your backend
      console.log('Quiz submitted:', submissionData);
      
      // For now, just show completion
      setCurrentStep('completed');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Quiz</h2>
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

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been recorded. You will be redirected to your dashboard shortly.
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

  if (currentStep === 'instructions' && quiz) {
    return (
      <QuizInstructions
        quiz={quiz}
        onStartQuiz={handleStartQuiz}
        onCancel={handleCancelQuiz}
      />
    );
  }

  if (currentStep === 'quiz' && quiz && questions.length > 0) {
    return (
      <QuizInterface
        quiz={quiz}
        questions={questions}
        onSubmitQuiz={handleSubmitQuiz}
      />
    );
  }

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
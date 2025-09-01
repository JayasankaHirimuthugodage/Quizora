import { useState } from 'react';
import QuizList from '../../components/lecturer/QuizList';
import QuizModal from '../../components/lecturer/QuizModal';

const QuizManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setShowModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setShowModal(false);
    setSelectedQuiz(null);
    // If refresh needed, the QuizList component will handle it via useEffect
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizList
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
        />

        {showModal && (
          <QuizModal
            quiz={selectedQuiz}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default QuizManagement;
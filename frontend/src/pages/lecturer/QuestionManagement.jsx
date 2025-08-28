import React, { useState } from "react";
import QuestionForm from "../../pages/lecturer/QuestionForm";
import QuestionBank from "../../components/QuestionBank";
import { ArrowLeft } from "lucide-react";

export default function QuestionManagement() {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleCreateNew = () => {
    setSelectedQuestion(null);
    setCurrentView("create");
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setSelectedQuestion(null);
    setCurrentView("list");
  };

  const handleQuestionCreated = () => {
    // Refresh the list after creating/updating
    setCurrentView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "list" && (
          <QuestionBank
            onCreateNew={handleCreateNew}
            onEditQuestion={handleEditQuestion}
          />
        )}

        {(currentView === "create" || currentView === "edit") && (
          <div className="space-y-6">
            {/* Back Navigation */}
            <div className="flex items-center">
              <button
                onClick={handleBackToList}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Question Bank
              </button>
            </div>

            {/* Form */}
            <QuestionForm
              question={selectedQuestion}
              onQuestionCreated={handleQuestionCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Edit, Trash2, Eye, Plus } from "lucide-react";
import { questionService } from "../services/questionService";

export default function QuestionBank({ module, onCreateNew, onEditQuestion }) {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    difficulty: "",
  });

  const questionTypes = [
    { value: "", label: "All Types" },
    { value: "MCQ", label: "Multiple Choice" },
    { value: "Structured", label: "Structured" },
    { value: "Essay", label: "Essay" },
  ];

  const difficultyLevels = [
    { value: "", label: "All Levels" },
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
  ];

  const fetchQuestions = useCallback(async () => {
    if (!module) return;
    
    try {
      setLoading(true);
      const response = await questionService.getQuestionsByModule(module._id, filters);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [module, filters]);

  const applyFilters = useCallback(() => {
    let filtered = [...questions];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.questionText.toLowerCase().includes(searchTerm) ||
          (q.tags && q.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Type and difficulty filters
    if (filters.type) {
      filtered = filtered.filter((q) => q.type === filters.type);
    }
    if (filters.difficulty) {
      filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
    }

    setFilteredQuestions(filtered);
  }, [questions, filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      difficulty: "",
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await questionService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
      alert("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      MCQ: "bg-blue-100 text-blue-800",
      Structured: "bg-green-100 text-green-800",
      Essay: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Hard: "bg-red-100 text-red-800",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
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
          <h2 className="text-xl font-bold text-gray-900">Questions</h2>
          <p className="text-sm text-gray-600">
            {questions.length} question{questions.length !== 1 ? 's' : ''} in this module
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <Filter size={18} className="mr-2 text-gray-500" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
          <span className="text-sm text-gray-500">
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions found
            </h3>
            <p className="text-gray-500 mb-4">
              {questions.length === 0
                ? "Create your first question for this module"
                : "Try adjusting your filters or search terms"}
            </p>
            {questions.length === 0 && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Question
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="space-y-1">
              {filteredQuestions.map((question) => (
                <div
                  key={question._id}
                  className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            question.type
                          )}`}
                        >
                          {question.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {question.questionText}
                      </h4>

                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {question.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{question.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Created{" "}
                        {new Date(question.createdAt).toLocaleDateString()}
                        {question.updatedAt !== question.createdAt && (
                          <span>
                            {" "}
                            • Updated{" "}
                            {new Date(question.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onEditQuestion(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Question"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
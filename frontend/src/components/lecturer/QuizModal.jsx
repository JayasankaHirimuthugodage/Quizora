import { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { moduleService } from '../../services/moduleService';
import { userService } from '../../services/userService';
import { X, AlertCircle, Save, Calendar, Clock, Users, Key } from 'lucide-react';

const QuizModal = ({ quiz, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    startDateTime: '',
    endDateTime: '',
    duration: 60,
    eligibilityCriteria: [],
    instructions: '',
    passcode: '',
    shuffleQuestions: false,
    showResultsImmediately: false,
    allowLateSubmission: false,
    maxAttempts: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [degreeOptions, setDegreeOptions] = useState([]);
  const [newCriteria, setNewCriteria] = useState({
    degreeTitle: '',
    year: 1,
    semester: 1
  });

  useEffect(() => {
    fetchModules();
    fetchDegreeOptions();
  }, []);

  useEffect(() => {
    if (quiz) {
      const start = new Date(quiz.startDateTime).toISOString().slice(0, 16);
      const end = new Date(quiz.endDateTime).toISOString().slice(0, 16);
      
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        moduleId: quiz.moduleId?._id || quiz.moduleId || '',
        startDateTime: start,
        endDateTime: end,
        duration: quiz.duration || 60,
        eligibilityCriteria: quiz.eligibilityCriteria || [],
        instructions: quiz.instructions || '',
        passcode: quiz.passcode || '',
        shuffleQuestions: quiz.shuffleQuestions || false,
        showResultsImmediately: quiz.showResultsImmediately || false,
        allowLateSubmission: quiz.allowLateSubmission || false,
        maxAttempts: quiz.maxAttempts || 1
      });
    } else {
      generatePasscode();
      setDefaultInstructions();
    }
  }, [quiz]);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getModules();
      setModules(response.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const fetchDegreeOptions = async () => {
    try {
      const response = await userService.getDegreeOptions();
      setDegreeOptions(response.degrees || []);
    } catch (err) {
      console.error('Error fetching degree options:', err);
    }
  };

  const generatePasscode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, passcode: code }));
  };

  const setDefaultInstructions = () => {
    const defaultInstructions = `Please read the following instructions carefully before starting the quiz:

1. Make sure you have a stable internet connection
2. Do not refresh or close the browser window during the quiz
3. Answer all questions to the best of your ability
4. You can navigate between questions using the navigation panel
5. Your answers will be saved automatically as you progress
6. Click "Submit Quiz" when you have completed all questions
7. The quiz will automatically submit when time runs out

Good luck!`;
    
    setFormData(prev => ({ ...prev, instructions: defaultInstructions }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleCriteriaChange = (field, value) => {
    setNewCriteria(prev => ({ ...prev, [field]: value }));
  };

  const addEligibilityCriteria = () => {
    if (!newCriteria.degreeTitle) {
      setError('Please select a degree title');
      return;
    }

    const exists = formData.eligibilityCriteria.some(criteria => 
      criteria.degreeTitle === newCriteria.degreeTitle &&
      criteria.year === newCriteria.year &&
      criteria.semester === newCriteria.semester
    );

    if (exists) {
      setError('This eligibility criteria already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: [...prev.eligibilityCriteria, { ...newCriteria }]
    }));

    setNewCriteria({ degreeTitle: '', year: 1, semester: 1 });
    setError('');
  };

  const removeEligibilityCriteria = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.filter((_, i) => i !== index)
    }));
  };

  const validateDates = () => {
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    const now = new Date();

    if (start < now) {
      throw new Error('Start date must be in the future');
    }

    if (end <= start) {
      throw new Error('End date must be after start date');
    }

    // Check if quiz duration fits within the scheduled time window
    const timeDifference = (end - start) / (1000 * 60); // in minutes
    if (formData.duration > timeDifference) {
      throw new Error('Quiz duration cannot exceed the scheduled time window');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.moduleId || !formData.startDateTime || 
          !formData.endDateTime || !formData.instructions || !formData.passcode) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.eligibilityCriteria.length === 0) {
        throw new Error('Please add at least one eligibility criteria');
      }

      // Validate dates
      validateDates();

      // Validate duration
      if (formData.duration < 5 || formData.duration > 300) {
        throw new Error('Duration must be between 5 and 300 minutes');
      }

      // Validate passcode
      if (formData.passcode.length < 4) {
        throw new Error('Passcode must be at least 4 characters long');
      }

      const submitData = {
        ...formData,
        duration: parseInt(formData.duration),
        maxAttempts: parseInt(formData.maxAttempts)
      };

      if (quiz) {
        await quizService.updateQuiz(quiz._id, submitData);
      } else {
        await quizService.createQuiz(submitData);
      }

      onClose(true);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDegreeTitle = (code) => {
    const degree = degreeOptions.find(d => d.code === code);
    return degree ? degree.title : code;
  };

  const handleStartDateChange = (value) => {
    setFormData(prev => {
      const start = new Date(value);
      const end = new Date(prev.endDateTime);
      
      // If end date is before or equal to new start date, adjust it
      if (end <= start) {
        const newEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
        return {
          ...prev,
          startDateTime: value,
          endDateTime: newEnd.toISOString().slice(0, 16)
        };
      }
      
      return { ...prev, startDateTime: value };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {quiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h3>
              <p className="text-sm text-gray-600">
                Set up your quiz schedule and student eligibility
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter quiz title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <select
                    value={formData.moduleId}
                    onChange={(e) => handleChange('moduleId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Module</option>
                    {modules.map((module) => (
                      <option key={module._id} value={module._id}>
                        {module.moduleCode} - {module.moduleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the quiz"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Schedule & Timing
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => handleChange('endDateTime', e.target.value)}
                    min={formData.startDateTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Between 5-300 minutes</p>
                </div>
              </div>
            </div>

            {/* Student Eligibility */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Student Eligibility
              </h4>

              {/* Add New Criteria */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Add eligibility criteria:</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={newCriteria.degreeTitle}
                    onChange={(e) => handleCriteriaChange('degreeTitle', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Degree</option>
                    {degreeOptions.map((degree) => (
                      <option key={degree.code} value={degree.code}>
                        {degree.code}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={newCriteria.year}
                    onChange={(e) => handleCriteriaChange('year', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                  
                  <select
                    value={newCriteria.semester}
                    onChange={(e) => handleCriteriaChange('semester', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={addEligibilityCriteria}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Current Criteria */}
              {formData.eligibilityCriteria.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Eligible students:</p>
                  <div className="space-y-2">
                    {formData.eligibilityCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <span className="text-sm">
                          <strong>{getDegreeTitle(criteria.degreeTitle)}</strong> - 
                          Year {criteria.year}, Semester {criteria.semester}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEligibilityCriteria(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions & Security */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Key className="w-5 h-5 mr-2 text-orange-600" />
                Instructions & Security
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Instructions *
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  placeholder="Enter instructions that students will see before starting the quiz..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">These instructions will be displayed to students before they start the quiz</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Passcode *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.passcode}
                      onChange={(e) => handleChange('passcode', e.target.value)}
                      placeholder="Enter passcode"
                      minLength="4"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={generatePasscode}
                      className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 4 characters required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <select
                    value={formData.maxAttempts}
                    onChange={(e) => handleChange('maxAttempts', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={4}>4 attempts</option>
                    <option value={5}>5 attempts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Quiz Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Shuffle Questions</span>
                    <p className="text-xs text-gray-500">Questions will appear in random order for each student</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.showResultsImmediately}
                    onChange={(e) => handleChange('showResultsImmediately', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Show Results Immediately</span>
                    <p className="text-xs text-gray-500">Students will see their results right after submission</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.allowLateSubmission}
                    onChange={(e) => handleChange('allowLateSubmission', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Allow Late Submission</span>
                    <p className="text-xs text-gray-500">Students can submit even after the end time</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onClose(false)}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {quiz ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {quiz ? 'Update Quiz' : 'Create Quiz'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
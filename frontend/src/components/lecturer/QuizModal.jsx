// frontend\src\components\lecturer\QuizModal.jsx

import { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { moduleService } from '../../services/moduleService';
import { userService } from '../../services/userService';
import { 
  X, AlertCircle, Save, Calendar, Clock, Users, Key, Settings,
  Zap, Shield, Globe, Target, Award, Brain, Cpu, Database,
  CheckCircle, XCircle, Info, Star, Sparkles, Layers,
  BarChart3, TrendingUp, Eye, EyeOff, Copy, RefreshCw,
  Lock, Unlock, Timer, PlayCircle, PauseCircle, StopCircle,
  ChevronDown, ChevronUp, Plus, Minus, ArrowRight, ArrowLeft
} from 'lucide-react';

const QuizModal = ({ quiz, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    maxAttempts: 1,
    difficulty: 'medium',
    category: 'assessment',
    tags: [],
    timeLimit: 'strict',
    securityLevel: 'standard'
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
  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info, description: 'Quiz fundamentals' },
    { id: 2, title: 'Schedule', icon: Calendar, description: 'Timing & dates' },
    { id: 3, title: 'Students', icon: Users, description: 'Eligibility criteria' },
    { id: 4, title: 'Settings', icon: Settings, description: 'Advanced configuration' },
    { id: 5, title: 'Review', icon: CheckCircle, description: 'Final review' }
  ];

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
        maxAttempts: quiz.maxAttempts || 1,
        difficulty: quiz.difficulty || 'medium',
        category: quiz.category || 'assessment',
        tags: quiz.tags || [],
        timeLimit: quiz.timeLimit || 'strict',
        securityLevel: quiz.securityLevel || 'standard'
      });
    } else {
      generatePasscode();
      setDefaultInstructions();
    }
  }, [quiz]);

  useEffect(() => {
    calculateEstimatedTime();
  }, [formData.duration, formData.eligibilityCriteria]);

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
    const defaultInstructions = `🎯 **Assessment Guidelines & Instructions**

**Pre-Assessment Checklist:**
✅ Ensure stable internet connection
✅ Close unnecessary browser tabs
✅ Prepare note-taking materials if permitted
✅ Review course materials one final time

**During the Assessment:**
- Navigate through questions using the control panel
- Flag questions for review using the bookmark feature
- Monitor your time allocation carefully
- Save answers automatically as you progress
- Use the help button for technical difficulties

**Technical Specifications:**
- Auto-save enabled every 30 seconds
- Browser refresh protection active
- Session timeout warnings at 5-minute intervals
- Emergency contact: support@quizora.edu

**Assessment Policies:**
- Academic integrity must be maintained
- Unauthorized materials are prohibited
- Communication with others is not permitted
- Screenshots or recordings are strictly forbidden

**Submission Process:**
- Review all answers before final submission
- Submit quiz using the designated button
- Confirmation receipt will be displayed
- Results available as per course policy

Good luck with your assessment! 🌟`;
    
    setFormData(prev => ({ ...prev, instructions: defaultInstructions }));
  };

  const calculateEstimatedTime = () => {
    const studentCount = formData.eligibilityCriteria.reduce((total, criteria) => total + 25, 0);
    const time = Math.ceil((formData.duration + 10) * studentCount / 60);
    setEstimatedTime(time);
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.title) errors.title = 'Quiz title is required';
        if (!formData.moduleId) errors.moduleId = 'Please select a module';
        if (formData.title && formData.title.length < 3) errors.title = 'Title must be at least 3 characters';
        break;
      case 2:
        if (!formData.startDateTime) errors.startDateTime = 'Start date is required';
        if (!formData.endDateTime) errors.endDateTime = 'End date is required';
        if (formData.duration < 5) errors.duration = 'Duration must be at least 5 minutes';
        if (formData.duration > 300) errors.duration = 'Duration cannot exceed 300 minutes';
        break;
      case 3:
        if (formData.eligibilityCriteria.length === 0) errors.eligibility = 'At least one eligibility criteria is required';
        break;
      case 4:
        if (!formData.instructions) errors.instructions = 'Instructions are required';
        if (!formData.passcode) errors.passcode = 'Passcode is required';
        if (formData.passcode && formData.passcode.length < 4) errors.passcode = 'Passcode must be at least 4 characters';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
    if (error) setError('');
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

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    setError('');

    try {
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

  const getStepIcon = (step, currentStep) => {
    const StepIcon = step.icon;
    if (step.id < currentStep) return <CheckCircle className="w-5 h-5" />;
    if (step.id === currentStep) return <StepIcon className="w-5 h-5" />;
    return <StepIcon className="w-5 h-5 opacity-50" />;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quiz Foundation</h3>
                  <p className="text-sm text-gray-600">Define the core elements of your assessment</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter compelling quiz title..."
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.title && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Database className="w-4 h-4 inline mr-1" />
                      Module *
                    </label>
                    <select
                      value={formData.moduleId}
                      onChange={(e) => handleChange('moduleId', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.moduleId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Module</option>
                      {modules.map((module) => (
                        <option key={module._id} value={module._id}>
                          {module.moduleCode} - {module.moduleName}
                        </option>
                      ))}
                    </select>
                    {validationErrors.moduleId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {validationErrors.moduleId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleChange('difficulty', level)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.difficulty === level
                              ? level === 'easy' ? 'bg-green-500 text-white' :
                                level === 'medium' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="assessment">Assessment</option>
                      <option value="practice">Practice</option>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final Exam</option>
                      <option value="quiz">Quick Quiz</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide detailed description of the quiz objectives and scope..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Schedule Configuration</h3>
                  <p className="text-sm text-gray-600">Set precise timing and availability windows</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <PlayCircle className="w-4 h-4 inline mr-1" />
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDateTime}
                      onChange={(e) => handleChange('startDateTime', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.startDateTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.startDateTime && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.startDateTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <StopCircle className="w-4 h-4 inline mr-1" />
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDateTime}
                      onChange={(e) => handleChange('endDateTime', e.target.value)}
                      min={formData.startDateTime}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.endDateTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.endDateTime && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.endDateTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Timer className="w-4 h-4 inline mr-1" />
                      Duration (minutes) *
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="5"
                        max="300"
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5 min</span>
                        <span className="text-lg font-bold text-green-600">{formData.duration} min</span>
                        <span>300 min</span>
                      </div>
                    </div>
                    {validationErrors.duration && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.duration}</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Schedule Analytics
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Estimated completion time</span>
                      <span className="font-bold text-blue-600">{estimatedTime} hours</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Time buffer</span>
                      <span className="font-bold text-green-600">15 minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Optimal window</span>
                      <span className="font-bold text-purple-600">
                        {Math.ceil(formData.duration * 1.5)} minutes
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h5 className="font-medium text-yellow-800">Scheduling Recommendation</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          Consider peak student activity times: 10 AM - 12 PM and 2 PM - 4 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Student Eligibility Matrix</h3>
                  <p className="text-sm text-gray-600">Define precise access criteria for targeted assessment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Eligibility Criteria</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Degree Program</label>
                        <select
                          value={newCriteria.degreeTitle}
                          onChange={(e) => setNewCriteria(prev => ({ ...prev, degreeTitle: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Degree</option>
                          {degreeOptions.map((degree) => (
                            <option key={degree.code} value={degree.code}>
                              {degree.code} - {degree.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
                          <select
                            value={newCriteria.year}
                            onChange={(e) => setNewCriteria(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value={1}>Year 1</option>
                            <option value={2}>Year 2</option>
                            <option value={3}>Year 3</option>
                            <option value={4}>Year 4</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                          <select
                            value={newCriteria.semester}
                            onChange={(e) => setNewCriteria(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                          </select>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addEligibilityCriteria}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Criteria
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Eligible Student Groups</h4>
                  
                  {formData.eligibilityCriteria.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No eligibility criteria added yet</p>
                      <p className="text-sm text-gray-400">Add criteria to see eligible students</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.eligibilityCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-600 font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {getDegreeTitle(criteria.degreeTitle)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Year {criteria.year} • Semester {criteria.semester}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEligibilityCriteria(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {validationErrors.eligibility && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.eligibility}
                    </p>
                  )}

                  {formData.eligibilityCriteria.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <h5 className="font-medium text-green-800">Eligibility Summary</h5>
                          <p className="text-sm text-green-700">
                            {formData.eligibilityCriteria.length} student group(s) will have access to this quiz
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Advanced Configuration</h3>
                    <p className="text-sm text-gray-600">Fine-tune quiz behavior and security settings</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Key className="w-5 h-5 mr-2 text-blue-500" />
                      Security & Access
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Passcode *</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={formData.passcode}
                            onChange={(e) => handleChange('passcode', e.target.value)}
                            placeholder="Enter secure passcode"
                            className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              validationErrors.passcode ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={generatePasscode}
                            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(formData.passcode)}
                            className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {validationErrors.passcode && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.passcode}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Security Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'basic', label: 'Basic', color: 'green' },
                            { value: 'standard', label: 'Standard', color: 'blue' },
                            { value: 'strict', label: 'Strict', color: 'red' }
                          ].map((level) => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => handleChange('securityLevel', level.value)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                formData.securityLevel === level.value
                                  ? `bg-${level.color}-500 text-white`
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Attempts</label>
                        <select
                          value={formData.maxAttempts}
                          onChange={(e) => handleChange('maxAttempts', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num} attempt{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Quiz Behavior
                    </h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shuffleQuestions}
                          onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                          className="mt-1 w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-semibold text-gray-700">Shuffle Questions</span>
                          <p className="text-xs text-gray-500">Randomize question order for each student</p>
                        </div>
                      </label>

                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showResultsImmediately}
                          onChange={(e) => handleChange('showResultsImmediately', e.target.checked)}
                          className="mt-1 w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-semibold text-gray-700">Immediate Results</span>
                          <p className="text-xs text-gray-500">Show results immediately after submission</p>
                        </div>
                      </label>

                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowLateSubmission}
                          onChange={(e) => handleChange('allowLateSubmission', e.target.checked)}
                          className="mt-1 w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-semibold text-gray-700">Allow Late Submission</span>
                          <p className="text-xs text-gray-500">Accept submissions after end time</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-purple-500" />
                      Instructions & Guidelines
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Student Instructions *
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Enter comprehensive instructions for students..."
                        rows={12}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm ${
                          validationErrors.instructions ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.instructions && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.instructions}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {formData.instructions.length} characters
                        </p>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          {previewMode ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                          {previewMode ? 'Edit' : 'Preview'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {showAdvanced && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Cpu className="w-5 h-5 mr-2 text-indigo-500" />
                        Advanced Settings
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit Enforcement</label>
                          <select
                            value={formData.timeLimit}
                            onChange={(e) => handleChange('timeLimit', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="strict">Strict - Auto-submit at time limit</option>
                            <option value="warning">Warning - Show warnings near limit</option>
                            <option value="flexible">Flexible - Allow grace period</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Tags</label>
                          <input
                            type="text"
                            placeholder="e.g., algorithms, data-structures, beginner"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Final Review & Deployment</h3>
                  <p className="text-sm text-gray-600">Verify all settings before publishing your quiz</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      Quiz Overview
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Title:</span>
                        <span className="text-sm font-medium text-gray-900">{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Module:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {modules.find(m => m._id === formData.moduleId)?.moduleCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">{formData.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Difficulty:</span>
                        <span className={`text-sm font-medium ${
                          formData.difficulty === 'easy' ? 'text-green-600' :
                          formData.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Security Level:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formData.securityLevel.charAt(0).toUpperCase() + formData.securityLevel.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                      Schedule Summary
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Start:</span>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(formData.startDateTime).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">End:</span>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(formData.endDateTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-indigo-500" />
                      Eligible Students
                    </h4>
                    
                    {formData.eligibilityCriteria.length === 0 ? (
                      <p className="text-sm text-gray-500">No eligibility criteria defined</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.eligibilityCriteria.map((criteria, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {getDegreeTitle(criteria.degreeTitle)} - Year {criteria.year}, Sem {criteria.semester}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-500" />
                      Security Settings
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Key className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Passcode: {formData.passcode}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Max Attempts: {formData.maxAttempts}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {formData.shuffleQuestions ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span>Question Shuffling</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center">
                      <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h5 className="font-semibold text-blue-900">Deployment Ready</h5>
                        <p className="text-sm text-blue-700">
                          Quiz configuration validated and ready for student access
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-h-[95vh] overflow-y-auto">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-10 px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold">
                    {quiz ? 'Modify Assessment' : 'Create New Quiz'}
                  </h3>
                  <p className="text-blue-100">
                    Set up your quiz schedule and student eligibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => onClose(false)}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                      <button
                        onClick={() => setCurrentStep(step.id)}
                        className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                          step.id === currentStep
                            ? 'bg-white text-blue-600 shadow-lg scale-110'
                            : step.id < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-white bg-opacity-20 text-blue-200 hover:bg-opacity-30'
                        }`}
                      >
                        {getStepIcon(step, currentStep)}
                      </button>
                      <div className="ml-3 text-white">
                        <div className="text-sm font-semibold">{step.title}</div>
                        <div className="text-xs text-blue-200">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                        step.id < currentStep ? 'bg-green-400' : 'bg-white bg-opacity-20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Configuration Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="p-8">
            {renderStepContent()}
          </div>

          {/* Enhanced Footer */}
          <div className="sticky bottom-0 px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Step {currentStep} of {steps.length}
              </div>
              {currentStep === 5 && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready to deploy
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg"
                >
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all shadow-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      {quiz ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {quiz ? 'Update Quiz' : 'Create Quiz'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
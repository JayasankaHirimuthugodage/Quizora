import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, UserCheck, GraduationCap, Briefcase } from 'lucide-react';

const AddUserModal = ({ 
  isOpen, 
  onClose, 
  onAddUser,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    // Student fields
    studentId: '',
    enrollmentYear: new Date().getFullYear(),
    course: '',
    // Teacher fields
    employeeId: '',
    department: '',
    subjects: '',
    // Optional fields
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
      if (!formData.course.trim()) {
        newErrors.course = 'Course is required';
      }
      if (!formData.enrollmentYear || formData.enrollmentYear < 2000) {
        newErrors.enrollmentYear = 'Valid enrollment year is required';
      }
    }

    if (formData.role === 'teacher') {
      if (!formData.employeeId.trim()) {
        newErrors.employeeId = 'Employee ID is required';
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
      }
      if (!formData.subjects.trim()) {
        newErrors.subjects = 'At least one subject is required';
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep1();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const allErrors = { ...step1Errors, ...step2Errors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      address: formData.address.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined
    };

    // Add role-specific fields
    if (formData.role === 'student') {
      submitData.studentId = formData.studentId.trim();
      submitData.enrollmentYear = parseInt(formData.enrollmentYear);
      submitData.course = formData.course.trim();
    } else if (formData.role === 'teacher') {
      submitData.employeeId = formData.employeeId.trim();
      submitData.department = formData.department.trim();
      submitData.subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s);
    }

    await onAddUser(submitData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      studentId: '',
      enrollmentYear: new Date().getFullYear(),
      course: '',
      employeeId: '',
      department: '',
      subjects: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: ''
    });
    setErrors({});
    setStep(1);
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New User - Step {step} of 2
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className="mx-2"></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-1" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md pr-10 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck size={16} className="inline mr-1" />
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher/Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Role-specific Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-4">
                {formData.role === 'student' ? 'Student Details' : 
                 formData.role === 'teacher' ? 'Teacher Details' : 'Additional Information'}
              </h4>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.studentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., ST2024001"
                    />
                    {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap size={16} className="inline mr-1" />
                      Course *
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.course ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Computer Science"
                    />
                    {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Year *
                    </label>
                    <input
                      type="number"
                      name="enrollmentYear"
                      value={formData.enrollmentYear}
                      onChange={handleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 4}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.enrollmentYear ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.enrollmentYear && <p className="text-red-500 text-sm mt-1">{errors.enrollmentYear}</p>}
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.employeeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., EMP001"
                    />
                    {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase size={16} className="inline mr-1" />
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Computer Science"
                    />
                    {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects *
                    </label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.subjects ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Mathematics, Physics (comma-separated)"
                    />
                    {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
                    <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
                  </div>
                </>
              )}

              {/* Optional fields for all roles */}
              <div className="border-t pt-4 mt-6">
                <h5 className="font-medium text-gray-900 mb-3">Optional Information</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., +1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

// frontend\src\pages\lecturer\LecturerDashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { quizService } from "../../services/quizService";

const LecturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quizData, setQuizData] = useState({
    activeQuizzes: [],
    scheduledQuizzes: [],
    stats: null,
    loading: true,
    error: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchQuizData();
    
    // Refresh quiz data every 30 seconds
    const dataRefreshInterval = setInterval(fetchQuizData, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  const fetchQuizData = async () => {
    try {
      setQuizData(prev => ({ ...prev, loading: true, error: '' }));
      
      // Fetch quizzes and stats
      const [quizzesResponse, statsResponse] = await Promise.all([
        quizService.getQuizzes(),
        quizService.getQuizStats()
      ]);

      const allQuizzes = quizzesResponse.quizzes || [];
      const now = new Date();

      // Categorize quizzes
      const activeQuizzes = allQuizzes.filter(quiz => {
        const start = new Date(quiz.startDateTime);
        const end = new Date(quiz.endDateTime);
        return now >= start && now <= end && quiz.status !== 'cancelled';
      });

      const scheduledQuizzes = allQuizzes.filter(quiz => {
        const start = new Date(quiz.startDateTime);
        return now < start && quiz.status !== 'cancelled';
      }).slice(0, 5); // Show only next 5 scheduled

      setQuizData({
        activeQuizzes,
        scheduledQuizzes,
        stats: statsResponse.stats,
        loading: false,
        error: ''
      });
    } catch (err) {
      setQuizData(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load quiz data'
      }));
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilStart = (startDateTime) => {
    const now = new Date();
    const start = new Date(startDateTime);
    const diffMs = start - now;
    
    if (diffMs <= 0) return 'Starting now';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  };

  const getTimeRemaining = (endDateTime) => {
    const now = new Date();
    const end = new Date(endDateTime);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Ended';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, Prof. {user?.firstName}!
              </h1>
              <p className="text-indigo-100 text-lg">
                Ready to inspire minds today?
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-2xl font-mono font-bold">
                {formatTime(currentTime)}
              </div>
              <div className="text-indigo-200 text-sm">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {quizData.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Unable to load quiz data</h3>
              <p className="text-sm text-red-700 mt-1">{quizData.error}</p>
              <button 
                onClick={fetchQuizData}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate("/lecturer/questions")}
          className="group bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Manage</p>
              <p className="text-lg font-semibold text-gray-900">
                Question Bank
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/lecturer/quizzes")}
          className="group bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-300 transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Schedule</p>
              <p className="text-lg font-semibold text-gray-900">Quizzes</p>
            </div>
          </div>
        </button>

        <button className="group bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">View</p>
              <p className="text-lg font-semibold text-gray-900">Students</p>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizData.loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 animate-pulse">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : quizData.stats ? (
          <>
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{quizData.stats.totalQuizzes}</p>
                    <p className="text-xs text-gray-400">All time</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <div className="relative">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {quizData.activeQuizzes.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Active Quizzes
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{quizData.activeQuizzes.length}</p>
                    <p className="text-xs text-gray-400">Running now</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">{quizData.stats.scheduled}</p>
                    <p className="text-xs text-gray-400">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{quizData.stats.completed}</p>
                    <p className="text-xs text-gray-400">Finished</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Active & Scheduled Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Quizzes */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Active Quizzes
              </h3>
              {quizData.activeQuizzes.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {quizData.activeQuizzes.length} LIVE
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {quizData.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : quizData.activeQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-2">No active quizzes</p>
                <p className="text-xs text-gray-400">Quizzes will appear here when they start</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizData.activeQuizzes.map((quiz) => (
                  <div key={quiz._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{quiz.moduleCode}</p>
                        <div className="flex items-center text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          {getTimeRemaining(quiz.endDateTime)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Ends</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(quiz.endDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {quizData.activeQuizzes.length > 0 && (
                  <button
                    onClick={() => navigate("/lecturer/quizzes")}
                    className="w-full text-center py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Manage Active Quizzes →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Quizzes */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming Quizzes
              </h3>
              {quizData.scheduledQuizzes.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Next {quizData.scheduledQuizzes.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {quizData.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : quizData.scheduledQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-2">No upcoming quizzes</p>
                <p className="text-xs text-gray-400">
                  Schedule quizzes to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizData.scheduledQuizzes.map((quiz) => (
                  <div key={quiz._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{quiz.moduleCode}</p>
                        <div className="flex items-center text-xs text-blue-600">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeUntilStart(quiz.startDateTime)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Starts</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(quiz.startDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {quizData.scheduledQuizzes.length > 0 && (
                  <button
                    onClick={() => navigate("/lecturer/quizzes")}
                    className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Scheduled Quizzes →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quiz Management Dashboard
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor your quiz activities and manage assessments effectively. Stay updated with real-time quiz status and upcoming schedules.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <span className="text-gray-700">
                    Create questions and organize them by modules
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <span className="text-gray-700">
                    Schedule quizzes with time constraints and student criteria
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <span className="text-gray-700">
                    Monitor active quizzes and manage them in real-time
                  </span>
                </div>
              </div>
              
              {(quizData.activeQuizzes.length > 0 || quizData.scheduledQuizzes.length > 0) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <strong>Quick Summary:</strong> 
                      {quizData.activeQuizzes.length > 0 && (
                        <span className="text-green-600 font-medium ml-1">
                          {quizData.activeQuizzes.length} active
                        </span>
                      )}
                      {quizData.activeQuizzes.length > 0 && quizData.scheduledQuizzes.length > 0 && ', '}
                      {quizData.scheduledQuizzes.length > 0 && (
                        <span className="text-blue-600 font-medium ml-1">
                          {quizData.scheduledQuizzes.length} upcoming
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/lecturer/quizzes")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Manage All →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Quizora</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Interactive Learning Platform
            </h2>
            <p className="text-xl text-blue-100 max-w-md">
              Empowering education through engaging quizzes and collaborative learning experiences.
            </p>
          </div>
          
          {/* Features */}
          <div className="mt-16 space-y-6 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-blue-100">Create engaging quizzes with best practices</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-blue-100">Track learning progress effectively</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <p className="text-blue-100">Secure role-based access control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Quizora</span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="mt-8">
            {children}
          </div>

          {/* Back to home link */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

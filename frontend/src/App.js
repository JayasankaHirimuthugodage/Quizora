import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import QuestionManagement from './pages/lecturer/QuestionManagement';
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Lecturer Routes */}
            <Route 
              path="/lecturer/*" 
              element={
                <ProtectedRoute requiredRoles={['lecturer']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<LecturerDashboard />} />
                      <Route path="questions" element={<QuestionManagement />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute requiredRoles={['student']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import UserList from './pages/UserList'
import Login from './pages/Login'
import ExamList from './pages/ExamList'
import ExamDetail from './pages/ExamDetail'
import Profile from './pages/Profile'
import Attendance from './pages/Attendance'
import AttendanceDetail from './pages/AttendanceDetail'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import { getAuthToken, isAuthenticated } from './services/authService'
import { AuthProvider } from './context/AuthContext'

// Wrapper component to use hooks with router
const AppContent = () => {
  const navigate = useNavigate();

  // Check token expiration when app loads
  useEffect(() => {
    // Simple check to detect potentially expired tokens
    // In a more sophisticated implementation, we would check the token's expiration time
    const checkAuthentication = async () => {
      const token = getAuthToken();
      if (token && !isAuthenticated()) {
        // Token exists but is invalid, redirect to login
        console.log('Invalid token detected, redirecting to login');
        navigate('/login');
      }
    };

    checkAuthentication();
  }, [navigate]);

  return (
    <Routes>
      {/* Các route công khai - không cần đăng nhập */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Các route được bảo vệ - cần đăng nhập */}      <Route element={<PrivateRoute />}>
        <Route path='/home' element={<Home />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exam-detail/:examId" element={<ExamDetail />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/exam/:examId" element={<AttendanceDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Các route không hợp lệ sẽ được chuyển hướng về login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
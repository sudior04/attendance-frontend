import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ExamList from './pages/ExamList'
import Profile from './pages/Profile'
import Attendance from './pages/Attendance'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Các route công khai - không cần đăng nhập */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Các route được bảo vệ - cần đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Các route không hợp lệ sẽ được chuyển hướng về login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
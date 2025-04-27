import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

const PrivateRoute = () => {
    // Kiểm tra đã đăng nhập chưa
    const auth = isAuthenticated();

    // Nếu chưa đăng nhập, chuyển hướng về trang login
    // Nếu đã đăng nhập, hiển thị các component con bên trong Route
    return auth ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
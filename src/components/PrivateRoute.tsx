import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated, getUserFromStorage, setupTokenValidation, clearTokenValidation } from '../services/authService';

const PrivateRoute = () => {
    // Set up token validation when a protected route is accessed
    useEffect(() => {
        // Check token validity every minute
        const intervalId = setupTokenValidation(60000);

        // Clean up when component unmounts
        return () => {
            clearTokenValidation(intervalId);
        };
    }, []);

    // Kiểm tra đã đăng nhập chưa
    const auth = isAuthenticated();

    // Nếu chưa đăng nhập, chuyển hướng về trang login
    if (!auth) {
        return <Navigate to="/login" />;
    }

    // Kiểm tra người dùng có phải ADMIN không
    const user = getUserFromStorage();
    if (!user || user.role !== 'ADMIN') {
        // Nếu không phải ADMIN, chuyển hướng về login
        localStorage.clear(); // Xóa thông tin người dùng
        return <Navigate to="/login" />;
    }

    // Người dùng là ADMIN và đã xác thực, cho phép truy cập
    return <Outlet />;
};

export default PrivateRoute;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, LoginRequest, isAuthenticated } from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Nếu người dùng đã đăng nhập, chuyển hướng tới trang Home
        if (isAuthenticated()) {
            navigate('/home');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials: LoginRequest = { email, password };

        try {
            await login(credentials);
            navigate('/home'); // Chuyển hướng đến trang Home
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen">
            {/* Bên trái - Banner */}
            <div className="flex-1 bg-blue-600 text-white flex flex-col justify-center items-center">
                <h1 className="text-3xl font-bold mb-2">
                    HỆ THỐNG QUẢN LÝ ĐIỂM DANH
                </h1>
                <p className="text-lg">Đăng nhập để tiếp tục</p>
            </div>

            {/* Bên phải - Form đăng nhập */}
            <div className="flex-1 p-10 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Email:</label>
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="p-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Mật khẩu:</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu của bạn"
                            className="p-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" /> Ghi nhớ đăng nhập
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-800">Quên mật khẩu?</a>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 rounded font-semibold mt-4 hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <div className="mt-6 text-sm">
                    <p>Chưa có tài khoản? <a href="#" className="text-blue-600 hover:text-blue-800">Đăng ký ngay</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;

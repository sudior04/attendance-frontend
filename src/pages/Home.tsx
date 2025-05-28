import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUserFromStorage } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [user, setUser] = useState<any>(null);
    const [activeTip, setActiveTip] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const tips = [
        {
            title: "Nhận diện khuôn mặt",
            content: "Để cải thiện độ chính xác khi điểm danh, hãy đảm bảo sinh viên đứng thẳng và nhìn trực tiếp vào camera trong ánh sáng tốt.",
            color: "blue"
        },
        {
            title: "Quản lý kỳ thi hiệu quả",
            content: "Sử dụng tính năng nhập danh sách từ Excel để tiết kiệm thời gian khi cần thêm nhiều sinh viên vào một kỳ thi.",
            color: "green"
        },
        {
            title: "Bảo mật tài khoản",
            content: "Đừng quên đổi mật khẩu định kỳ và đăng xuất khi không sử dụng hệ thống trên thiết bị công cộng.",
            color: "purple"
        },
        {
            title: "Theo dõi thống kê",
            content: "Sử dụng các biểu đồ và báo cáo để theo dõi tỉ lệ điểm danh và nhanh chóng phát hiện các vấn đề.",
            color: "yellow"
        }
    ]; useEffect(() => {
        const currentUser = getUserFromStorage();
        setUser(currentUser);

        // Auto-rotate tips every 5 seconds
        const interval = setInterval(() => {
            setActiveTip((prev) => (prev + 1) % tips.length);
        }, 5000);

        // Fetch mock statistics data
        setLoading(true);

        return () => clearInterval(interval);
    }, [tips.length]); return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-8 mb-6 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-4 max-w-2xl">
                            Chào mừng <span className="text-yellow-300">{user?.name || 'bạn'}</span> đến với hệ thống EXAM+
                        </h1>
                        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                            Quản lý thi cử và điểm danh thông minh với công nghệ nhận diện khuôn mặt tiên tiến
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/exams')}
                                className="bg-white text-blue-700 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                Quản lý kỳ thi
                            </button>
                            <button
                                onClick={() => navigate('/attendance')}
                                className="bg-transparent border border-white text-white px-6 py-2 rounded-md hover:bg-white hover:text-blue-700 transition-colors font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Điểm danh
                            </button>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-blue-500">
                            <div className="text-blue-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý người dùng</h3>
                            <p className="text-gray-600 mb-4">Quản lý thông tin sinh viên, giảng viên và quản trị viên trong hệ thống một cách hiệu quả</p>
                            <button
                                onClick={() => navigate('/users')}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                                Xem chi tiết
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-green-500">
                            <div className="text-green-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý kỳ thi</h3>
                            <p className="text-gray-600 mb-4">Tạo và quản lý các kỳ thi, lịch thi và phòng thi một cách dễ dàng và linh hoạt</p>
                            <button
                                onClick={() => navigate('/exams')}
                                className="text-green-600 hover:text-green-800 font-medium flex items-center">
                                Xem chi tiết
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-purple-500">
                            <div className="text-purple-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Điểm danh thông minh</h3>
                            <p className="text-gray-600 mb-4">Hệ thống điểm danh tự động bằng công nghệ nhận diện khuôn mặt tiên tiến</p>
                            <button
                                onClick={() => navigate('/attendance')}
                                className="text-purple-600 hover:text-purple-800 font-medium flex items-center">
                                Xem chi tiết
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Tips Carousel */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Mẹo sử dụng hệ thống
                        </h2>
                        <div className="relative">
                            <div className="relative overflow-hidden" style={{ height: "150px" }}>
                                {tips.map((tip, index) => (
                                    <div
                                        key={index}
                                        className={`absolute w-full transition-all duration-500 ${index === activeTip
                                            ? "opacity-100 translate-x-0"
                                            : index < activeTip
                                                ? "opacity-0 -translate-x-full"
                                                : "opacity-0 translate-x-full"
                                            }`}
                                    >
                                        <div className={`bg-${tip.color}-50 p-4 rounded-lg border border-${tip.color}-100 h-full`}>
                                            <h3 className={`text-md font-semibold text-${tip.color}-700 mb-2`}>{tip.title}</h3>
                                            <p className="text-gray-600">{tip.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                {tips.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTip(index)}
                                        className={`h-2 w-2 rounded-full transition-all ${activeTip === index ? "bg-blue-500 w-4" : "bg-gray-300"}`}
                                        aria-label={`Mẹo ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Home;

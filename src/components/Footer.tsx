import { useState, useEffect } from 'react';
import { getUserFromStorage } from '../services/authService';

const Footer = () => {
    const [user, setUser] = useState<any>(null);
    const [showDevelopmentInfo, setShowDevelopmentInfo] = useState(false);

    useEffect(() => {
        const currentUser = getUserFromStorage();
        setUser(currentUser);
    }, []);

    return (
        <footer className="bg-gray-800 text-white py-4 w-full">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <p className="text-sm">
                            © {new Date().getFullYear()} EXAM+ System. All rights reserved.
                        </p>
                        <p className="text-sm">
                            Đã đăng nhập với tài khoản: <span className="font-bold">{user?.email || 'Chưa đăng nhập'}</span>
                        </p>
                    </div>
                    <div className="text-center md:text-right">
                        <button
                            onClick={() => setShowDevelopmentInfo(!showDevelopmentInfo)}
                            className="text-blue-300 hover:text-blue-100 text-sm"
                        >
                            {showDevelopmentInfo ? 'Ẩn thông tin phát triển' : 'Hiển thị thông tin phát triển'}
                        </button>
                    </div>
                </div>

                {showDevelopmentInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-300">TC Development Team</h3>
                                <p className="text-gray-300">Phát triển bởi đội ngũ sinh viên đam mê công nghệ</p>
                            </div>
                            <div className="text-gray-300">
                                <p className="mb-1"><strong>Email:</strong> nhchien2004@gmail.com</p>
                                <p className="mb-1"><strong>Điện thoại:</strong> 0327505682</p>
                                <p><strong>Địa chỉ:</strong> Tòa nhà B1, Trường CNTT&TT, ĐH Bách khoa HN</p>
                            </div>
                            <div className="col-span-1 md:col-span-2 mt-2">
                                <h3 className="text-md font-semibold text-blue-300 mb-1">Giới thiệu về dự án</h3>
                                <p className="text-gray-300">
                                    EXAM+ được phát triển như một giải pháp toàn diện nhằm đơn giản hóa quy trình quản lý thi cử và điểm danh trong
                                    các trường đại học và cơ sở giáo dục. Hệ thống tích hợp công nghệ nhận diện khuôn mặt, giúp quá trình điểm danh
                                    trở nên tự động và chính xác hơn.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserFromStorage, logout } from '../services/authService';

const Header = () => {
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user info from storage using our helper function
        setUser(getUserFromStorage());
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    const handleViewProfile = () => {
        // Navigate to profile page
        navigate('/profile');
        closeDropdown();
    };

    const handleLogout = () => {
        // Use our improved logout function
        logout();
        // Redirect to login page
        navigate('/login');
    };

    // Get first letter of user name for avatar
    const getNameInitial = () => {
        if (!user || !user.name) return '?';
        return user.name.charAt(0).toUpperCase();
    };

    return (
        <header className="bg-blue-600 text-white py-4 mb-6 w-full">
            <div className="w-full px-4 md:px-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    <Link to="/home" className="text-white text-2xl">
                        EXAM+
                    </Link>
                </h1>
                <div className="flex gap-4 items-center">
                    <Link
                        to="/users"
                        className='bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors'
                    >
                        Quản lý người dùng
                    </Link>
                    <Link
                        to="/exams"
                        className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                    >
                        Quản lý kỳ thi
                    </Link>
                    <Link
                        to="/attendance"
                        className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                    >
                        Quản lý điểm danh
                    </Link>

                    {/* User Profile Button */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                                aria-expanded={dropdownOpen}
                                aria-haspopup="true"
                            >
                                {getNameInitial()}
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-gray-500 text-xs truncate">{user.email}</div>
                                        </div>
                                        <button
                                            onClick={handleViewProfile}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Hồ sơ cá nhân
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
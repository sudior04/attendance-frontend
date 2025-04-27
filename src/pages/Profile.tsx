import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, isAuthenticated, getUserFromStorage } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    password?: string; // Không hiển thị trên UI nhưng có thể cần cho API
    birth?: string; // LocalDate sẽ được chuyển thành string trong JSON
    citizenId?: string; // CCCD
    role: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}

const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        // Tạm thời hiển thị dữ liệu từ localStorage trong khi chờ API load
        const storedUser = getUserFromStorage();
        if (storedUser) {
            const initialUserData = {
                id: storedUser.id,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role
            } as UserProfile;

            setUser(initialUserData);
            setEditedUser(initialUserData);
        }

        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            console.log('Đang gọi API lấy thông tin người dùng...');

            // Đường dẫn API đúng theo yêu cầu của bạn
            const data = await apiRequest<UserProfile>('/user/profile');
            console.log('Dữ liệu nhận được từ API:', data);

            setUser(data);
            setEditedUser(data);
            setError('');
        } catch (err: any) {
            console.error('Chi tiết lỗi khi gọi API profile:', err);
            // Hiển thị thông báo lỗi thân thiện với người dùng
            setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');

            // Tạm thời sử dụng dữ liệu từ localStorage nếu có
            if (!user) {
                const storedUser = getUserFromStorage();
                if (storedUser) {
                    setUser({
                        id: storedUser.id,
                        name: storedUser.name,
                        email: storedUser.email,
                        role: storedUser.role,
                    } as UserProfile);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedUser(user); // Reset to original values
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editedUser) return;

        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        if (!editedUser || !user?.id) return;

        try {
            setLoading(true);
            setError('');
            console.log('Đang gửi yêu cầu cập nhật hồ sơ...');

            // Chuẩn bị dữ liệu phù hợp với UpdateUserDTO
            const updateUserDTO = {
                name: editedUser.name,
                // Email không thay đổi (đã disabled trên UI)
                birth: editedUser.birth,
                citizenId: editedUser.citizenId,
                phoneNumber: editedUser.phoneNumber,
                address: editedUser.address
            };

            console.log('Dữ liệu gửi đi:', updateUserDTO);

            // Gọi API với userId trong URL
            const updatedData = await apiRequest<UserProfile>(`/user/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(updateUserDTO)
            });

            console.log('Dữ liệu sau khi cập nhật:', updatedData);
            setUser(updatedData);
            setEditedUser(updatedData);
            setIsEditing(false);

            // Cập nhật thông tin người dùng trong localStorage nếu tên thay đổi
            if (updatedData.name !== user.name) {
                const currentUserInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                localStorage.setItem('user_info', JSON.stringify({
                    ...currentUserInfo,
                    name: updatedData.name
                }));
            }

        } catch (err: any) {
            console.error('Chi tiết lỗi khi cập nhật hồ sơ:', err);
            // Kiểm tra thông báo lỗi cụ thể từ API để hiển thị thông báo phù hợp
            if (err.message && (
                err.message.includes('Email đã được sử dụng') ||
                err.message.includes('không có quyền')
            )) {
                setError(err.message);
            } else {
                setError('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center text-red-600">
                    <p>Có lỗi xảy ra: {error}</p>
                    <button
                        onClick={fetchUserProfile}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 bg-blue-600 text-white relative">
                                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                                <p className="opacity-90">Xem và quản lý thông tin cá nhân của bạn</p>

                                {!isEditing && (
                                    <button
                                        onClick={handleEdit}
                                        className="absolute top-6 right-6 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Avatar section */}
                                    <div className="text-center md:text-left">
                                        <div className="h-32 w-32 mx-auto md:mx-0 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-600">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>

                                        <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
                                        <p className="text-gray-600">{user?.email}</p>
                                        <div className="mt-2">
                                            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User details section */}
                                    <div>
                                        {isEditing ? (
                                            <>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Họ và tên
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editedUser?.name || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editedUser?.email || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                        disabled
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Số điện thoại
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        value={editedUser?.phoneNumber || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Ngày sinh
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="birth"
                                                        value={editedUser?.birth || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        CCCD
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="citizenId"
                                                        value={editedUser?.citizenId || ''}
                                                        onChange={handleChange}
                                                        pattern="\d{12}"
                                                        title="CCCD phải gồm đúng 12 chữ số"
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">CCCD phải gồm đúng 12 chữ số</p>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Địa chỉ
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={editedUser?.address || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="flex gap-3 mt-6">
                                                    <button
                                                        onClick={handleSave}
                                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Họ và tên</h3>
                                                    <p className="mt-1 text-gray-900">{user?.name || '—'}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                                    <p className="mt-1 text-gray-900">{user?.email || '—'}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                                                    <p className="mt-1 text-gray-900">{user?.phoneNumber || '—'}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Ngày sinh</h3>
                                                    <p className="mt-1 text-gray-900">
                                                        {user?.birth ? new Date(user.birth).toLocaleDateString('vi-VN') : '—'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">CCCD</h3>
                                                    <p className="mt-1 text-gray-900">{user?.citizenId || '—'}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                                                    <p className="mt-1 text-gray-900">{user?.address || '—'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
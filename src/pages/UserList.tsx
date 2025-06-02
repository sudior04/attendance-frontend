import React, { useEffect, useState } from 'react';
import { getAllUsers, User } from '../services/userService';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                setUsers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search query and role filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === '' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Quản lý người dùng</h1>
                        <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc email..."
                                className="w-full p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-4">
                            <div className="flex items-center">
                                <span className="mr-2">Lọc theo vai trò:</span>
                                <select
                                    className="p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white cursor-pointer shadow-sm"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="ADMIN">Quản lý</option>
                                    <option value="CANDIDATE">Thí sinh</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Lỗi!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        /* Table Section */
                        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto w-full">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-600">Không tìm thấy người dùng nào.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map(user => (
                                            <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.birth || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.citizenId || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UserList;

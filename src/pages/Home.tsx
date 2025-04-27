import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
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
                            />
                        </div>
                        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-4">
                            <div className="flex items-center">
                                <span className="mr-2">Lọc theo vai trò:</span>
                                <select className="p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white cursor-pointer shadow-sm">
                                    <option value="">Tất cả</option>
                                    <option value="admin">Quản lý</option>
                                    <option value="candidate">Thí sinh</option>
                                </select>
                            </div>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                                <span className="mr-1">+</span>
                                Thêm người dùng
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">50b846c3-256f-464f-8f4f-f4e259518b4a</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Vũ Đức Trung</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">trung@gmail.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2004-11-20</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">022204200881</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            CANDIDATE
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-2">
                                            <button className="hover:bg-gray-100 p-1 rounded-full transition-colors">✏️</button>
                                            <button className="hover:bg-gray-100 p-1 rounded-full transition-colors">🗑️</button>
                                            <button className="hover:bg-gray-100 p-1 rounded-full transition-colors">⚙️</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Home;

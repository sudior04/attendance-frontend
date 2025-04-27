import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiRequest, isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface Attendance {
    id: string;
    examId: string;
    examName: string;
    userId: string;
    userName: string;
    userEmail: string;
    citizenId: string;
    checkInTime: string;
    status: string;
    notes?: string;
}

const Attendance = () => {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [exams, setExams] = useState<{ id: string; name: string }[]>([]);
    const [examFilter, setExamFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchAttendances();
        fetchExams();
    }, [navigate]);

    useEffect(() => {
        filterAttendances();
    }, [searchTerm, statusFilter, examFilter, attendances]);

    const fetchAttendances = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<Attendance[]>('/api/attendances');
            setAttendances(data);
        } catch (err: any) {
            console.error('Lỗi khi tải dữ liệu điểm danh:', err);
            setError('Không thể tải dữ liệu điểm danh. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            const data = await apiRequest<{ id: string; name: string }[]>('/api/exams');
            setExams(data);
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách kỳ thi:', err);
        }
    };

    const filterAttendances = () => {
        let filtered = [...attendances];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filtered = filtered.filter(
                attendance =>
                    attendance.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendance.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendance.citizenId.includes(searchTerm)
            );
        }

        // Lọc theo trạng thái
        if (statusFilter) {
            filtered = filtered.filter(attendance => attendance.status === statusFilter);
        }

        // Lọc theo kỳ thi
        if (examFilter) {
            filtered = filtered.filter(attendance => attendance.examId === examFilter);
        }

        setFilteredAttendances(filtered);
    };

    const handleCreateAttendance = () => {
        // Chuyển đến trang tạo điểm danh mới hoặc mở modal
        console.log('Tạo điểm danh mới');
    };

    const handleEditAttendance = (id: string) => {
        // Chuyển đến trang chỉnh sửa điểm danh hoặc mở modal
        console.log('Chỉnh sửa điểm danh:', id);
    };

    const handleDeleteAttendance = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi điểm danh này không?')) {
            try {
                await apiRequest(`/api/attendances/${id}`, {
                    method: 'DELETE'
                });
                // Cập nhật lại danh sách sau khi xóa
                setAttendances(attendances.filter(attendance => attendance.id !== id));
            } catch (err: any) {
                console.error('Lỗi khi xóa điểm danh:', err);
                alert('Không thể xóa điểm danh. Vui lòng thử lại sau.');
            }
        }
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'bg-green-100 text-green-800';
            case 'ABSENT':
                return 'bg-red-100 text-red-800';
            case 'LATE':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'Có mặt';
            case 'ABSENT':
                return 'Vắng mặt';
            case 'LATE':
                return 'Đi muộn';
            default:
                return status;
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Quản lý điểm danh</h1>
                        <p className="text-gray-600">Quản lý thông tin điểm danh của thí sinh</p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email hoặc CCCD..."
                                className="w-full p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-white shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center w-full md:w-auto justify-between md:justify-end gap-4">
                            <div className="flex items-center">
                                <span className="mr-2">Kỳ thi:</span>
                                <select
                                    className="p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white cursor-pointer shadow-sm"
                                    value={examFilter}
                                    onChange={(e) => setExamFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    {exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2">Trạng thái:</span>
                                <select
                                    className="p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white cursor-pointer shadow-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PRESENT">Có mặt</option>
                                    <option value="ABSENT">Vắng mặt</option>
                                    <option value="LATE">Đi muộn</option>
                                </select>
                            </div>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                                onClick={handleCreateAttendance}
                            >
                                <span className="mr-1">+</span>
                                Thêm điểm danh
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    )}

                    {/* Table Section */}
                    {!loading && (
                        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto w-full">
                            {filteredAttendances.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không có dữ liệu điểm danh</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ thi</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thí sinh</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian điểm danh</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAttendances.map((attendance) => (
                                            <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendance.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendance.examName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>{attendance.userName}</div>
                                                    <div className="text-xs text-gray-500">{attendance.userEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendance.citizenId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDateTime(attendance.checkInTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 py-1 text-xs font-medium ${getStatusBadgeClass(attendance.status)} rounded-full`}>
                                                        {getStatusText(attendance.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendance.notes || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                            onClick={() => handleEditAttendance(attendance.id)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                            onClick={() => handleDeleteAttendance(attendance.id)}
                                                            title="Xóa"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
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

export default Attendance;
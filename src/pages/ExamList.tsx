import React, { useState, useEffect } from 'react';
import { getExams, Exam } from '../services/examService';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Cập nhật interface Exam để phù hợp với yêu cầu mới
interface ExamData extends Exam {
    subject: string;
    semester: string;
    shift: string;
    room: string;
}

const ExamList = () => {
    const [exams, setExams] = useState<ExamData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                setLoading(true);
                const data = await getExams();
                // Map dữ liệu trả về để phù hợp với yêu cầu mới
                const mappedData = data.map(exam => ({
                    ...exam,
                    subject: 'Lập trình Web', // Giả định, sẽ được thay thế bằng dữ liệu thực tế
                    semester: 'Học kỳ 2 2024-2025', // Giả định
                    shift: 'Ca sáng (7:00 - 9:00)', // Giả định
                    room: 'P.405-A2' // Giả định
                }));
                setExams(mappedData);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách kỳ thi');
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    // Filter exams based on search term and status
    const filteredExams = exams.filter((exam) => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.room.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === '' || exam.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'bg-blue-100 text-blue-800';
            case 'ONGOING':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'Sắp diễn ra';
            case 'ONGOING':
                return 'Đang diễn ra';
            case 'COMPLETED':
                return 'Đã kết thúc';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Danh sách kỳ thi</h1>
                        <p className="text-gray-600">Quản lý tất cả các kỳ thi trong hệ thống</p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, môn học, phòng thi..."
                                className="w-full p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-4">
                            <div className="flex items-center">
                                <span className="mr-2">Lọc theo trạng thái:</span>
                                <select
                                    className="p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white cursor-pointer shadow-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="UPCOMING">Sắp diễn ra</option>
                                    <option value="ONGOING">Đang diễn ra</option>
                                    <option value="COMPLETED">Đã kết thúc</option>
                                </select>
                            </div>
                            <button className="ml-0 md:ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm">
                                Thêm kỳ thi
                            </button>
                        </div>
                    </div>

                    {/* Error and Loading states */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto w-full">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kỳ thi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn thi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kì học</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ca thi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng thi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredExams.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                                                    Không có kỳ thi nào
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredExams.map((exam) => (
                                                <tr key={exam.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.subject}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.semester}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatDate(exam.startDate)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.shift}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.room}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(exam.status)}`}>
                                                            {getStatusLabel(exam.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button className="text-blue-600 hover:text-blue-900 flex items-center" title="Xem chi tiết">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Xem
                                                            </button>
                                                            <button className="text-indigo-600 hover:text-indigo-900 flex items-center" title="Sửa">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Sửa
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900 flex items-center" title="Xóa">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ExamList;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { getExamById, Exam } from '../services/examService';
import { getExamAttendance } from '../services/attendanceService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AttendanceRecord {
    id: string;
    candidate: {
        userId: string;
        name: string;
        username: string;
        email: string;
    };
    exam: Exam;
    citizenCardVerified: boolean;
    faceVerified: boolean;
    attendanceTime: string;
}

const AttendanceDetail = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {                // Fetch exam details
                if (examId) {
                    const examData = await getExamById(examId);
                    setExam(examData);

                    // Fetch attendance records for this exam
                    const attendanceData = await getExamAttendance(examId);
                    setAttendanceRecords(attendanceData);
                }
                setError(null);
            } catch (err: any) {
                console.error('Error fetching attendance data:', err);
                setError(err.message || 'Không thể tải dữ liệu điểm danh. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [examId, navigate]);

    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Ngày không hợp lệ";

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const formatTime = (dateTimeString: string | undefined | null) => {
        if (!dateTimeString) return "N/A";

        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return "Thời gian không hợp lệ";

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <button
                                onClick={() => navigate('/attendance')}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Quay lại danh sách
                            </button>
                            <h1 className="text-2xl font-bold">Chi tiết điểm danh kỳ thi</h1>
                        </div>
                    </div>

                    {/* Error display */}
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
                            {/* Exam Info */}
                            {exam && (
                                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                                    <h2 className="text-xl font-semibold mb-4">Thông tin kỳ thi</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Tên kỳ thi:</p>
                                            <p className="font-medium">{exam.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Môn học:</p>
                                            <p className="font-medium">{exam.subject}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Kì học:</p>
                                            <p className="font-medium">{exam.semester}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Ngày thi:</p>
                                            <p className="font-medium">{formatDate(exam.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Ca thi:</p>
                                            <p className="font-medium">
                                                {exam.schedule ? `${exam.schedule.name} (${exam.schedule.startTime} - ${exam.schedule.endTime})` : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Phòng thi:</p>
                                            <p className="font-medium">
                                                {exam.room ? `${exam.room.building} - ${exam.room.name}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attendance Records */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold">Danh sách điểm danh</h2>
                                    <p className="text-gray-600">Tổng số thí sinh điểm danh: {attendanceRecords.length}</p>
                                </div>

                                {attendanceRecords.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        Chưa có dữ liệu điểm danh cho kỳ thi này.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên thí sinh</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD đã xác thực</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khuôn mặt đã xác thực</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian điểm danh</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {attendanceRecords.map((record, index) => (
                                                    <tr key={record.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{record.candidate.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{record.candidate.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.citizenCardVerified
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {record.citizenCardVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.faceVerified
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {record.faceVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatTime(record.attendanceTime)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AttendanceDetail;

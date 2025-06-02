import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, Exam } from '../services/examService';
import { getCandidatesByExamId, CandidateInExamDTO, removeCandidateFromExam } from '../services/cieService';
import { checkCandidateAttendance } from '../services/attendanceService';
import { isAuthenticated } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddCandidateModal from '../components/AddCandidateModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface CandidateWithAttendance extends CandidateInExamDTO {
    hasAttended?: boolean;
    attendanceLoading?: boolean;
}

const ExamDetail = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [examData, setExamData] = useState<Exam | null>(null);
    const [candidates, setCandidates] = useState<CandidateWithAttendance[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // State cho modal xác nhận xóa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [candidateNameToDelete, setCandidateNameToDelete] = useState<string>('');

    // Function to load candidates for the exam
    const loadCandidates = async () => {
        if (!examId) return;

        try {
            const candidatesData = await getCandidatesByExamId(examId);

            // Thêm trạng thái tham gia thi ban đầu cho các thí sinh
            const candidatesWithAttendance: CandidateWithAttendance[] = candidatesData.map(candidate => ({
                ...candidate,
                hasAttended: undefined,
                attendanceLoading: false
            }));

            setCandidates(candidatesWithAttendance);

            // Kiểm tra trạng thái tham gia thi cho từng thí sinh
            await checkAttendanceForCandidates(candidatesWithAttendance);
        } catch (err: any) {
            console.error('Error loading candidates:', err);
        }
    };

    // Kiểm tra điểm danh cho tất cả các thí sinh
    const checkAttendanceForCandidates = async (candidateList: CandidateWithAttendance[]) => {
        if (!examId) return;

        const updatedCandidates = [...candidateList];

        // Lấy thông tin điểm danh cho từng thí sinh
        for (let i = 0; i < updatedCandidates.length; i++) {
            const candidate = updatedCandidates[i];
            try {
                candidate.attendanceLoading = true;
                setCandidates([...updatedCandidates]);

                const hasAttended = await checkCandidateAttendance(candidate.candidateId, examId);

                candidate.hasAttended = hasAttended;
                candidate.attendanceLoading = false;

                // Cập nhật dữ liệu sau mỗi lần kiểm tra
                setCandidates([...updatedCandidates]);
            } catch (error) {
                console.error(`Không thể kiểm tra điểm danh cho thí sinh ${candidate.candidateId}:`, error);
                candidate.attendanceLoading = false;
                setCandidates([...updatedCandidates]);
            }
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            if (!examId) return;

            try {
                setLoading(true);

                // Fetch exam details
                const exam = await getExamById(examId);
                setExamData(exam);

                // Fetch candidates for this exam using cieService
                await loadCandidates();

                setError(null);
            } catch (err: any) {
                setError(err.message || 'Không thể tải dữ liệu kỳ thi');
                console.error('Error fetching exam details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [examId, navigate]);

    // Filter candidates based on search term
    const filteredCandidates = candidates.filter((candidate) => {
        const matchesSearch =
            candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

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

    const handleGoBack = () => {
        navigate('/exams');
    };

    // Handle candidate added successfully
    const handleCandidateAdded = () => {
        // Reload candidates list
        loadCandidates();
        // Close modal after a delay (to show success message)
        setTimeout(() => {
            setIsAddModalOpen(false);
        }, 2000);
    };

    // Handle request to delete candidate from exam
    const handleDeleteCandidate = (candidateId: string, candidateName: string) => {
        setCandidateToDelete(candidateId);
        setCandidateNameToDelete(candidateName);
        setIsDeleteModalOpen(true);
    };

    // Handle confirm delete candidate from exam
    const confirmDeleteCandidate = async () => {
        if (!candidateToDelete || !examId) return;

        setDeleteLoading(candidateToDelete);

        try {
            await removeCandidateFromExam(candidateToDelete, examId);
            // Reload candidates after deletion
            await loadCandidates();
        } catch (err: any) {
            console.error('Error deleting candidate:', err);
            alert(err.message || 'Có lỗi xảy ra khi xóa thí sinh');
        } finally {
            setDeleteLoading(null);
            setIsDeleteModalOpen(false);
            setCandidateToDelete(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow w-full">
                <div className="w-full px-4 py-6">
                    <div className="mb-2 flex items-center">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại danh sách kỳ thi
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    ) : examData ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold mb-2">{examData.name}</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold mb-2">Thông tin kỳ thi</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <p className="text-gray-600">Môn học:</p>
                                            <p>{examData.subject}</p>
                                            <p className="text-gray-600">Kì học:</p>
                                            <p>{examData.semester}</p>
                                            <p className="text-gray-600">Ngày thi:</p>
                                            <p>{formatDate(examData.date)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold mb-2">Thông tin ca thi</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <p className="text-gray-600">Tên ca:</p>
                                            <p>{examData.schedule?.name || 'N/A'}</p>
                                            <p className="text-gray-600">Thời gian:</p>
                                            <p>{examData.schedule?.startTime || 'N/A'} - {examData.schedule?.endTime || 'N/A'}</p>
                                            <p className="text-gray-600">Phòng thi:</p>
                                            <p>{examData.room?.building || 'N/A'} - {examData.room?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-4">Danh sách sinh viên</h2>

                                {/* Toolbar */}
                                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                    <div className="w-full md:flex-1">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo họ tên, email..."
                                            className="w-full p-2 border border-gray-200 rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white shadow-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Thêm thí sinh
                                        </button>
                                    </div>
                                </div>

                                {/* Candidates Table */}
                                <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID thí sinh</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CMND/CCCD</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tham gia thi</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredCandidates.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                                                        Không có sinh viên nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCandidates.map((candidate, index) => (
                                                    <tr key={candidate.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{index + 1}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{candidate.candidateName}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{candidate.candidateEmail}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{candidate.candidateId}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{candidate.candidateCitizenId}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                                            {candidate.attendanceLoading ? (
                                                                <div className="flex justify-center">
                                                                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                </div>
                                                            ) : candidate.hasAttended !== undefined ? (
                                                                candidate.hasAttended ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                                                            <circle cx="4" cy="4" r="3" />
                                                                        </svg>
                                                                        Đã tham gia
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                                                            <circle cx="4" cy="4" r="3" />
                                                                        </svg>
                                                                        Chưa tham gia
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-gray-400">Không có dữ liệu</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                            <button
                                                                onClick={() => handleDeleteCandidate(candidate.candidateId, candidate.candidateName)}
                                                                disabled={deleteLoading === candidate.candidateId}
                                                                className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                                            >
                                                                {deleteLoading === candidate.candidateId ? (
                                                                    <span className="inline-flex items-center justify-center">
                                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Đang xóa...
                                                                    </span>
                                                                ) : (
                                                                    'Xóa'
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Add Candidate Modal */}
                            {isAddModalOpen && examId && (
                                <AddCandidateModal
                                    examId={examId}
                                    onClose={() => setIsAddModalOpen(false)}
                                    onSuccess={handleCandidateAdded}
                                />
                            )}

                            {/* Delete Confirmation Modal */}
                            <DeleteConfirmationModal
                                isOpen={isDeleteModalOpen}
                                onClose={() => setIsDeleteModalOpen(false)}
                                onConfirm={confirmDeleteCandidate}
                                title="Xác nhận xóa thí sinh"
                                message={`Bạn có chắc chắn muốn xóa thí sinh ${candidateNameToDelete} khỏi kỳ thi này không?`}
                                confirmButtonText="Xóa"
                                isSubmitting={!!deleteLoading}
                                showExamDetails={false}
                            />
                        </>
                    ) : (
                        <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded">
                            Không tìm thấy thông tin kỳ thi
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ExamDetail;
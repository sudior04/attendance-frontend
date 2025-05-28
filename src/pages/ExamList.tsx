import React, { useState, useEffect } from 'react';
import { getExams, Exam, updateExam, deleteExam, createExam } from '../services/examService';
import { useNavigate } from 'react-router-dom';
import { apiRequest, isAuthenticated, getUserFromStorage } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';


const ExamList = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<Partial<Exam>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [newExamData, setNewExamData] = useState<Partial<Exam>>({
        name: '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        semester: '',
        schedule: {
            scheduleId: '',
            startTime: '',
            endTime: '',
            name: ''
        },
        room: {
            roomId: '',
            name: '',
            building: ''
        }
    });
    const navigate = useNavigate(); useEffect(() => {

        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        const fetchExams = async () => {
            try {
                setLoading(true);
                const data = await getExams();
                setExams(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách kỳ thi');
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [navigate]);

    // Determine exam status based on the current date and exam date
    const determineExamStatus = (exam: Exam) => {
        // Use the existing status if it's already defined and not empty
        if (exam.status) {
            return exam.status;
        }

        // If we don't have date or schedule information, return UNKNOWN
        if (!exam.date || !exam.schedule) {
            return 'UNKNOWN';
        }

        const now = new Date();
        const examDate = new Date(exam.date);

        // Set the exam start and end time
        let examStartTime: Date | null = null;
        let examEndTime: Date | null = null;

        if (exam.schedule.startTime && exam.schedule.endTime) {
            // Create dates for exam's start and end times on the exam date
            const [startHours, startMinutes] = exam.schedule.startTime.split(':').map(Number);
            const [endHours, endMinutes] = exam.schedule.endTime.split(':').map(Number);

            examStartTime = new Date(examDate);
            examStartTime.setHours(startHours, startMinutes, 0);

            examEndTime = new Date(examDate);
            examEndTime.setHours(endHours, endMinutes, 0);
        }

        // Compare dates
        if (!examStartTime || !examEndTime) {
            // If we don't have detailed time info, just compare dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            examDate.setHours(0, 0, 0, 0);

            if (examDate > today) {
                return 'UPCOMING';
            } else if (examDate.getTime() === today.getTime()) {
                return 'ONGOING';
            } else {
                return 'COMPLETED';
            }
        } else {
            // We have detailed time info, so compare with precision
            if (now < examStartTime) {
                return 'UPCOMING';
            } else if (now >= examStartTime && now <= examEndTime) {
                return 'ONGOING';
            } else {
                return 'COMPLETED';
            }
        }
    };

    // Filter exams based on search term and status
    const filteredExams = exams.filter((exam) => {
        const examStatus = determineExamStatus(exam);

        const matchesSearch =
            exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.room?.building?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === '' || examStatus === statusFilter;

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

    // Handler functions for exam editing and deletion
    const handleOpenEditModal = (exam: Exam) => {
        setSelectedExam(exam);
        setEditFormData({ ...exam });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (exam: Exam) => {
        setSelectedExam(exam);
        setIsDeleteModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedExam(null);
        setEditFormData({});
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedExam(null);
    }; const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Xử lý các trường lồng nhau như schedule.name, schedule.startTime, v.v.
        if (name.includes('.')) {
            // Xử lý các trường lồng nhau như schedule.name, room.building, v.v.
            const [parentField, childField] = name.split('.');

            if (parentField === 'schedule') {
                setEditFormData(prev => ({
                    ...prev,
                    schedule: {
                        ...(prev.schedule || {
                            scheduleId: '',
                            startTime: '',
                            endTime: '',
                            name: ''
                        }),
                        [childField]: value
                    }
                }));
            } else if (parentField === 'room') {
                setEditFormData(prev => ({
                    ...prev,
                    room: {
                        ...(prev.room || {
                            roomId: '',
                            name: '',
                            building: ''
                        }),
                        [childField]: value
                    }
                }));
            }
        } else {
            // Xử lý các trường thông thường
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }; const handleEditFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) return;

        try {
            setIsSubmitting(true);
            setError(null);

            // Ensure valid scheduleId and roomId from original exam
            const schedule = editFormData.schedule ? {
                ...editFormData.schedule,
                scheduleId: editFormData.schedule.scheduleId || selectedExam.schedule.scheduleId
            } : selectedExam.schedule;

            const room = editFormData.room ? {
                ...editFormData.room,
                roomId: editFormData.room.roomId || selectedExam.room.roomId
            } : selectedExam.room;

            // Prepare data for API call
            const updateData: Partial<Exam> = {
                ...editFormData,
                schedule,
                room
            };

            const updatedExam = await updateExam(selectedExam.examId, updateData);

            // Update the exams list with the updated exam
            setExams(prevExams =>
                prevExams.map(exam =>
                    exam.examId === updatedExam.examId ? updatedExam : exam
                )
            );

            // Close the modal
            handleCloseEditModal();

            // Show success message (you can implement a toast notification here)
            console.log('Exam updated successfully');
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật kỳ thi. Vui lòng thử lại sau.');
            console.error('Error updating exam:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedExam) return;

        try {
            setIsSubmitting(true);
            setError(null);

            await deleteExam(selectedExam.examId);

            // Remove the deleted exam from the list
            setExams(prevExams => prevExams.filter(exam => exam.examId !== selectedExam.examId));

            // Close the modal
            handleCloseDeleteModal();

            // Show success message (you can implement a toast notification here)
            console.log('Exam deleted successfully');
        } catch (err: any) {
            setError(err.message || 'Không thể xóa kỳ thi. Vui lòng thử lại sau.');
            console.error('Error deleting exam:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setNewExamData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            subject: '',
            semester: '',
            schedule: {
                scheduleId: '',
                startTime: '',
                endTime: '',
                name: ''
            },
            room: {
                roomId: '',
                name: '',
                building: ''
            }
        });
    }; const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            // Xử lý các trường lồng nhau như schedule.name, room.building, v.v.
            const [parentField, childField] = name.split('.');

            if (parentField === 'schedule') {
                setNewExamData(prev => ({
                    ...prev,
                    schedule: {
                        ...(prev.schedule || {
                            scheduleId: '',
                            startTime: '',
                            endTime: '',
                            name: ''
                        }),
                        [childField]: value
                    }
                }));
            } else if (parentField === 'room') {
                setNewExamData(prev => ({
                    ...prev,
                    room: {
                        ...(prev.room || {
                            roomId: '',
                            name: '',
                            building: ''
                        }),
                        [childField]: value
                    }
                }));
            }
        } else {
            // Xử lý các trường thông thường
            setNewExamData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            // Ensure we have all required fields
            if (!newExamData.name || !newExamData.subject || !newExamData.semester) {
                setError('Vui lòng điền đầy đủ thông tin cần thiết');
                setIsSubmitting(false);
                return;
            }

            // Generate IDs for schedule and room if they're missing
            const examToCreate = {
                ...newExamData,
                schedule: {
                    ...newExamData.schedule,
                    scheduleId: newExamData.schedule?.scheduleId
                },
                room: {
                    ...newExamData.room,
                    roomId: newExamData.room?.roomId
                }
            } as Exam;

            // Create the new exam using the API
            const createdExam = await createExam(examToCreate);

            // Add the new exam to the list
            setExams(prevExams => [...prevExams, createdExam]);

            // Close the modal
            handleCloseAddModal();

            // Show success message
            alert('Thêm kỳ thi thành công!');
            console.log('Exam added successfully');
        } catch (err: any) {
            setError(err.message || 'Không thể thêm kỳ thi. Vui lòng thử lại sau.');
            console.error('Error adding exam:', err);
        } finally {
            setIsSubmitting(false);
        }
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
                            <button
                                onClick={handleOpenAddModal}
                                className="ml-0 md:ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm"
                            >
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
                                                <tr key={exam.examId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.subject}</div>
                                                    </td>                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{exam.semester}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatDate(exam.date)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {exam.schedule ? (
                                                                <>
                                                                    {exam.schedule.name} ({exam.schedule.startTime} - {exam.schedule.endTime})
                                                                </>
                                                            ) : 'N/A'}
                                                        </div>
                                                    </td>                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {exam.room ? (
                                                                <>
                                                                    {exam.room.building} - {exam.room.name}
                                                                </>
                                                            ) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(determineExamStatus(exam))}`}>
                                                            {getStatusLabel(determineExamStatus(exam))}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                                title="Sửa"
                                                                onClick={() => handleOpenEditModal(exam)}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Sửa
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                                title="Xóa"
                                                                onClick={() => handleOpenDeleteModal(exam)}
                                                            >
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

            {/* Edit Exam Modal */}
            {isEditModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa kỳ thi</h2>
                            <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ thi</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name" value={editFormData.name || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Môn thi</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject" value={editFormData.subject || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Kì học</label>
                                    <input
                                        type="text"
                                        id="semester"
                                        name="semester" value={editFormData.semester || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Ngày thi</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date" value={editFormData.date || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <h3 className="text-lg font-medium mb-2">Thông tin ca thi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="editScheduleName" className="block text-sm font-medium text-gray-700 mb-1">Tên ca thi</label>
                                        <input
                                            type="text"
                                            id="editScheduleName"
                                            name="schedule.name"
                                            value={editFormData.schedule?.name || ''}
                                            onChange={handleEditInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="editStartTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                                        <input
                                            type="time"
                                            id="editStartTime"
                                            name="schedule.startTime"
                                            value={editFormData.schedule?.startTime || ''}
                                            onChange={handleEditInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="editEndTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                                        <input
                                            type="time"
                                            id="editEndTime"
                                            name="schedule.endTime"
                                            value={editFormData.schedule?.endTime || ''}
                                            onChange={handleEditInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <h3 className="text-lg font-medium mb-2">Thông tin phòng thi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="editRoomName" className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                                        <input
                                            type="text"
                                            id="editRoomName"
                                            name="room.name"
                                            value={editFormData.room?.name || ''}
                                            onChange={handleEditInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="editBuilding" className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>
                                        <input
                                            type="text"
                                            id="editBuilding"
                                            name="room.building"
                                            value={editFormData.room?.building || ''}
                                            onChange={handleEditInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Exam Modal */}
            {isDeleteModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Xác nhận xóa kỳ thi</h2>
                            <button onClick={handleCloseDeleteModal} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">Bạn có chắc chắn muốn xóa kỳ thi sau không?</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <p className="font-medium">{selectedExam.name}</p>
                                <p className="text-sm text-gray-600">Môn thi: {selectedExam.subject}</p>
                                <p className="text-sm text-gray-600">Kì học: {selectedExam.semester}</p>
                                <p className="text-sm text-gray-600">Ngày thi: {formatDate(selectedExam.date)}</p>
                            </div>
                            <p className="text-red-600 text-sm mt-4">Hành động này không thể hoàn tác!</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang xóa...' : 'Xóa kỳ thi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}            {/* Add Exam Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Thêm kỳ thi mới</h2>
                            <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ thi <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newExamData.name || ''}
                                        onChange={handleAddInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Môn thi <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={newExamData.subject || ''}
                                        onChange={handleAddInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Kì học <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="semester"
                                        name="semester"
                                        value={newExamData.semester || ''}
                                        onChange={handleAddInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Ngày thi <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={newExamData.date || ''}
                                        onChange={handleAddInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <h3 className="text-lg font-medium mb-2">Thông tin ca thi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="scheduleName" className="block text-sm font-medium text-gray-700 mb-1">Tên ca thi</label>                                        <input
                                            type="text"
                                            id="scheduleName"
                                            name="schedule.name"
                                            value={newExamData.schedule?.name || ''}
                                            onChange={handleAddInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>                                        <input
                                            type="time"
                                            id="startTime"
                                            name="schedule.startTime"
                                            value={newExamData.schedule?.startTime || ''}
                                            onChange={handleAddInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>                                        <input
                                            type="time"
                                            id="endTime"
                                            name="schedule.endTime"
                                            value={newExamData.schedule?.endTime || ''}
                                            onChange={handleAddInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <h3 className="text-lg font-medium mb-2">Thông tin phòng thi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>                                        <input
                                            type="text"
                                            id="roomName"
                                            name="room.name"
                                            value={newExamData.room?.name || ''}
                                            onChange={handleAddInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>                                        <input
                                            type="text"
                                            id="building"
                                            name="room.building"
                                            value={newExamData.room?.building || ''}
                                            onChange={handleAddInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseAddModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Thêm kỳ thi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamList;
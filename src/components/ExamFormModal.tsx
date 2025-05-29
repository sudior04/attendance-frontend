import React, { useState, useEffect } from 'react';
import { Exam } from '../services/examService';
import { Room, getRooms } from '../services/roomService';
import { Schedule, getSchedules } from '../services/scheduleService';

interface ExamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (examData: Partial<Exam>) => void;
    initialData?: Partial<Exam>;
    title: string;
    submitButtonText: string;
    isSubmitting: boolean;
    error: string | null;
}

const ExamFormModal: React.FC<ExamFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
    submitButtonText,
    isSubmitting,
    error
}) => {
    const [formData, setFormData] = useState<Partial<Exam>>({
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

    const [rooms, setRooms] = useState<Room[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);    // Initialize form data when modal opens or initialData changes
    useEffect(() => {
        if (initialData) {
            // Đảm bảo rằng initialData.schedule và initialData.room có tất cả các thuộc tính cần thiết
            const formattedData = {
                ...initialData,
                schedule: initialData.schedule ? {
                    scheduleId: initialData.schedule.scheduleId || '',
                    startTime: initialData.schedule.startTime || '',
                    endTime: initialData.schedule.endTime || '',
                    name: initialData.schedule.name || ''
                } : {
                    scheduleId: '',
                    startTime: '',
                    endTime: '',
                    name: ''
                },
                room: initialData.room ? {
                    roomId: initialData.room.roomId || '',
                    name: initialData.room.name || '',
                    building: initialData.room.building || ''
                } : {
                    roomId: '',
                    name: '',
                    building: ''
                }
            };

            console.log('Initializing form data with:', formattedData);
            setFormData(formattedData);
        } else {
            // Reset form data when opening for a new record
            setFormData({
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
        }
    }, [initialData, isOpen]);    // Fetch rooms and schedules when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    setFetchError(null);

                    // Fetch rooms and schedules in parallel
                    const [roomsData, schedulesData] = await Promise.all([
                        getRooms(),
                        getSchedules()
                    ]);

                    console.log('Fetched rooms:', roomsData);
                    console.log('Fetched schedules:', schedulesData);

                    setRooms(roomsData);
                    setSchedules(schedulesData);

                    // If we have initialData with scheduleId and roomId, but the full objects weren't loaded,
                    // find and set them now that we have the data
                    if (initialData && initialData.schedule?.scheduleId) {
                        const matchingSchedule = schedulesData.find(
                            s => s.scheduleId === initialData.schedule?.scheduleId
                        );
                        if (matchingSchedule && formData.schedule?.scheduleId === initialData.schedule.scheduleId) {
                            console.log('Setting matching schedule:', matchingSchedule);
                            setFormData(prev => ({
                                ...prev,
                                schedule: matchingSchedule
                            }));
                        }
                    }

                    if (initialData && initialData.room?.roomId) {
                        const matchingRoom = roomsData.find(
                            r => r.roomId === initialData.room?.roomId
                        );
                        if (matchingRoom && formData.room?.roomId === initialData.room.roomId) {
                            console.log('Setting matching room:', matchingRoom);
                            setFormData(prev => ({
                                ...prev,
                                room: matchingRoom
                            }));
                        }
                    }
                } catch (err: any) {
                    console.error('Error fetching rooms and schedules:', err);
                    setFetchError(err.message || 'Không thể tải dữ liệu phòng và lịch');
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [isOpen, initialData, formData.schedule?.scheduleId, formData.room?.roomId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle regular fields
        if (!name.includes('.')) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }
    }; const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedScheduleId = e.target.value;
        console.log('Selected schedule ID:', selectedScheduleId);
        console.log('Available schedules:', schedules);

        // If empty value is selected, clear the schedule
        if (!selectedScheduleId) {
            setFormData(prev => ({
                ...prev,
                schedule: {
                    scheduleId: '',
                    startTime: '',
                    endTime: '',
                    name: ''
                }
            }));
            return;
        }

        const selectedSchedule = schedules.find(s => s.scheduleId === selectedScheduleId);

        if (selectedSchedule) {
            console.log('Found matching schedule:', selectedSchedule);
            setFormData(prev => ({
                ...prev,
                schedule: {
                    scheduleId: selectedSchedule.scheduleId,
                    startTime: selectedSchedule.startTime,
                    endTime: selectedSchedule.endTime,
                    name: selectedSchedule.name
                }
            }));
        } else {
            console.warn('No matching schedule found for ID:', selectedScheduleId);
        }
    }; const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoomId = e.target.value;
        console.log('Selected room ID:', selectedRoomId);
        console.log('Available rooms:', rooms);

        // If empty value is selected, clear the room
        if (!selectedRoomId) {
            setFormData(prev => ({
                ...prev,
                room: {
                    roomId: '',
                    name: '',
                    building: ''
                }
            }));
            return;
        }

        const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);

        if (selectedRoom) {
            console.log('Found matching room:', selectedRoom);
            setFormData(prev => ({
                ...prev,
                room: {
                    roomId: selectedRoom.roomId,
                    name: selectedRoom.name,
                    building: selectedRoom.building
                }
            }));
        } else {
            console.warn('No matching room found for ID:', selectedRoomId);
        }
    }; const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData);
        // Kiểm tra dữ liệu hợp lệ trước khi gửi
        if (!formData.schedule?.scheduleId) {
            alert('Vui lòng chọn ca thi');
            return;
        }
        if (!formData.room?.roomId) {
            alert('Vui lòng chọn phòng thi');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {(error || fetchError) && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {error || fetchError}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ thi <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
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
                                    value={formData.subject || ''}
                                    onChange={handleInputChange}
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
                                    value={formData.semester || ''}
                                    onChange={handleInputChange}
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
                                    value={formData.date || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <h3 className="text-lg font-medium mb-2">Thông tin ca thi</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="scheduleId" className="block text-sm font-medium text-gray-700 mb-1">Ca thi <span className="text-red-500">*</span></label>                                <select
                                        id="scheduleId"
                                        name="scheduleId"
                                        value={formData.schedule?.scheduleId || ''}
                                        onChange={handleScheduleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Chọn ca thi --</option>
                                        {schedules && schedules.length > 0 ? schedules.map(schedule => (
                                            <option key={schedule.scheduleId} value={schedule.scheduleId}>
                                                {schedule.name} ({schedule.startTime} - {schedule.endTime})
                                            </option>
                                        )) : <option disabled>Đang tải dữ liệu...</option>}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <h3 className="text-lg font-medium mb-2">Thông tin phòng thi</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">Phòng thi <span className="text-red-500">*</span></label>                                <select
                                        id="roomId"
                                        name="roomId"
                                        value={formData.room?.roomId || ''}
                                        onChange={handleRoomChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Chọn phòng thi --</option>
                                        {rooms && rooms.length > 0 ? rooms.map(room => (
                                            <option key={room.roomId} value={room.roomId}>
                                                {room.building} - {room.name}
                                            </option>
                                        )) : <option disabled>Đang tải dữ liệu...</option>}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
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
                                {isSubmitting ? 'Đang xử lý...' : submitButtonText}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExamFormModal;

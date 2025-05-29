import React from 'react';
import { Exam } from '../services/examService';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    exam: Exam | null;
    isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    exam,
    isSubmitting
}) => {
    if (!isOpen || !exam) {
        return null;
    }

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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Xác nhận xóa kỳ thi</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-4">Bạn có chắc chắn muốn xóa kỳ thi sau không?</p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-gray-600">Môn thi: {exam.subject}</p>
                        <p className="text-sm text-gray-600">Kì học: {exam.semester}</p>
                        <p className="text-sm text-gray-600">Ngày thi: {formatDate(exam.date)}</p>
                    </div>
                    <p className="text-red-600 text-sm mt-4">Hành động này không thể hoàn tác!</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xóa...' : 'Xóa kỳ thi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;

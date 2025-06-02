import React, { use, useState } from 'react';
import { User, searchUserByCitizenId } from '../services/userService';
import { createCandidateInExam } from '../services/cieService';

interface AddCandidateModalProps {
    examId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ examId, onClose, onSuccess }) => {
    const [citizenId, setCitizenId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userFound, setUserFound] = useState<User | null>(null);

    const handleSearch = async () => {
        if (!citizenId.trim()) {
            setError('Vui lòng nhập CMND/CCCD của thí sinh');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setUserFound(null);

        try {
            const user = await searchUserByCitizenId(citizenId);
            if (!user) {
                setError('Không tìm thấy thí sinh với CMND/CCCD đã nhập');
                console.log('Không tìm thấy thí sinh với CMND/CCCD:', citizenId);
                return;
            }
            console.log(user);
            setUserFound(user);
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tìm kiếm thí sinh');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCandidate = async () => {
        if (!userFound) return;

        setLoading(true);
        setError(null);

        try {
            await createCandidateInExam(userFound.userId, examId);
            setSuccess(`Đã thêm thí sinh ${userFound.name} vào kỳ thi thành công`);

            // Reset form after success
            setCitizenId('');
            setUserFound(null);

            // Notify parent component
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err: any) {
            if (err.message.includes('đã được thêm vào kỳ thi')) {
                setError('Thí sinh này đã được thêm vào kỳ thi');
            } else {
                setError(err.message || 'Lỗi khi thêm thí sinh vào kỳ thi');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Thêm thí sinh vào kỳ thi</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="citizenId" className="block text-sm font-medium text-gray-700 mb-1">
                        CMND/CCCD
                    </label>
                    <div className="flex">                        <input
                        type="text"
                        id="citizenId"
                        value={citizenId}
                        onChange={(e) => setCitizenId(e.target.value)}
                        placeholder="Nhập số CMND/CCCD"
                        className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                        disabled={loading}
                    />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !citizenId.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Đang tìm...' : 'Tìm'}
                        </button>
                    </div>
                </div>

                {userFound && (
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Thông tin thí sinh</h3>
                        <div className="bg-gray-50 p-3 rounded border">
                            <p><span className="font-medium">Họ tên:</span> {userFound.name}</p>
                            <p><span className="font-medium">Email:</span> {userFound.email}</p>
                            <p><span className="font-medium">CMND/CCCD:</span> {userFound.citizenId}</p>
                            <p><span className="font-medium">Số điện thoại:</span> {userFound.phoneNumber || 'Không có'}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Hủy
                    </button>

                    {userFound && (
                        <button
                            onClick={handleAddCandidate}
                            disabled={loading || !userFound}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Thêm vào kỳ thi'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCandidateModal;
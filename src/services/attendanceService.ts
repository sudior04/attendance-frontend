import { API_URL } from "./authService";
import { getAuthToken, handleTokenExpiration, apiRequest } from "./authService";
import { Exam, getExams } from "./examService";
import { User } from "./userService";

export interface Attendance {
    id: string;
    candidate: User;
    exam: Exam;
    time: string;
    verified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
}

export interface CheckInDTO {
    userId: string;
    examId: string;
    time: string;
    verified?: boolean;
    notes?: string;
}

export const getAttendanceInExam = async (examId: string): Promise<Attendance[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login'; // Redirect to login if no token
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/attendance/examId=${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include', // Ensure cookies are sent if needed
        });

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách điểm danh thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin điểm danh:", error);
        throw error;
    }
};

/**
 * Create a new attendance record (check in)
 */
export const createAttendance = async (checkInData: CheckInDTO): Promise<Attendance> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(checkInData),
        });

        if (!response.ok) {
            if (handleTokenExpiration(response)) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Đã tạo điểm danh thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi tạo điểm danh:", error);
        throw error;
    }
};

/**
 * Get all attendance records
 */
export const getAllAttendances = async (): Promise<Attendance[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/attendance`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (handleTokenExpiration(response)) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy tất cả dữ liệu điểm danh:", error);
        throw error;
    }
};

/**
 * Verify an attendance record
 */
export const verifyAttendance = async (attendanceId: string, verified: boolean, notes?: string): Promise<Attendance> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/attendance/${attendanceId}/verify`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ verified, notes }),
        });

        if (!response.ok) {
            if (handleTokenExpiration(response)) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Đã cập nhật trạng thái xác minh điểm danh:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi xác minh điểm danh:", error);
        throw error;
    }
};
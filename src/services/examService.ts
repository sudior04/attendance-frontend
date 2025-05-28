import { API_URL, getAuthToken, handleTokenExpiration, logout } from './authService';
import { Schedule } from './scheduleService';
import { Room } from './roomService';

export interface Exam {
    examId: string;
    name: string;
    date?: string;
    status?: string;
    subject: string;
    semester: string;
    schedule: Schedule;
    room: Room;
}

export const getExams = async (): Promise<Exam[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            // Redirect to login if no token
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/exam`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách kỳ thi thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin kỳ thi:", error);
        throw error;
    }
};

export const getExamById = async (id: string): Promise<Exam> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/exam/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching exam with id ${id}:`, error);
        throw error;
    }
};

export const createExam = async (exam: Omit<Exam, 'id'>): Promise<Exam> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/exam`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(exam),
        });

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating exam:", error);
        throw error;
    }
};

export const updateExam = async (id: string, exam: Partial<Exam>): Promise<Exam> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/exam/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(exam),
        });

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                throw new Error('Không tìm thấy kỳ thi. Kỳ thi có thể đã bị xóa hoặc không tồn tại.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi khi cập nhật kỳ thi: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error updating exam with id ${id}:`, error);
        throw error;
    }
};

export const deleteExam = async (id: string): Promise<void> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/exam/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                throw new Error('Không tìm thấy kỳ thi. Kỳ thi có thể đã bị xóa hoặc không tồn tại.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi khi xóa kỳ thi: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error deleting exam with id ${id}:`, error);
        throw error;
    }
};
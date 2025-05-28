import { API_URL } from "./authService";
import { getAuthToken, handleTokenExpiration } from "./authService";

export interface Schedule {
    scheduleId: string;
    startTime: string;
    endTime: string;
    name: string;
}

export const getSchedules = async (): Promise<Schedule[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login'; // Redirect to login if no token
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/schedule`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include', // Đảm bảo gửi cookie nếu cần
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
        console.log("Lấy danh sách lịch thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch:", error);
        throw error;
    }
};
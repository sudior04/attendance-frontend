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
        console.log('Fetching schedules...');
        const token = getAuthToken();
        if (!token) {
            console.error('No auth token found');
            window.location.href = '/login'; // Redirect to login if no token
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        } console.log(`API URL: ${API_URL}/schedule`);
        const response = await fetch(`${API_URL}/schedules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Đảm bảo gửi cookie nếu cần
        });

        console.log('Schedule API response status:', response.status);

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách lịch thành công:", data);

        // Verify the structure of the returned data
        if (Array.isArray(data)) {
            console.log(`Retrieved ${data.length} schedules`);
            data.forEach((schedule, index) => {
                console.log(`Schedule ${index + 1}:`,
                    schedule.scheduleId,
                    schedule.name,
                    schedule.startTime,
                    schedule.endTime
                );
            });
        } else {
            console.warn('Schedule data is not an array:', data);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch:", error);
        throw error;
    }
};
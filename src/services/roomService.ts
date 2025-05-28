import { API_URL, getAuthToken } from "./authService";

export interface Room {
    roomId: string;
    name: string;
    building: string;
}

export const getRooms = async (): Promise<Room[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login'; // Redirect to login if no token
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await fetch(`${API_URL}/room`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include', // Đảm bảo gửi cookie nếu cần
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Handle token expiration
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách phòng thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
        throw error;
    }
};
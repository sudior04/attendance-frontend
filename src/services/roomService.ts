import { API_URL, getAuthToken } from "./authService";

export interface Room {
    roomId: string;
    name: string;
    building: string;
}

export const getRooms = async (): Promise<Room[]> => {
    try {
        console.log('Fetching rooms...');
        const token = getAuthToken();
        if (!token) {
            console.error('No auth token found');
            window.location.href = '/login'; // Redirect to login if no token
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        console.log(`API URL: ${API_URL}/room`);
        const response = await fetch(`${API_URL}/room`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Đảm bảo gửi cookie nếu cần
        });

        console.log('Room API response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                // Handle token expiration
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách phòng thành công:", data);

        // Verify the structure of the returned data
        if (Array.isArray(data)) {
            console.log(`Retrieved ${data.length} rooms`);
            data.forEach((room, index) => {
                console.log(`Room ${index + 1}:`,
                    room.roomId,
                    room.name,
                    room.building
                );
            });
        } else {
            console.warn('Room data is not an array:', data);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
        throw error;
    }
};
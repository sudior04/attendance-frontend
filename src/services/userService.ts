import { API_URL, getAuthToken } from './authService';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    birth?: string;
    citizenId?: string;
    role?: string; // Thêm trường role để chọn vai trò ADMIN hoặc CANDIDATE
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    birth?: string;
    citizenId?: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}

/**
 * Đăng ký tài khoản mới
 */
export const register = async (data: RegisterRequest): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include', // Thêm để hỗ trợ gửi và nhận cookie
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng ký thất bại.');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Lỗi khi gọi API đăng ký:', error);
        throw error;
    }
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
            credentials: 'include', // Thêm để hỗ trợ gửi và nhận cookie
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        throw error;
    }
};

/**
 * Lấy thông tin người dùng
 */
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include', // Thêm để hỗ trợ gửi và nhận cookie
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw error;
    }
};
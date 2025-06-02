import { API_URL, getAuthToken, handleTokenExpiration } from './authService';


export interface User {
    userId: string;
    name: string;
    email: string;
    birth?: string;
    citizenId?: string;
    role: string;
    phoneNumber?: string;
}

/**
 * Cập nhật thông tin người dùng
 */
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        } const response = await fetch(`${API_URL}/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
            credentials: 'include', // Thêm để hỗ trợ gửi và nhận cookie
        });

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

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
export const getUserProfile = async (): Promise<User> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        } const response = await fetch(`${API_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include', // Thêm để hỗ trợ gửi và nhận cookie
        });

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw error;
    }
}

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        } const response = await fetch(`${API_URL}/user/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include', // Nếu backend dùng cookie
        });

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        return await response.json(); // Nên là mảng người dùng
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        throw error;
    }

};

/**
 * Tìm kiếm người dùng theo CMND/CCCD
 * @param citizenId CCCD của người dùng cần tìm
 * @returns Người dùng tìm thấy hoặc null nếu không tìm thấy
 */
export const searchUserByCitizenId = async (citizenId: string): Promise<User | null> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/user/citizen-id/${citizenId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Handle token expiration
            if (handleTokenExpiration(response)) {
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                return null;
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Vì API trả về List<UserDTO>, cần lấy phần tử đầu tiên nếu có
        return result;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm người dùng theo CCCD:', error);
        throw error;
    }
};

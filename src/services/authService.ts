import Cookies from 'js-cookie';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    expiresIn: number;
    tokenType: string;
    message: string;
    authentication: {
        token: string;
        type: string;
        id: string;
        name: string;
        email: string;
        role: string;
    };
    refreshToken: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Cookie options
const TOKEN_COOKIE_NAME = 'auth_token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const USER_INFO_STORAGE_KEY = 'user_info';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng nhập thất bại.');
        }

        const data: LoginResponse = await response.json();

        // Calculate expiration in days (convert seconds to days)
        const expirationInDays = data.expiresIn / (60 * 60 * 24);

        // Save auth token to cookie
        Cookies.set(TOKEN_COOKIE_NAME, data.authentication.token, {
            expires: expirationInDays,
            secure: true,
            sameSite: 'strict'
        });

        // Save refresh token to cookie
        Cookies.set(REFRESH_TOKEN_COOKIE_NAME, data.refreshToken, {
            expires: 30, // 30 days for refresh token
            secure: true,
            sameSite: 'strict'
        });

        // Save user info to localStorage
        localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify({
            id: data.authentication.id,
            name: data.authentication.name,
            email: data.authentication.email,
            role: data.authentication.role
        }));

        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
};

export const logout = () => {
    // Clear cookies
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);

    // Clear localStorage
    localStorage.removeItem(USER_INFO_STORAGE_KEY);
};

export const getAuthToken = (): string | null => {
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
};

export const getRefreshToken = (): string | null => {
    return Cookies.get(REFRESH_TOKEN_COOKIE_NAME) || null;
};

export const getUserFromStorage = () => {
    try {
        const userInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

// Function to make authenticated API requests
export const apiRequest = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    // Đảm bảo url có định dạng đúng
    const apiUrl = url.startsWith('/') ? `${API_URL}${url}` : `${API_URL}/${url}`;

    console.log(`Đang gọi API: ${apiUrl}`, { method: options.method || 'GET' });

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(apiUrl, {
            ...options,
            headers
        });

        console.log(`Kết quả API call: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            // Handle 401 Unauthorized - possible token expired
            if (response.status === 401) {
                console.error('Token hết hạn hoặc không hợp lệ');
                logout();
                window.location.href = '/login';
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json().catch(() => ({}));
            console.error('API trả về lỗi:', errorData);
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};
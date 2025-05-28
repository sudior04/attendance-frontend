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

// Export API_URL để các service khác có thể sử dụng
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Cookie options - Cập nhật tên cookie cho phù hợp với response từ server
const TOKEN_COOKIE_NAME = 'access_token'; // Thay đổi tên cookie từ 'auth_token' thành 'access_token'
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
            credentials: 'include', // Quan trọng: cho phép gửi và nhận cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng nhập thất bại.');
        }

        const data: LoginResponse = await response.json();

        // Kiểm tra role, chỉ cho phép ADMIN đăng nhập
        if (data.authentication.role !== 'ADMIN') {
            // Nếu không phải ADMIN, không lưu thông tin và ném lỗi
            throw new Error('Bạn không có quyền truy cập. Chỉ ADMIN mới được phép đăng nhập.');
        }

        // Không cần thiết lập cookies vì server đã thiết lập HttpOnly cookie
        // Nhưng chúng ta vẫn lưu thông tin người dùng vào localStorage
        localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify({
            id: data.authentication.id,
            name: data.authentication.name,
            email: data.authentication.email,
            role: data.authentication.role,
            token: data.authentication.token // Lưu token vào localStorage để sử dụng khi cần
        }));

        // Lưu token vào localStorage như một phương án dự phòng
        localStorage.setItem(TOKEN_COOKIE_NAME, data.authentication.token);
        if (data.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_COOKIE_NAME, data.refreshToken);
        }

        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Tài khoản hoặc mật khẩu không đúng.');
        }
    }
};

export const logout = () => {
    // Gọi API để đăng xuất từ server (nếu có)
    fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Quan trọng để gửi cookie hiện tại
    }).catch(error => {
        console.error('Lỗi khi đăng xuất:', error);
    });

    // Clear localStorage
    localStorage.removeItem(USER_INFO_STORAGE_KEY);
    localStorage.removeItem(TOKEN_COOKIE_NAME);
    localStorage.removeItem(REFRESH_TOKEN_COOKIE_NAME);
};

export const getAuthToken = (): string | null => {
    // Không thể truy cập cookie HttpOnly từ JavaScript
    // Nên chúng ta sử dụng token đã lưu trong localStorage
    const userInfo = getUserFromStorage();
    if (userInfo && userInfo.token) return userInfo.token;

    return localStorage.getItem(TOKEN_COOKIE_NAME);
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

export const isAdmin = (): boolean => {
    const user = getUserFromStorage();
    return !!user && user.role === 'ADMIN';
};

// New helper function to check token expiration and handle redirection
export const handleTokenExpiration = (response: Response): boolean => {
    if (response.status === 401) {
        console.error('Token hết hạn hoặc không hợp lệ');
        logout();
        window.location.href = '/login';

        // Dispatch a custom event that token has expired
        window.dispatchEvent(new CustomEvent('tokenExpired'));

        return true;
    }
    return false;
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
            headers,
            credentials: 'include', // Thêm tùy chọn này để gửi cookies trong yêu cầu
        });
        console.log(`Kết quả API call: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            // Handle 401 Unauthorized - possible token expired
            if (handleTokenExpiration(response)) {
                // Dispatch a custom event that token has expired
                window.dispatchEvent(new CustomEvent('tokenExpired'));
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

// Add a token validation utility
export const validateToken = async (): Promise<boolean> => {
    const token = getAuthToken();

    if (!token) {
        return false;
    }

    try {
        // Make a lightweight API call to validate the token
        const response = await fetch(`${API_URL}/user/validate-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // If unauthorized, clear auth data and return false
            if (response.status === 401) {
                logout();
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

// Function to setup automatic token validation interval
export const setupTokenValidation = (interval = 60000): number => {
    // Check token every minute (or as specified)
    const intervalId = window.setInterval(async () => {
        const isValid = await validateToken();
        if (!isValid && window.location.pathname !== '/login') {
            console.log('Token expired, redirecting to login');
            window.location.href = '/login';
        }
    }, interval);

    return intervalId;
};

// Function to clear token validation interval
export const clearTokenValidation = (intervalId: number): void => {
    window.clearInterval(intervalId);
};
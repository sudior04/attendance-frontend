import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    getAuthToken,
    getUserFromStorage,
    isAuthenticated as checkIsAuthenticated,
    logout as authLogout,
    API_URL
} from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    logout: () => void;
    checkTokenExpiration: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    logout: () => { },
    checkTokenExpiration: async () => false,
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
    const [user, setUser] = useState<any | null>(getUserFromStorage());
    const navigate = useNavigate();

    useEffect(() => {
        // Update auth state when component mounts
        setIsAuthenticated(checkIsAuthenticated());
        setUser(getUserFromStorage());

        // Listen for storage events (for multi-tab logout)
        const handleStorageChange = () => {
            const isAuth = checkIsAuthenticated();
            setIsAuthenticated(isAuth);
            setUser(isAuth ? getUserFromStorage() : null);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const logout = () => {
        authLogout();
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    }; const checkTokenExpiration = async (): Promise<boolean> => {
        const token = getAuthToken();
        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }

        try {
            // Make a lightweight API call to validate the token
            const response = await fetch(`${API_URL}/auth/validate-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            // If token is no longer valid
            if (!response.ok) {
                console.warn('Token validation failed:', response.status);

                if (response.status === 401) {
                    logout();
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error during token validation:', error);
            // If we can't reach the server, keep the user logged in
            // They'll be logged out when they try to make a real request
            return true;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, logout, checkTokenExpiration }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

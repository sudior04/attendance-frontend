import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupTokenValidation, clearTokenValidation } from '../services/authService';

/**
 * Custom hook to handle token validation
 * @param interval - Interval in milliseconds to check token validity (default: 60000 - 1 minute)
 */
export const useTokenValidation = (interval = 60000) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Set up token validation interval
        const intervalId = setupTokenValidation(interval);

        // Handle token expiration with navigation
        const handleTokenExpired = () => {
            navigate('/login');
        };

        // Add event listener for token expiration
        window.addEventListener('tokenExpired', handleTokenExpired);

        // Clean up when component unmounts
        return () => {
            clearTokenValidation(intervalId);
            window.removeEventListener('tokenExpired', handleTokenExpired);
        };
    }, [navigate, interval]);
};

export default useTokenValidation;

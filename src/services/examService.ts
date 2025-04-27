import Cookies from 'js-cookie';

export interface Exam {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getExams = async (): Promise<Exam[]> => {
    try {
        const token = Cookies.get('auth_token');
        const response = await fetch(`${API_URL}/exam`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Không thể lấy danh sách kỳ thi');
        }

        return response.json();
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getExamById = async (id: string): Promise<Exam> => {
    try {
        const token = Cookies.get('auth_token');
        const response = await fetch(`${API_URL}/exams/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin kỳ thi');
        }

        return response.json();
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};
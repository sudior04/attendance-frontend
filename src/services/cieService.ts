import { API_URL, getAuthToken, handleTokenExpiration } from './authService';

// Interface định nghĩa cấu trúc dữ liệu của CandidateInExamDTO
export interface CandidateInExamDTO {
    id: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    candidateCitizenId: string;
    examId: string;
    examName: string;
}

// Interface định nghĩa dữ liệu cần thiết để tạo mới một CandidateInExam
export interface CreateCandidateInExamDTO {
    candidateId: string;
    examId: string;
}

/**
 * Lấy tất cả các bản ghi thí sinh - kỳ thi
 * @returns Danh sách DTO các bản ghi thí sinh - kỳ thi
 */
export const getAllCandidateInExams = async (): Promise<CandidateInExamDTO[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lấy danh sách thí sinh - kỳ thi thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thí sinh - kỳ thi:", error);
        throw error;
    }
};

/**
 * Lấy chi tiết một bản ghi theo ID
 * @param id ID của bản ghi thí sinh - kỳ thi
 * @returns DTO của bản ghi thí sinh - kỳ thi
 */
export const getCandidateInExamById = async (id: string): Promise<CandidateInExamDTO> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                throw new Error('Không tìm thấy bản ghi thí sinh - kỳ thi.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Lỗi khi lấy bản ghi thí sinh - kỳ thi với id ${id}:`, error);
        throw error;
    }
};

/**
 * Lấy danh sách thí sinh theo kỳ thi
 * @param examId ID của kỳ thi
 * @returns Danh sách DTO các thí sinh trong kỳ thi
 */
export const getCandidatesByExamId = async (examId: string): Promise<CandidateInExamDTO[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam/exam/${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Lấy danh sách thí sinh trong kỳ thi ${examId} thành công:`, data);
        return data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách thí sinh trong kỳ thi ${examId}:`, error);
        throw error;
    }
};

/**
 * Lấy danh sách kỳ thi của một thí sinh
 * @param candidateId ID của thí sinh
 * @returns Danh sách DTO các kỳ thi của thí sinh
 */
export const getExamsByCandidate = async (candidateId: string): Promise<CandidateInExamDTO[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam/candidate/${candidateId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Lấy danh sách kỳ thi của thí sinh ${candidateId} thành công:`, data);
        return data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách kỳ thi của thí sinh ${candidateId}:`, error);
        throw error;
    }
};

/**
 * Thêm thí sinh vào kỳ thi
 * @param candidateId ID của thí sinh
 * @param examId ID của kỳ thi
 * @returns DTO của bản ghi thí sinh - kỳ thi đã được tạo
 */
export const createCandidateInExam = async (candidateId: string, examId: string): Promise<CandidateInExamDTO> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const createDto: CreateCandidateInExamDTO = {
            candidateId,
            examId
        };

        const response = await fetch(`${API_URL}/candidates-in-exam`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(createDto),
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 400) {
                throw new Error('Dữ liệu không hợp lệ hoặc thí sinh đã được thêm vào kỳ thi này.');
            }

            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Đã thêm thí sinh ${candidateId} vào kỳ thi ${examId} thành công:`, data);
        return data;
    } catch (error) {
        console.error(`Lỗi khi thêm thí sinh ${candidateId} vào kỳ thi ${examId}:`, error);
        throw error;
    }
};

/**
 * Xóa một bản ghi thí sinh - kỳ thi theo ID
 * @param id ID của bản ghi thí sinh - kỳ thi
 */
export const deleteCandidateInExam = async (id: string): Promise<void> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                throw new Error('Không tìm thấy bản ghi thí sinh - kỳ thi.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        console.log(`Đã xóa bản ghi thí sinh - kỳ thi ${id} thành công.`);
    } catch (error) {
        console.error(`Lỗi khi xóa bản ghi thí sinh - kỳ thi ${id}:`, error);
        throw error;
    }
};

/**
 * Xóa thí sinh khỏi kỳ thi
 * @param candidateId ID của thí sinh
 * @param examId ID của kỳ thi
 */
export const removeCandidateFromExam = async (candidateId: string, examId: string): Promise<void> => {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch(`${API_URL}/candidates-in-exam/candidate/${candidateId}/exam/${examId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (response.status === 404) {
                throw new Error('Không tìm thấy thí sinh hoặc kỳ thi.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
        }

        console.log(`Đã xóa thí sinh ${candidateId} khỏi kỳ thi ${examId} thành công.`);
    } catch (error) {
        console.error(`Lỗi khi xóa thí sinh ${candidateId} khỏi kỳ thi ${examId}:`, error);
        throw error;
    }
};
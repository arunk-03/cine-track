import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request logging
api.interceptors.request.use((config) => {
    console.log('Request:', config);
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response logging
api.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error) => {
        console.error('Error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const getWatchlist = async () => {
    try {
        const response = await api.get('/users/watchlist');
        console.log('Fetched watchlist:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        throw error;
    }
};

const addToWatchlist = async (movie) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Sending to API:', movie); // Debug log

        const response = await api.post('/users/watchlist', { movie }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API Response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

const removeFromWatchlist = async (movieId) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await api.delete(`/users/watchlist/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw error;
    }
};

const updateRating = async (movieId, rating) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Sending rating update:', { movieId, rating }); // Add logging

        const response = await api.patch(`/users/watchlist/${movieId}/rating`, 
            { rating: Number(rating) }, // Ensure rating is a number
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Rating update response:', response.data); // Add logging
        return response.data;
    } catch (error) {
        console.error('Error updating rating:', error);
        console.error('Error details:', error.response?.data); // Add detailed error logging
        throw error;
    }
};

const updateReview = async (movieId, review) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await api.patch(`/users/watchlist/${movieId}/review`, 
            { review },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating review:', error);
        throw error;
    }
};

const addToBacklog = async (movieData) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Sending movie data:', movieData); // Debug log

        const response = await api.post('/users/backlog', { movie: movieData }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const removeFromBacklog = async (movieId) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await api.delete(`/users/backlog/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing from backlog:', error);
        throw error;
    }
};

export { api as default, getWatchlist, addToWatchlist, removeFromWatchlist, updateRating, updateReview, addToBacklog, removeFromBacklog };
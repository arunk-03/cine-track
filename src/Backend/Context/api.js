import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    retry: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    }
});


api.interceptors.request.use((config) => {
   
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response logging
api.interceptors.response.use(
    (response) => {
       
        return response;
    },
    async (error) => {
        console.error('Error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        const { config, message } = error;
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        config._retryCount = config._retryCount || 0;

        if (config._retryCount >= config.retry) {
            return Promise.reject(error);
        }

        config._retryCount += 1;
       

        // Create new promise to handle retry
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(api(config));
            }, config.retryDelay(config._retryCount));
        });
    }
);

const getWatchlist = async () => {
    try {
        const response = await api.get('/users/watchlist');
        
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

       


        const response = await api.post('/users/watchlist', { movie }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
      
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

       

        const response = await api.patch(`/users/watchlist/${movieId}/rating`, 
            { rating: Number(rating) }, // Ensure rating is a number
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
       
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
import React, { createContext, useState, useEffect } from 'react';
import api from './api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
            setError(null);
        } catch (error) {
            setUser(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        
        try {
            // Validate credentials before sending
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await api.post('/users/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                if (!response.data.user) {
                    throw new Error('User data missing from response');
                }
                
                setUser(response.data.user);
                return { 
                    success: true,
                    user: response.data.user
                };
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            // Enhanced error handling
            let errorMessage = 'An error occurred during login';
            
            if (error.response) {
                // Server responded with an error status
                if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (error.response.status === 404) {
                    errorMessage = 'Login service not found';
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your internet connection.';
            } else {
                // Something else caused an error
                errorMessage = error.message || errorMessage;
            }
            
            console.error('Login Error:', {
                message: errorMessage,
                details: error.response?.data,
                status: error.response?.status
            });
            
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage,
                status: error.response?.status || 'ERROR'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
            setError('Error during logout');
        }
    };

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Provide loading and error states to consumers
    return (
        <UserContext.Provider value={{ 
            user, 
            loading, 
            error,
            login, 
            logout,
            setError // Allow consumers to reset error state
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
import React, { createContext, useState, useEffect } from 'react';
import api from './api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/users/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                setUser(response.data.user);
                return true;
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
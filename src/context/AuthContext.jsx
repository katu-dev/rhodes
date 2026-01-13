
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    // Try to fetch fresh profile
                    const res = await fetch('http://localhost:3001/api/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        // Update local storage just in case (optional, but keeps basic data sync)
                        localStorage.setItem('auth_username', userData.username);
                        localStorage.setItem('auth_userid', userData.id);
                    } else {
                        // Fallback to local storage if server fails?
                        loadFromStorage();
                    }
                } catch (e) {
                    console.error("Failed to fetch profile", e);
                    loadFromStorage();
                }
            }
            setLoading(false);
        };

        const loadFromStorage = () => {
            const savedUsername = localStorage.getItem('auth_username');
            const savedId = localStorage.getItem('auth_userid');
            if (savedUsername && savedId) {
                setUser({ username: savedUsername, id: savedId }); // Note: No ELO here
            }
        };

        fetchProfile();
    }, [token]);

    const login = (userData, authToken) => {
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_username', userData.username);
        localStorage.setItem('auth_userid', userData.id);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_userid');
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

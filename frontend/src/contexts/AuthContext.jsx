import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api'; // Usaremos esta instancia de axios configurada

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken')); // Leer token al inicio
    const [loading, setLoading] = useState(true);

    // Configurar el token en la instancia de axios al cargar o cambiar el token
    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser(); // Intentar obtener el usuario si hay un token
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await apiClient.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            setUser(null); // Si el token es inválido o expiró
            setToken(null);
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiClient.post('/login', credentials);
            const newToken = response.data.token;
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            await fetchUser(); // Obtener el usuario después de un login exitoso
            return true;
        } catch (error) {
            console.error('Error de inicio de sesión:', error.response?.data || error.message);
            throw error; // Re-lanza el error para que el componente de login lo maneje
        }
    };

    const register = async (userData) => {
        try {
            await apiClient.post('/register', userData);
            // Después del registro, puedes optar por loguearlo automáticamente
            // o redirigirlo a la página de login
            // await login({ email: userData.email, password: userData.password });
            return true;
        } catch (error) {
            console.error('Error de registro:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout'); // Avisar a Laravel para invalidar el token
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
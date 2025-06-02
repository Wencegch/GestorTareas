import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api'; // Asegúrate de que este es tu apiClient configurado

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    // Efecto para inicializar el token en Axios cuando la aplicación carga
    // o cuando el token cambia (ej. al cerrar sesión)
    useEffect(() => {
        if (token) {
            // Establece el token en las cabeceras por defecto de Axios
            // Esto asegura que fetchUser y cualquier otra petición use este token
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            // Limpiar el token de las cabeceras si no hay token
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]); // Dependencia del token

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Error al obtener el usuario con token:', error);
            setUser(null);
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
            setToken(newToken); // Actualiza el estado del token
            localStorage.setItem('authToken', newToken); // Guarda en localStorage

            // *** ESTO ES CLAVE PARA LA CONDICIÓN DE CARRERA ***
            // Establece el token directamente en las cabeceras por defecto de Axios
            // para que la siguiente llamada (fetchUser o a /tasks) lo use inmediatamente.
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // La llamada a fetchUser() ahora debería usar el token recién establecido.
            await fetchUser();
            return true;
        } catch (error) {
            console.error('Error de inicio de sesión:', error.response?.data || error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiClient.post('/register', userData);
            if (response.data.token) {
                const newToken = response.data.token;
                setToken(newToken);
                localStorage.setItem('authToken', newToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // También para el registro
                await fetchUser();
            } else {
                // Si el registro no devuelve token, pero esperas auto-login,
                // deberías llamar a `login` después del registro
                await login({ email: userData.email, password: userData.password });
            }
            return true;
        } catch (error) {
            console.error('Error de registro:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            // Asegurarse de limpiar el token de las cabeceras de Axios al cerrar sesión
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
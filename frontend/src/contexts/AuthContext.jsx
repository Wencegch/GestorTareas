import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api';
/**
 * @fileoverview Este módulo define el contexto de autenticación para la aplicación.
 * Permite gestionar el estado del usuario, el token de autenticación,
 * y las funciones para iniciar sesión, registrarse y cerrar sesión.
 */

// Crea el contexto de autenticación. Este será utilizado por los componentes hijos
// para acceder a los valores de autenticación.
const AuthContext = createContext();

/**
 * @component AuthProvider
 * @description Componente proveedor del contexto de autenticación. Envuelve la aplicación
 * o una parte de ella para proporcionar acceso a los estados y funciones de autenticación.
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
export const AuthProvider = ({ children }) => {
    // Estado para el usuario autenticado (inicialmente nulo).
    const [user, setUser] = useState(null);
    // Estado para el token de autenticación, inicializado desde el localStorage.
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    // Estado para indicar si la autenticación está en proceso de carga o verificación.
    const [loading, setLoading] = useState(true);

    /**
     * @hook useEffect
     * @description Este efecto se ejecuta cada vez que el `token` cambia.
     * Se encarga de configurar las cabeceras de autorización de Axios y de intentar
     * obtener la información del usuario si hay un token presente.
     */
    useEffect(() => {
        if (token) {
            // Si existe un token, se establece en las cabeceras por defecto de Axios
            // para todas las peticiones futuras que usen apiClient.
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser(); // Intenta obtener los datos del usuario con el token existente.
        } else {
            // Si no hay token, se elimina la cabecera de autorización de Axios.
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null); // Borra el usuario del estado.
            setLoading(false); // Finaliza el estado de carga.
        }
    }, [token]); // Dependencia: el efecto se ejecuta cuando 'token' cambia.

    /**
     * @function fetchUser
     * @description Función asíncrona para obtener la información del usuario autenticado
     * desde la API. Se usa para verificar la validez del token y cargar los datos del usuario.
     */
    const fetchUser = async () => {
        try {
            setLoading(true); // Inicia el estado de carga.
            const response = await apiClient.get('/user'); // Petición GET al endpoint /user.
            setUser(response.data); // Almacena los datos del usuario en el estado.
        } catch (error) {
            console.error('Error al obtener el usuario con token:', error);
            setUser(null); // Si falla, borra el usuario del estado.
            setToken(null); // Borra el token del estado.
            localStorage.removeItem('authToken'); // Elimina el token del almacenamiento local.
        } finally {
            setLoading(false); // Finaliza el estado de carga.
        }
    };

    /**
     * @function login
     * @description Función asíncrona para iniciar sesión. Envía las credenciales al backend,
     * guarda el token recibido y establece al usuario.
     * @param {object} credentials - Objeto con las credenciales del usuario (ej. { email, password }).
     * @returns {Promise<boolean>} - True si el login fue exitoso.
     * @throws {Error} Si el inicio de sesión falla.
     */
    const login = async (credentials) => {
        try {
            const response = await apiClient.post('/login', credentials); // Petición POST a /login.
            const newToken = response.data.token; // Extrae el nuevo token de la respuesta.
            setToken(newToken); // Actualiza el estado del token.
            localStorage.setItem('authToken', newToken); // Guarda el token en localStorage.

            // Establece el nuevo token en las cabeceras de Axios para futuras peticiones.
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            await fetchUser(); // Obtiene los datos del usuario recién autenticado.
            return true; // Indica que el inicio de sesión fue exitoso.
        } catch (error) {
            console.error('Error de inicio de sesión:', error.response?.data || error.message);
            throw error; // Propaga el error para que sea manejado por el componente que llama.
        }
    };

    /**
     * @function register
     * @description Función asíncrona para registrar un nuevo usuario. Envía los datos del usuario
     * al backend. Si el registro devuelve un token, lo gestiona como un login automático.
     * @param {object} userData - Objeto con los datos del usuario para el registro.
     * @returns {Promise<boolean>} - True si el registro (y posible auto-login) fue exitoso.
     * @throws {Error} Si el registro falla.
     */
    const register = async (userData) => {
        try {
            const response = await apiClient.post('/register', userData); // Petición POST a /register.
            if (response.data.token) {
                // Si la respuesta incluye un token, se considera un auto-login.
                const newToken = response.data.token;
                setToken(newToken);
                localStorage.setItem('authToken', newToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                await fetchUser();
            } else {
                // Si el backend no devuelve un token, se intenta un login explícito
                // usando las credenciales proporcionadas para el registro.
                await login({ email: userData.email, password: userData.password });
            }
            return true; // Indica que el registro fue exitoso.
        } catch (error) {
            console.error('Error de registro:', error.response?.data || error.message);
            throw error; // Propaga el error.
        }
    };

    /**
     * @function logout
     * @description Función asíncrona para cerrar la sesión del usuario. Realiza una petición
     * al backend para invalidar el token, luego limpia el estado local y el almacenamiento.
     */
    const logout = async () => {
        try {
            await apiClient.post('/logout'); // Petición POST a /logout (opcional, para invalidar el token en el servidor).
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setToken(null); // Borra el token del estado.
            setUser(null); // Borra el usuario del estado.
            localStorage.removeItem('authToken'); // Elimina el token del almacenamiento local.
            // Asegura que el token se elimine de las cabeceras de Axios para evitar el envío de tokens inválidos.
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    // Renderiza el AuthContext.Provider, haciendo que los valores de autenticación
    // estén disponibles para todos los componentes hijos que lo consuman.
    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchUser }}>
            {children} {/* Los componentes hijos se renderizan aquí */}
        </AuthContext.Provider>
    );
};

/**
 * @hook useAuth
 * @description Hook personalizado para consumir el contexto de autenticación de forma sencilla.
 * Proporciona acceso a `user`, `token`, `loading`, `login`, `register`, `logout` y `fetchUser`.
 * @returns {object} Un objeto que contiene el estado y las funciones de autenticación.
 */
export const useAuth = () => useContext(AuthContext);
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost/api',
    withCredentials: true, // Esto es importante para que Laravel Sanctum maneje las cookies CSRF
});

// Interceptor para añadir el token a cada petición saliente
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 (No autorizado) globalmente
apiClient.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            // Puedes forzar un logout si el token es inválido/expiró
            // Esto es una simplificación, en producción manejarías refresco de tokens, etc.
            if (localStorage.getItem('authToken')) {
                console.warn('Token expirado o inválido. Cerrando sesión automáticamente.');
                localStorage.removeItem('authToken');
                // Puedes disparar un evento o usar un Context para actualizar el estado global de auth
                // window.location.href = '/login'; // O una navegación más suave
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
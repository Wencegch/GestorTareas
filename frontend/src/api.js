import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost/api', // La URL de tu API Laravel
    withCredentials: false, //En false porque no dependemos de cookies de sesión para la autenticación.
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Interceptor de solicitud: Añade el token Bearer a cada petición saliente.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Obtiene el token de localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Establece el encabezado Authorization
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta (opcional pero recomendado para manejar errores de autenticación globalmente)
apiClient.interceptors.response.use(
    response => response,
    error => {
        // Si el token es inválido o expirado (401 Unauthorized), puedes limpiar el token y redirigir.
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            // Aquí podrías, por ejemplo, redirigir al usuario a la página de login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
// src/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Importa el hook de autenticación

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth(); // Obtén la función de login del contexto
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Resetear errores
        try {
            await login({ email, password });
            navigate('/'); // Redirigir a la lista de tareas al loguearse con éxito
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
            console.error('Error de login:', err);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                        Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
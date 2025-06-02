import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null);
    const { register, login } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            // Iniciar sesión automáticamente después del registro
            await login({ email, password });
            navigate('/'); // Redirigir a la lista de tareas
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(`Error al registrarse: ${errorMessage}`);
            console.error('Error de registro:', err);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">Registrarse</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                        Nombre:
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                        Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password_confirmation" className="block text-gray-300 text-sm font-bold mb-2">
                        Confirmar Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        className="shadow appearance-none border rounded w-full py-2 px-3  mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>} {/* Centrado el error */}
                <div className="flex items-center justify-center"> {/* Cambiado a justify-center */}
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full" // Añadido w-full para que ocupe todo el ancho
                    >
                        Registrarse
                    </button>
                </div>
            </form>

            {/* Nuevo: Enlace para volver a Iniciar Sesión */}
            <p className="text-center text-gray-400 text-sm mt-4">
                ¿Ya tienes cuenta? {' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold underline">
                    Iniciar Sesión
                </Link>
            </p>
        </div>
    );
}

export default RegisterForm;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api';

function UserProfileForm() {
    const { user, fetchUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setErrors({});

        try {
            const data = { name, email };

            // Si se ha proporcionado una nueva contraseña
            if (password) {
                data.password = password;
                data.password_confirmation = passwordConfirmation;
                data.password_current = currentPassword;
            }

            const response = await apiClient.put('/user/profile', data);

            setMessage(response.data.message);
            // Limpia los campos de contraseña después de un éxito
            setCurrentPassword('');
            setPassword('');
            setPasswordConfirmation('');
            await fetchUser(); // Vuelve a cargar los datos del usuario para asegurar que el AuthContext esté actualizado

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                // Si hay un error de contraseña actual, también se mostrará aquí
            } else {
                setMessage('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
 <div className="bg-gray-800 p-8 rounded-lg shadow-xl mx-auto w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Mi Perfil</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                        Nombre:
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-red-500 text-xs italic">{errors.name[0]}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs italic">{errors.email[0]}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="current_password">
                        Contraseña Actual:
                    </label>
                    <input
                        type="password"
                        id="current_password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    {errors.password_current && <p className="text-red-500 text-xs italic">{errors.password_current[0]}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                        Nueva Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="text-red-500 text-xs italic">{errors.password[0]}</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password_confirmation">
                        Confirmar Nueva Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                </div>

                {message && (
                    <p className={`text-center text-sm font-bold mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full"
                    >
                        Actualizar Perfil
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserProfileForm;
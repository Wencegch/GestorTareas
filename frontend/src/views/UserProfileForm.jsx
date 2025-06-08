import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importa el hook personalizado para la autenticación
import apiClient from '../api'; // Importa la instancia de Axios configurada para la API

/**
 * @fileoverview Este componente `UserProfileForm` permite a los usuarios ver y actualizar
 * su información de perfil, incluyendo nombre, email y contraseña.
 * Utiliza el contexto de autenticación para obtener los datos del usuario y apiClient
 * para interactuar con el backend. Requiere Tailwind CSS para los estilos.
 */

/**
 * @component UserProfileForm
 * @description Componente funcional que renderiza un formulario para gestionar el perfil del usuario.
 * Permite al usuario actualizar su nombre, email y cambiar su contraseña.
 */
function UserProfileForm() {
    // Obtiene el objeto `user` y la función `fetchUser` del contexto de autenticación.
    const { user, fetchUser } = useAuth();

    // Estados para los campos del formulario.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Para la contraseña actual al cambiarla.
    const [password, setPassword] = useState(''); // Para la nueva contraseña.
    const [passwordConfirmation, setPasswordConfirmation] = useState(''); // Para confirmar la nueva contraseña.

    // Estados para mensajes de retroalimentación y errores de validación.
    const [message, setMessage] = useState(null); // Mensajes de éxito o error general.
    const [errors, setErrors] = useState({}); // Errores de validación específicos por campo.

    /**
     * @hook useEffect
     * @description Este efecto se encarga de precargar los campos de nombre y email
     * del formulario con los datos del usuario autenticado cuando el componente se monta
     * o cuando el objeto `user` cambia.
     */
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]); // Dependencia: se ejecuta cuando el objeto `user` cambia.

    /**
     * @function handleSubmit
     * @description Manejador del evento de envío del formulario.
     * Envía los datos del perfil (y opcionalmente la nueva contraseña) al backend
     * para su actualización.
     * @param {Event} e - El evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario.
        setMessage(null); // Limpia cualquier mensaje anterior.
        setErrors({}); // Limpia cualquier error de validación anterior.

        try {
            // Prepara los datos a enviar, incluyendo nombre y email.
            const data = { name, email };

            // Si el usuario ha introducido una nueva contraseña, la incluye en los datos
            // junto con la confirmación y la contraseña actual.
            if (password) {
                data.password = password;
                data.password_confirmation = passwordConfirmation;
                data.password_current = currentPassword; // Requiere la contraseña actual para cambiar la contraseña.
            }

            // Realiza la petición PUT a la API para actualizar el perfil del usuario.
            const response = await apiClient.put('/user/profile', data);

            setMessage(response.data.message); // Muestra el mensaje de éxito del backend.

            // Limpia los campos de contraseña después de una actualización exitosa.
            setCurrentPassword('');
            setPassword('');
            setPasswordConfirmation('');

            // Vuelve a cargar los datos del usuario en el contexto de autenticación
            // para asegurar que la información mostrada en toda la aplicación esté actualizada.
            await fetchUser();

        } catch (error) {
            // Si el error es de validación (código 422), extrae los errores específicos.
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                // Para otros tipos de errores, muestra un mensaje general.
                setMessage('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
            }
            console.error('Error al actualizar el perfil:', error); // Log del error completo.
        }
    };

    return (
        // Contenedor principal del formulario con estilos de Tailwind CSS.
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl mx-auto w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Mi Perfil</h2>
            <form onSubmit={handleSubmit}>
                {/* Campo de entrada para el Nombre */}
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
                    {/* Muestra errores de validación para el nombre */}
                    {errors.name && <p className="text-red-500 text-xs italic">{errors.name[0]}</p>}
                </div>

                {/* Campo de entrada para el Email */}
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
                    {/* Muestra errores de validación para el email */}
                    {errors.email && <p className="text-red-500 text-xs italic">{errors.email[0]}</p>}
                </div>

                {/* Campo de entrada para la Contraseña Actual */}
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
                    {/* Muestra errores de validación para la contraseña actual */}
                    {errors.password_current && <p className="text-red-500 text-xs italic">{errors.password_current[0]}</p>}
                </div>

                {/* Campo de entrada para la Nueva Contraseña */}
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
                    {/* Muestra errores de validación para la nueva contraseña */}
                    {errors.password && <p className="text-red-500 text-xs italic">{errors.password[0]}</p>}
                </div>

                {/* Campo de entrada para Confirmar Nueva Contraseña */}
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

                {/* Muestra mensajes de éxito o error general */}
                {message && (
                    <p className={`text-center text-sm font-bold mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}

                {/* Botón para Actualizar Perfil */}
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
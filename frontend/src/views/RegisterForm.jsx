import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importa el hook personalizado para la autenticación

/**
 * @fileoverview Este componente `RegisterForm` maneja la interfaz de usuario y la lógica
 * para que un nuevo usuario se registre en la aplicación. Permite la entrada de nombre,
 * email, contraseña y confirmación de contraseña, gestionando la validación básica
 * y la comunicación con el contexto de autenticación.
 * Utiliza Tailwind CSS para los estilos.
 */

/**
 * @component RegisterForm
 * @description Componente funcional que renderiza un formulario de registro de usuario.
 * Permite a los usuarios introducir sus datos para crear una nueva cuenta y, si el
 * registro es exitoso, los autentica automáticamente y los redirige.
 */
function RegisterForm() {
    // Estados para almacenar los valores de los campos del formulario.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    // Estado para almacenar mensajes de error que se muestran al usuario.
    const [error, setError] = useState(null);

    // Obtiene las funciones `register` y `login` del contexto de autenticación.
    const { register, login } = useAuth();
    // Hook para la navegación programática, permite redirigir al usuario.
    const navigate = useNavigate();

    /**
     * @function handleSubmit
     * @description Manejador del evento de envío del formulario.
     * Previene el comportamiento por defecto, valida las contraseñas,
     * intenta registrar al usuario y, si es exitoso, lo autentica y redirige.
     * @param {Event} e - El evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el recargado de la página al enviar el formulario.
        setError(null); // Limpia cualquier error previo antes de un nuevo intento.

        // Valida que las contraseñas coincidan antes de enviar el formulario.
        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            return; // Detiene la ejecución si las contraseñas no coinciden.
        }

        try {
            // Llama a la función de registro del contexto de autenticación.
            // Se envía `password_confirmation` porque así lo puede esperar un backend Laravel.
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            
            // Una vez registrado, se intenta iniciar sesión automáticamente con las credenciales.
            // Esto asume que el proceso de registro no devuelve automáticamente un token de sesión utilizable.
            await login({ email, password });
            
            // Si el registro y el inicio de sesión son exitosos, redirige al usuario a la ruta raíz (mis tareas).
            navigate('/');
        } catch (err) {
            // Si hay un error, se extrae el mensaje de la respuesta de la API o se usa el mensaje del error.
            const errorMessage = err.response?.data?.message || err.message;
            setError(`Error al registrarse: ${errorMessage}`); // Muestra un mensaje de error más específico.
            console.error('Error de registro:', err); // Registra el error completo en la consola.
        }
    };

    return (
        // Contenedor principal del formulario, con estilos de Tailwind CSS.
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">Registrarse</h2>
            <form onSubmit={handleSubmit}>
                {/* Campo de entrada para el Nombre */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                        Nombre:
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={name} // Controlado por el estado `name`.
                        onChange={(e) => setName(e.target.value)} // Actualiza el estado al cambiar.
                        required // Campo requerido.
                    />
                </div>
                {/* Campo de entrada para el Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={email} // Controlado por el estado `email`.
                        onChange={(e) => setEmail(e.target.value)} // Actualiza el estado al cambiar.
                        required // Campo requerido.
                    />
                </div>
                {/* Campo de entrada para la Contraseña */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                        Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={password} // Controlado por el estado `password`.
                        onChange={(e) => setPassword(e.target.value)} // Actualiza el estado al cambiar.
                        required // Campo requerido.
                    />
                </div>
                {/* Campo de entrada para Confirmar Contraseña */}
                <div className="mb-6">
                    <label htmlFor="password_confirmation" className="block text-gray-300 text-sm font-bold mb-2">
                        Confirmar Contraseña:
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600"
                        value={passwordConfirmation} // Controlado por el estado `passwordConfirmation`.
                        onChange={(e) => setPasswordConfirmation(e.target.value)} // Actualiza el estado al cambiar.
                        required // Campo requerido.
                    />
                </div>
                {/* Muestra un mensaje de error si el estado `error` no es nulo */}
                {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
                {/* Contenedor para el botón de envío */}
                <div className="flex items-center justify-center">
                    <button
                        type="submit" // Define el botón como tipo submit para el formulario.
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full"
                    >
                        Registrarse
                    </button>
                </div>
            </form>

            {/* Enlace para volver a Iniciar Sesión */}
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
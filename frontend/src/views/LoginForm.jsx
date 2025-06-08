import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importa el hook personalizado para la autenticación

/**
 * @fileoverview Este componente `LoginForm` maneja la interfaz de usuario y la lógica
 * para que un usuario inicie sesión en la aplicación. Permite la entrada de email y contraseña,
 * gestiona el estado del formulario y la comunicación con el contexto de autenticación.
 * Utiliza Tailwind CSS para los estilos.
 */

/**
 * @component LoginForm
 * @description Componente funcional que renderiza un formulario de inicio de sesión.
 * Permite a los usuarios introducir su email y contraseña y envía estos datos
 * al contexto de autenticación para su verificación.
 */
function LoginForm() {
    // Estado para almacenar el valor del campo de email.
    const [email, setEmail] = useState('');
    // Estado para almacenar el valor del campo de contraseña.
    const [password, setPassword] = useState('');
    // Estado para almacenar mensajes de error que se muestran al usuario.
    const [error, setError] = useState(null);

    // Obtiene la función `login` del contexto de autenticación.
    const { login } = useAuth();
    // Hook para la navegación programática, permite redirigir al usuario.
    const navigate = useNavigate();

    /**
     * @function handleSubmit
     * @description Manejador del evento de envío del formulario.
     * Previene el comportamiento por defecto del formulario, intenta iniciar sesión
     * y redirige al usuario o muestra un error.
     * @param {Event} e - El evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el recargado de la página al enviar el formulario.
        setError(null); // Limpia cualquier error previo antes de un nuevo intento.

        try {
            // Llama a la función de login del contexto de autenticación con las credenciales.
            await login({ email, password });
            // Si el login es exitoso, redirige al usuario a la ruta raíz (mis tareas).
            navigate('/');
        } catch (err) {
            // Si hay un error, se extrae el mensaje del error de la respuesta de la API,
            // o se usa un mensaje genérico.
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            console.error('Error de login:', err); // Registra el error completo en la consola.
        }
    };

    return (
        // Contenedor principal del formulario, con estilos de Tailwind CSS.
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
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
                <div className="mb-6">
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
                {/* Muestra un mensaje de error si el estado `error` no es nulo */}
                {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
                {/* Contenedor para el botón de envío */}
                <div className="flex items-center justify-center">
                    <button
                        type="submit" // Define el botón como tipo submit para el formulario.
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </form>

            {/* Enlace para registrarse */}
            <p className="text-center text-gray-400 text-sm mt-4">
                ¿No tienes cuenta todavía? {' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold underline">
                    Regístrate aquí
                </Link>
            </p>
        </div>
    );
}

export default LoginForm;
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiClient from '../api';

/**
 * @fileoverview Este componente define el diseño principal (layout) para las rutas autenticadas de la aplicación.
 * Proporciona una estructura consistente que incluye un encabezado, navegación, área de contenido principal
 * para rutas anidadas y una barra lateral de estadísticas de tareas.
 * Requiere Tailwind CSS para los estilos.
 */

const AuthenticatedLayout = () => {
    // Obtiene el usuario autenticado y la función de logout del contexto de autenticación.
    const { user, logout } = useAuth();
    // Obtiene el objeto de ubicación actual para resaltar los enlaces de navegación activos.
    const location = useLocation();

    // Estados para gestionar las tareas, el estado de carga y posibles errores.
    const [tasks, setTasks] = useState([]); // Almacena la lista de tareas.
    const [loading, setLoading] = useState(true); // Indica si las tareas están cargando.
    const [error, setError] = useState(null); // Almacena mensajes de error.

    /**
     * @function fetchTasks
     * @description Función asíncrona para obtener las tareas desde la API backend.
     * Actualiza el estado de las tareas, la carga y los errores.
     */
    const fetchTasks = async () => {
        try {
            setLoading(true); // Inicia el estado de carga.
            const response = await apiClient.get('/tasks'); // Realiza la solicitud GET a la API.
            setTasks(response.data); // Actualiza el estado con los datos de las tareas.
        } catch (err) {
            console.error('Error al cargar las tareas:', err);
            setError('No se pudieron cargar las tareas.'); // Establece un mensaje de error.
        } finally {
            setLoading(false); // Finaliza el estado de carga, independientemente del resultado.
        }
    };

    // useEffect para ejecutar fetchTasks una vez cuando el componente se monta.
    useEffect(() => {
        fetchTasks();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar.

    // Cálculos derivados del estado 'tasks' para las estadísticas.
    const totalTasks = tasks.length; // Número total de tareas.
    const completedTasks = tasks.filter(task => task.completed).length; // Tareas completadas.
    const pendingTasks = totalTasks - completedTasks; // Tareas pendientes.

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            {/* Header: Encabezado de la aplicación */}
            <header className="w-full bg-gray-800 p-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white">Gestor de Tareas</h1>
                    <div className="flex items-center space-x-4">
                        {/* Muestra el nombre del usuario autenticado */}
                        <span className="text-gray-300 text-lg">Hola, {user.name}</span>
                        {/* Enlace al perfil del usuario */}
                        <Link to="/profile" className="text-blue-400 hover:text-blue-300 font-semibold text-lg">Mi Perfil</Link>
                        {/* Botón para cerrar sesión */}
                        <button
                            onClick={logout} // Llama a la función de logout al hacer clic.
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content: Área principal de contenido */}
            <main className="flex-grow flex justify-center w-full px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full max-w-7xl">
                    {/* Columna Izquierda: Navegación lateral */}
                    <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit sticky top-4">
                        <h2 className="text-2xl font-semibold mb-4 text-white">Navegación</h2>
                        <nav>
                            <ul>
                                <li className="mb-2">
                                    {/* Enlace a "Mis Tareas" */}
                                    <Link
                                        to="/"
                                        // Estilo dinámico para resaltar el enlace activo.
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-blue-400'}`}
                                    >
                                        Mis Tareas
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    {/* Enlace a "Añadir Nueva Tarea" */}
                                    <Link
                                        to="/tasks/create"
                                        // Estilo dinámico para resaltar el enlace activo.
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/tasks/create' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-green-400'}`}
                                    >
                                        Añadir Nueva Tarea
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    {/* Enlace a "Mi Perfil" */}
                                    <Link
                                        to="/profile"
                                        // Estilo dinámico para resaltar el enlace activo.
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/profile' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-purple-400'}`}
                                    >
                                        Mi Perfil
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Columna Central: Contenido principal de las rutas anidadas */}
                    <section className="lg:col-span-2 xl:col-span-3 bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col overflow-y-auto">
                        {/* Outlet renderiza el componente de la ruta hija actual.
                            Se pasa 'fetchTasks' como contexto para que los hijos puedan refrescar la lista. */}
                        <Outlet context={{ fetchTasks }} />
                    </section>

                    {/* Columna Derecha: Panel de estadísticas de tareas */}
                    <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit sticky top-4">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Estadísticas</h3>
                        {loading ? ( // Muestra un mensaje de carga si las tareas están cargando.
                            <p className="text-gray-300">Cargando estadísticas...</p>
                        ) : error ? ( // Muestra un mensaje de error si ocurrió uno.
                            <p className="text-red-500">{error}</p>
                        ) : ( // Muestra las estadísticas si no hay carga ni error.
                            <>
                                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                                    <p className="text-gray-300 text-lg">Total de tareas: <span className="font-bold text-white">{totalTasks}</span></p>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <p className="text-gray-300 text-lg">Tareas Pendientes: <span className="font-bold text-red-300">{pendingTasks}</span></p>
                                    <p className="text-gray-300 text-lg">Tareas Completadas: <span className="font-bold text-green-300">{completedTasks}</span></p>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </main>

            {/* Footer: Pie de página de la aplicación */}
            <footer className="mt-auto py-6 text-gray-400 text-sm text-center bg-gray-800">
                <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
            </footer>
        </div>
    );
};

export default AuthenticatedLayout;
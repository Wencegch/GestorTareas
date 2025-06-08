import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiClient from '../api';

const AuthenticatedLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tasks');
            setTasks(response.data);
        } catch (err) {
            console.error('Error al cargar las tareas:', err);
            setError('No se pudieron cargar las tareas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="w-full bg-gray-800 p-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white">Gestor de Tareas</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300 text-lg">Hola, {user.name}</span>
                        <Link to="/profile" className="text-blue-400 hover:text-blue-300 font-semibold text-lg">Mi Perfil</Link>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex justify-center w-full px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full max-w-7xl">
                    {/* Columna Izquierda: Navegación */}
                    <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit sticky top-4">
                        <h2 className="text-2xl font-semibold mb-4 text-white">Navegación</h2>
                        <nav>
                            <ul>
                                <li className="mb-2">
                                    <Link
                                        to="/"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-blue-400'}`}
                                    >
                                        Mis Tareas
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link
                                        to="/tasks/create"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/tasks/create' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-green-400'}`}
                                    >
                                        Añadir Nueva Tarea
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link
                                        to="/profile"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/profile' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-700 text-purple-400'}`}
                                    >
                                        Mi Perfil
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Columna Central: Contenido principal */}
                    <section className="lg:col-span-2 xl:col-span-3 bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col overflow-y-auto">
                        <Outlet context={{ fetchTasks }} />
                    </section>

                    {/* Columna Derecha: Estadísticas */}
                    <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit sticky top-4">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Estadísticas</h3>
                        {loading ? (
                            <p className="text-gray-300">Cargando estadísticas...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
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

            {/* Footer */}
            <footer className="mt-auto py-6 text-gray-400 text-sm text-center bg-gray-800">
                <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
            </footer>
        </div>
    );
};

export default AuthenticatedLayout;
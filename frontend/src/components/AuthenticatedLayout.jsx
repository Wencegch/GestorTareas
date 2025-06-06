import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiClient from '../api';

const AuthenticatedLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tasks'); // Ajusta la URL según tu API
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

    const handleTaskUpdate = () => {
        // Llama a fetchTasks para actualizar las tareas después de una acción
        fetchTasks();
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Calcula los contadores
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <header className="mb-8 text-center w-full">
                <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                <nav className="flex justify-between items-center w-full px-4 mb-4">
                    <span className="text-xl font-bold text-white"></span>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Hola, {user.name}</span>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </nav>
            </header>

            <main className="flex-grow flex justify-center w-full px-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl h-full">
                    <aside className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit sticky top-4">
                        <h2 className="text-2xl font-semibold mb-4 text-white">Navegación</h2>
                        <nav>
                            <ul>
                                <li className="mb-2">
                                    <Link
                                        to="/"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-blue-400'}`}
                                    >
                                        Mis Tareas
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link
                                        to="/tasks/create"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/tasks/create' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-green-400'}`}
                                    >
                                        Añadir Nueva Tarea
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link
                                        to="/profile"
                                        className={`block py-2 px-3 rounded-md text-lg transition duration-200 ${location.pathname === '/profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-blue-400'}`}
                                    >
                                        Mi Perfil
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    <section className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full overflow-y-auto">
                        {children}
                    </section>

                    <aside className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit sticky top-4">
                        <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
                        <Link
                            to="/tasks/create"
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition duration-300 ease-in-out block text-center mb-6"
                        >
                            + Añadir Nueva Tarea
                        </Link>

                        <h3 className="text-xl font-bold mb-4 mt-8">Estadísticas</h3>
                        {loading ? (
                            <p className="text-gray-300">Cargando estadísticas...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <>
                                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                                    <p className="text-gray-300">Total de tareas: {totalTasks}</p>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <p className="text-gray-300">Tareas Pendientes: {pendingTasks}</p>
                                    <p className="text-gray-300">Tareas Completadas: {completedTasks}</p>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </main>

            <footer className="mt-auto pt-10 text-gray-400 text-sm text-center">
                <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
            </footer>
        </div>
    );
};

export default AuthenticatedLayout;
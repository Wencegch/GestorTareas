import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { Link, useOutletContext } from 'react-router-dom';

function TaskList() {
    const { fetchTasks } = useOutletContext(); // Obtén fetchTasks desde el contexto
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompleted, setFilterCompleted] = useState('pending');

    const fetchLocalTasks = useCallback(async (search = '', completedFilter = 'pending') => {
        setLoading(true);
        setError(null);
        try {
            let url = '/tasks';
            const params = new URLSearchParams();

            if (search) {
                params.append('search', search);
            }

            if (completedFilter === 'completed') {
                params.append('completed', '1');
            } else if (completedFilter === 'pending') {
                params.append('completed', '0');
            }

            if (params.toString()) {
                url = `${url}?${params.toString()}`;
            }

            const response = await apiClient.get(url);
            setTasks(response.data);
        } catch (err) {
            console.error('Error al obtener las tareas:', err);
            setError('No se pudieron cargar las tareas. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocalTasks(searchTerm, filterCompleted);
    }, [fetchLocalTasks, searchTerm, filterCompleted]);

    const handleToggleCompleted = async (id) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === id);

            if (!taskToUpdate) {
                console.error("Tarea no encontrada en el estado local para actualizar.");
                setError("Error interno: Tarea no encontrada.");
                return;
            }

            const updateData = {
                title: taskToUpdate.title,
                description: taskToUpdate.description,
                completed: !taskToUpdate.completed,
            };

            await apiClient.put(`/tasks/${id}`, updateData);
            fetchLocalTasks(searchTerm, filterCompleted);
            fetchTasks(); // Notifica a AuthenticatedLayout para actualizar los contadores
        } catch (err) {
            console.error('Error al cambiar el estado de la tarea:', err);
            setError('No se pudo actualizar el estado de la tarea.');
        }
    };

    return (
        // TaskList ahora solo renderiza el contenido de la columna central
        // El diseño de las 3 columnas y la barra de navegación lateral
        // se manejan en AuthenticatedLayout.jsx
        <div className="w-full"> {/* Este div es solo para envolver el contenido de TaskList */}
            <h3 className="text-2xl font-bold text-white mb-4">Mis Tareas</h3>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <input
                    type="text"
                    placeholder="Buscar por título..."
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Control de pestañas/botones */}
            <div className="flex justify-center mb-8 space-x-4 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setFilterCompleted('pending')}
                    className={`py-2 px-6 rounded-t-lg font-bold transition duration-300 ease-in-out ${
                        filterCompleted === 'pending'
                            ? 'bg-blue-600 text-white shadow-lg border-b-4 border-blue-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Tareas Pendientes
                </button>
                <button
                    onClick={() => setFilterCompleted('completed')}
                    className={`py-2 px-6 rounded-t-lg font-bold transition duration-300 ease-in-out ${
                        filterCompleted === 'completed'
                            ? 'bg-blue-600 text-white shadow-lg border-b-4 border-blue-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Tareas Completadas
                </button>
            </div>

            {/* Renderización condicional de la lista de tareas */}
            {loading ? (
                <p className="text-center text-gray-400 text-lg">Cargando tareas...</p>
            ) : error ? (
                <p className="text-center text-red-500 text-lg">Error: {error}</p>
            ) : tasks.length === 0 ? (
                <p className="text-center text-gray-400 text-lg">
                    {searchTerm
                        ? 'No hay tareas que coincidan con la búsqueda en esta categoría.'
                        : (filterCompleted === 'pending'
                            ? '¡Genial! No tienes tareas pendientes. Añade una nueva tarea para empezar.'
                            : 'No tienes tareas completadas aún. ¡Vamos a ello!')
                    }
                </p>
            ) : (
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <li key={task.id} className={`bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${task.completed ? 'opacity-70' : ''}`}>
                            <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
                                <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-blue-400'}`}>
                                    {task.title}
                                </h3>
                                {task.description && (
                                    <p className="text-gray-300 mt-1">{task.description}</p>
                                )}
                                {task.due_date && (
                                    <p className="text-gray-400 text-sm mt-1">Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}</p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleToggleCompleted(task.id)}
                                    className={`py-2 px-4 rounded-lg text-white font-bold transition duration-300 ease-in-out ${
                                        task.completed ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {task.completed ? 'Marcar Pendiente' : 'Marcar Completada'}
                                </button>
                                <Link
                                    to={`/tasks/edit/${task.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-center"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TaskList;
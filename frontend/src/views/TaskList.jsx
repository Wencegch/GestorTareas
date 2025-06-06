// frontend/src/views/TaskList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompleted, setFilterCompleted] = useState('pending'); // Por defecto, mostrar pendientes

    const fetchTasks = useCallback(async (search = '', completedFilter = 'pending') => {
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
        fetchTasks(searchTerm, filterCompleted);
    }, [fetchTasks, searchTerm, filterCompleted]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            try {
                await apiClient.delete(`/tasks/${id}`);
                fetchTasks(searchTerm, filterCompleted);
            } catch (err) {
                console.error('Error al eliminar la tarea:', err);
                setError('No se pudo eliminar la tarea.');
            }
        }
    };

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
                // due_date: taskToUpdate.due_date, // Asegúrate de incluir si es requerido
            };

            const response = await apiClient.put(`/tasks/${id}`, updateData);
            console.log("Respuesta de toggle:", response.data);
            fetchTasks(searchTerm, filterCompleted);
        } catch (err) {
            console.error('Error al cambiar el estado de la tarea:', err);
            setError('No se pudo actualizar el estado de la tarea: ' + (err.response?.data?.message || err.message || 'Error desconocido'));
        }
    };

    return (
        // Contenedor principal para el layout de 3 columnas (similar a Twitter)
        // Usamos CSS Grid: 'grid-cols-[250px_1fr_300px]' para definir anchos de columna fijos y una central flexible.
        // 'lg:grid' activa el grid para pantallas grandes. 'flex flex-col' para móviles.
        <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 flex flex-col items-center">
            {/*
                ELIMINAR ESTE TÍTULO YA QUE PROBABLEMENTE ESTÁ EN UN COMPONENTE PADRE/LAYOUT
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Gestor de Tareas</h2>
            */}

            {/* Este div 'w-full max-w-7xl lg:grid lg:grid-cols-[250px_1fr_300px] lg:gap-8 flex flex-col items-center'
                ES EL CONTENEDOR PRINCIPAL DEL LAYOUT DE 3 COLUMNAS.
                Dentro de él, se gestionarán las columnas izquierda, central y derecha.
            */}
            <div className="w-full max-w-7xl lg:grid lg:grid-cols-[250px_1fr_300px] lg:gap-8 flex flex-col items-center">

                {/* Columna Izquierda: Navegación principal (simulando Twitter Sidebar) */}
                <aside className="lg:block hidden w-full lg:w-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-6 lg:mb-0">
                    <h3 className="text-xl font-bold mb-4">Navegación</h3>
                    <nav className="space-y-4">
                        <Link to="/" className="block py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200">
                            Mis Tareas
                        </Link>
                        <Link to="/tasks/create" className="block py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200">
                            Añadir Nueva Tarea
                        </Link>
                        {/* Puedes añadir más enlaces aquí, como "Perfil", "Configuración", etc. */}
                        <Link to="/profile" className="block py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200">
                            Mi Perfil
                        </Link>
                        {/*
                            ELIMINAR ESTE BOTÓN DE CERRAR SESIÓN SI ESTÁ EN EL HEADER GLOBAL
                            <button className="w-full text-left py-2 px-4 rounded-lg bg-red-700 hover:bg-red-800 transition duration-200">
                                Cerrar Sesión
                            </button>
                        */}
                    </nav>
                </aside>

                {/* Columna Central: Contenido principal (Lista de Tareas y búsqueda) */}
                <main className="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
                    {/* Mantener este título, es el título del contenido de la columna central */}
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
                    {tasks.length === 0 ? (
                        <p className="text-center text-gray-400 text-lg">
                            {loading
                                ? 'Cargando tareas...'
                                : searchTerm
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
                </main>

                {/* Columna Derecha: Widgets/Información adicional (simulando Twitter Right Sidebar) */}
                <aside className="lg:block hidden w-full lg:w-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-6 lg:mt-0">
                    <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
                    <Link
                        to="/tasks/create"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition duration-300 ease-in-out block text-center"
                    >
                        + Añadir Nueva Tarea
                    </Link>

                    <h3 className="text-xl font-bold mb-4 mt-8">Estadísticas</h3>
                    <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <p className="text-gray-300">Total de tareas: {tasks.length}</p>
                    </div>
                    {/* Puedes añadir más widgets aquí */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-300">Tareas Pendientes: {tasks.filter(t => !t.completed).length}</p>
                        <p className="text-gray-300">Tareas Completadas: {tasks.filter(t => t.completed).length}</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default TaskList;
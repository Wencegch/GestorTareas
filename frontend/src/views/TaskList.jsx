import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // Importa la instancia de Axios configurada para la API
import { Link, useOutletContext } from 'react-router-dom'; // Importa Link y useOutletContext de React Router

/**
 * @fileoverview Este componente `TaskList` muestra una lista de tareas del usuario.
 * Permite buscar tareas por título, filtrar por estado (pendientes/completadas) y
 * por prioridad, y ordenar las tareas por prioridad. También ofrece acciones
 * como marcar tareas como completadas/pendientes, editar y eliminar.
 * Requiere Tailwind CSS para los estilos.
 */

/**
 * @component TaskList
 * @description Componente funcional que renderiza la lista de tareas del usuario.
 * Proporciona funcionalidades de búsqueda, filtrado y acciones sobre las tareas.
 */
function TaskList() {
    // Obtiene la función `fetchTasks` del contexto del `Outlet` superior (AuthenticatedLayout).
    // Esto permite que este componente notifique al layout para actualizar los contadores de tareas.
    const { fetchTasks } = useOutletContext();

    // Estados para gestionar la lista de tareas, el estado de carga y posibles errores.
    const [tasks, setTasks] = useState([]); // Almacena la lista de tareas.
    const [loading, setLoading] = useState(true); // Indica si las tareas están cargando.
    const [error, setError] = useState(null); // Almacena mensajes de error.
    // Estado para el término de búsqueda por título.
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para filtrar por estado de completado ('pending', 'completed').
    const [filterCompleted, setFilterCompleted] = useState('pending');
    // Estado para filtrar por prioridad ('all', 'low', 'medium', 'high').
    const [filterPriority, setFilterPriority] = useState('all');

    /**
     * @function fetchLocalTasks
     * @description Función asíncrona que obtiene las tareas desde la API backend,
     * aplicando los filtros y términos de búsqueda actuales. Envuelve la lógica
     * de carga de tareas en un `useCallback` para optimización.
     * @param {string} search - Término de búsqueda para el título.
     * @param {string} completedFilter - Filtro de completado ('pending', 'completed').
     * @param {string} priorityFilter - Filtro de prioridad ('all', 'low', 'medium', 'high').
     */
    const fetchLocalTasks = useCallback(async (search = '', completedFilter = 'pending', priorityFilter = 'all') => {
        setLoading(true); // Activa el estado de carga.
        setError(null); // Limpia cualquier error anterior.
        try {
            let url = '/tasks'; // URL base para la API de tareas.
            const params = new URLSearchParams(); // Objeto para construir los parámetros de la URL.

            // Añade el término de búsqueda si existe.
            if (search) {
                params.append('search', search);
            }

            // Añade el filtro de completado.
            if (completedFilter === 'completed') {
                params.append('completed', '1'); // Envía '1' para tareas completadas.
            } else if (completedFilter === 'pending') {
                params.append('completed', '0'); // Envía '0' para tareas pendientes.
            }

            // Añade el filtro de prioridad si no es 'all'.
            if (priorityFilter !== 'all') {
                params.append('priority', priorityFilter);
            }

            // Si hay parámetros, los adjunta a la URL.
            if (params.toString()) {
                url = `${url}?${params.toString()}`;
            }

            const response = await apiClient.get(url); // Realiza la solicitud GET a la API.
            setTasks(response.data); // Actualiza el estado con los datos de las tareas.
        } catch (err) {
            console.error('Error al obtener las tareas:', err);
            setError('No se pudieron cargar las tareas. Por favor, inténtalo de nuevo más tarde.'); // Establece un mensaje de error.
        } finally {
            setLoading(false); // Desactiva el estado de carga, independientemente del resultado.
        }
    }, []); // Dependencias vacías para useCallback, ya que los parámetros se pasan explícitamente.

    /**
     * @hook useEffect
     * @description Este efecto se ejecuta cuando cambian los filtros o el término de búsqueda,
     * llamando a `fetchLocalTasks` para obtener las tareas actualizadas.
     */
    useEffect(() => {
        // Llama a la función de carga de tareas con los estados actuales de búsqueda y filtro.
        fetchLocalTasks(searchTerm, filterCompleted, filterPriority);
    }, [fetchLocalTasks, searchTerm, filterCompleted, filterPriority]); // Dependencias: el efecto se re-ejecuta cuando cambian.

    /**
     * @function handleToggleCompleted
     * @description Manejador para cambiar el estado `completed` de una tarea.
     * @param {number} id - El ID de la tarea a actualizar.
     */
    const handleToggleCompleted = async (id) => {
        try {
            // Encuentra la tarea en el estado local para obtener sus datos actuales.
            const taskToUpdate = tasks.find(task => task.id === id);

            if (!taskToUpdate) {
                console.error("Tarea no encontrada en el estado local para actualizar.");
                setError("Error interno: Tarea no encontrada.");
                return;
            }

            // Crea un objeto con los datos a enviar para la actualización.
            const updateData = {
                title: taskToUpdate.title,
                description: taskToUpdate.description,
                completed: !taskToUpdate.completed, // Invierte el estado 'completed'.
                priority: taskToUpdate.priority, // Mantiene la prioridad.
            };

            await apiClient.put(`/tasks/${id}`, updateData); // Envía la petición PUT a la API.
            fetchLocalTasks(searchTerm, filterCompleted, filterPriority); // Refresca la lista local después de la actualización.
            fetchTasks(); // Notifica al layout principal para que actualice los contadores.
        } catch (err) {
            console.error('Error al cambiar el estado de la tarea:', err);
            setError('No se pudo actualizar el estado de la tarea.');
        }
    };

    /**
     * @function handleDelete
     * @description Manejador para eliminar una tarea.
     * @param {number} id - El ID de la tarea a eliminar.
     */
    const handleDelete = async (id) => {
        // Pide confirmación al usuario antes de eliminar.
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            try {
                await apiClient.delete(`/tasks/${id}`); // Realiza la solicitud DELETE al backend.
                // Actualiza el estado local de las tareas, filtrando la tarea eliminada.
                setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
                fetchTasks(); // Notifica al layout principal para que actualice los contadores.
            } catch (err) {
                console.error('Error al eliminar la tarea:', err);
                setError('No se pudo eliminar la tarea. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    };

    // Ordenar las tareas por prioridad antes de renderizarlas.
    // 'high' va primero, luego 'medium', y finalmente 'low'.
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Mis Tareas</h3>

            {/* Sección de búsqueda */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <input
                    type="text"
                    placeholder="Buscar por título..."
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sección de filtros por estado */}
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

            {/* Mensajes de estado (carga, error, sin tareas) */}
            {loading ? (
                <p className="text-center text-gray-400 text-lg">Cargando tareas...</p>
            ) : error ? (
                <p className="text-center text-red-500 text-lg">Error: {error}</p>
            ) : sortedTasks.length === 0 ? (
                <p className="text-center text-gray-400 text-lg">
                    {searchTerm
                        ? 'No hay tareas que coincidan con la búsqueda en esta categoría.'
                        : (filterCompleted === 'pending'
                            ? '¡Genial! No tienes tareas pendientes. Añade una nueva tarea para empezar.'
                            : 'No tienes tareas completadas aún. ¡Vamos a ello!')}
                </p>
            ) : (
                // Lista de tareas si hay tareas para mostrar
                <ul className="space-y-4">
                    {sortedTasks.map((task) => (
                        <li key={task.id} className={`bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${task.completed ? 'opacity-70' : ''}`}>
                            <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
                                {/* Título de la tarea, con tachado si está completada */}
                                <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-blue-400'}`}>
                                    {task.title}
                                </h3>
                                {/* Descripción de la tarea (si existe) */}
                                {task.description && (
                                    <p className="text-gray-300 mt-1">{task.description}</p>
                                )}
                                {/* Fecha de vencimiento (si existe) */}
                                {task.due_date && (
                                    <p className="text-gray-400 text-sm mt-1">Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}</p>
                                )}
                                {/* Prioridad de la tarea con coloración */}
                                <p className="text-gray-400 text-sm mt-1">Prioridad:
                                    <span className={`font-bold ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {task.priority}
                                    </span>
                                </p>
                            </div>
                            {/* Botones de acción (Marcar, Editar, Eliminar) */}
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
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../api';

/**
 * @fileoverview Este componente `TaskForm` proporciona un formulario para crear o editar tareas.
 * Se adapta dinámicamente según si se proporciona un ID de tarea a través de los parámetros de la URL.
 * Permite gestionar el título, descripción, fecha de vencimiento, estado de completado y prioridad de una tarea.
 * Utiliza Tailwind CSS para los estilos.
 */

/**
 * @component TaskForm
 * @description Componente funcional para el formulario de creación o edición de tareas.
 * Carga los datos de una tarea existente si se está en modo de edición.
 */
function TaskForm() {
    // Obtiene el parámetro `id` de la URL para determinar si es modo edición.
    const { id } = useParams();
    // Hook para la navegación programática.
    const navigate = useNavigate();
    // Obtiene la función `fetchTasks` del contexto del `Outlet` superior (AuthenticatedLayout).
    // Esto permite actualizar las estadísticas de tareas después de una creación/actualización.
    const { fetchTasks } = useOutletContext();

    // Determina si el componente está en modo de edición (true si `id` tiene un valor).
    const isEditMode = !!id;
    // URL base de la API para las tareas.
    const apiUrl = 'http://localhost/api/tasks';

    // Estados para los campos del formulario.
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [completed, setCompleted] = useState(false); // Estado booleano para 'completada'.
    const [priority, setPriority] = useState('medium'); // Estado para la prioridad, valor predeterminado 'medium'.
    // Estados para el manejo de carga y errores.
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @hook useEffect
     * @description Este efecto se encarga de cargar los datos de una tarea
     * cuando el componente se monta en modo edición o cuando cambia el `id`.
     * También reinicia los campos si se pasa de edición a creación.
     */
    useEffect(() => {
        if (isEditMode) {
            setLoading(true); // Activa el estado de carga al iniciar la petición.
            apiClient.get(`${apiUrl}/${id}`) // Realiza una petición GET para obtener la tarea por su ID.
                .then(response => {
                    const task = response.data;
                    setTitle(task.title);
                    setDescription(task.description || ''); // Si no hay descripción, usa cadena vacía.
                    // Formatea la fecha de vencimiento para el input type="date".
                    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                    setCompleted(task.completed); // Carga el estado de completado.
                    setPriority(task.priority || 'medium'); // Carga la prioridad o establece 'medium' por defecto.
                    setLoading(false); // Desactiva el estado de carga.
                })
                .catch(err => {
                    console.error('Error al cargar la tarea para edición:', err);
                    setError('No se pudo cargar la tarea para edición.'); // Establece un mensaje de error.
                    setLoading(false); // Desactiva el estado de carga.
                });
        } else {
            // Si no es modo edición, reinicia todos los campos del formulario.
            setTitle('');
            setDescription('');
            setDueDate('');
            setCompleted(false); // Se inicializa a false para una nueva tarea.
            setPriority('medium'); // Prioridad predeterminada para nuevas tareas.
        }
    }, [id, isEditMode, apiUrl]); // Dependencias: el efecto se re-ejecuta si `id`, `isEditMode` o `apiUrl` cambian.

    /**
     * @function handleSubmit
     * @description Manejador del evento de envío del formulario.
     * Envía los datos de la tarea a la API para crear o actualizar, según el modo.
     * @param {Event} e - El evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario.
        setError(null); // Limpia cualquier error previo.

        // Objeto con los datos de la tarea a enviar.
        const taskData = {
            title,
            description,
            // Si no hay fecha de vencimiento, se envía `null`.
            due_date: dueDate || null,
            completed,
            priority, // Incluye la prioridad en los datos.
        };

        try {
            if (isEditMode) {
                // Si es modo edición, realiza una petición PUT para actualizar la tarea.
                await apiClient.put(`${apiUrl}/${id}`, taskData);
                alert('Tarea actualizada con éxito!');
            } else {
                // Si es modo creación, realiza una petición POST para crear una nueva tarea.
                await apiClient.post(apiUrl, taskData);
                alert('Tarea creada con éxito!');
                fetchTasks(); // Llama a la función del contexto para actualizar las estadísticas en el layout.
            }
            navigate('/'); // Redirige al usuario a la lista de tareas después de la operación.
        } catch (err) {
            // Manejo de errores: muestra un mensaje específico según el modo.
            console.error(`${isEditMode ? 'Error al actualizar' : 'Error al crear'} la tarea:`, err);
            setError(`${isEditMode ? 'No se pudo actualizar' : 'No se pudo crear'} la tarea: ${err.response?.data?.message || err.message}`);
        }
    };

    // Muestra un mensaje de carga si estamos en modo edición y los datos se están cargando.
    if (loading && isEditMode) return <p className="text-center text-gray-400">Cargando datos de la tarea...</p>;
    // Muestra un mensaje de error si hay un error.
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        // Formulario de tareas con estilos de Tailwind CSS.
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            {/* Título del formulario, cambia según el modo (crear o editar). */}
            <h2 className="text-2xl font-semibold mb-4 text-center text-white">
                {isEditMode ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
            </h2>

            {/* Campo de entrada para el Título */}
            <div className="mb-4">
                <label htmlFor="title" className="block text-gray-400 text-sm font-bold mb-2">Título:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    required // Campo requerido.
                />
            </div>

            {/* Campo de entrada para la Descripción */}
            <div className="mb-4">
                <label htmlFor="description" className="block text-gray-400 text-sm font-bold mb-2">Descripción:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                ></textarea>
            </div>

            {/* Campo de entrada para la Fecha de Vencimiento */}
            <div className="mb-4">
                <label htmlFor="dueDate" className="block text-gray-400 text-sm font-bold mb-2">Fecha de Vencimiento:</label>
                <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                />
            </div>

            {/* Campo de selección para la Prioridad */}
            <div className="mb-4">
                <label htmlFor="priority" className="block text-gray-400 text-sm font-bold mb-2">Prioridad:</label>
                <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
            </div>

            {/* Campo de selección para el Estado (Completada/Pendiente) */}
            <div className="mb-6">
                <label htmlFor="completed" className="block text-gray-400 text-sm font-bold mb-2">Estado:</label>
                <select
                    id="completed"
                    // El valor del select es una cadena ('completed' o 'pending'), se traduce a booleano para el estado.
                    value={completed ? 'completed' : 'pending'}
                    onChange={(e) => setCompleted(e.target.value === 'completed')} // Convierte la cadena del select a booleano.
                    className="shadow border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                </select>
            </div>

            {/* Botones de acción (Guardar/Actualizar y Cancelar) */}
            <div className="flex justify-between">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-5/12"
                >
                    {isEditMode ? 'Actualizar Tarea' : 'Guardar Tarea'} {/* Texto del botón dinámico */}
                </button>
                <button
                    type="button" // Importante: 'button' para evitar que dispare el submit del formulario.
                    onClick={() => navigate('/')} // Al hacer clic, redirige a la ruta raíz.
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-5/12"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default TaskForm;
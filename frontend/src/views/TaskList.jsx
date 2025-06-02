import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = 'http://localhost/api/tasks';

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(apiUrl); // Cambiado a apiClient.get [cite: 27, 32]
            setTasks(response.data);
        } catch (err) {
            console.error('Error al cargar las tareas:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            try {
                await apiClient.delete(`<span class="math-inline">\{apiUrl\}/</span>{id}`); // Cambiado a apiClient.delete [cite: 27, 32]
                setTasks(tasks.filter(task => task.id !== id));
                console.log('Tarea eliminada con éxito');
            } catch (err) {
                console.error('Error al eliminar la tarea:', err);
                alert(`Error al eliminar la tarea: ${err.response?.data?.message || err.message}`);
                setError(err);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-400">Cargando tareas...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error: {error.message}. Por favor, inténtalo de nuevo más tarde.</p>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center text-white">Mis Tareas</h2>
            {tasks.length === 0 ? (
                <p className="text-center text-gray-400">
                    No hay tareas disponibles. ¡
                    <Link to="/tasks/create" className="text-blue-400 hover:text-blue-300 font-bold underline">
                        Crea una nueva
                    </Link>
                    !
                </p>
            ) : (
                <ul>
                    {tasks.map(task => (
                        <li key={task.id} className="bg-gray-700 p-4 rounded-md mb-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-blue-300">{task.title}</h3>
                                {task.description && <p className="text-gray-300 text-sm mt-1">{task.description}</p>}
                                {task.due_date && <p className="text-gray-400 text-xs mt-1">Vence: {new Date(task.due_date).toLocaleDateString('es-ES')}</p>}
                                <p className={`text-sm font-semibold mt-1 ${task.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    Estado: {task.status === 'pending' ? 'Pendiente' : 'Completada'}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <Link to={`/tasks/edit/${task.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm flex items-center justify-center">
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm flex items-center justify-center"
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
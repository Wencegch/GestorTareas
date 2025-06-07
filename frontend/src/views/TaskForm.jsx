import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../api';

function TaskForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchTasks } = useOutletContext();
    const isEditMode = !!id;
    const apiUrl = 'http://localhost/api/tasks';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            apiClient.get(`${apiUrl}/${id}`)
                .then(response => {
                    const task = response.data;
                    setTitle(task.title);
                    setDescription(task.description || '');
                    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                    setStatus(task.status);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error al cargar la tarea para edición:', err);
                    setError('No se pudo cargar la tarea para edición.');
                    setLoading(false);
                });
        } else {
            setTitle('');
            setDescription('');
            setDueDate('');
            setStatus('pending');
        }
    }, [id, isEditMode, apiUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const taskData = {
            title,
            description,
            due_date: dueDate || null,
            status,
        };

        try {
            if (isEditMode) {
                await apiClient.put(`${apiUrl}/${id}`, taskData);
                alert('Tarea actualizada con éxito!');
            } else {
                await apiClient.post(apiUrl, taskData);
                alert('Tarea creada con éxito!');
                fetchTasks(); // Actualiza los contadores en AuthenticatedLayout
            }
            navigate('/');
        } catch (err) {
            console.error(`${isEditMode ? 'Error al actualizar' : 'Error al crear'} la tarea:`, err);
            setError(`${isEditMode ? 'No se pudo actualizar' : 'No se pudo crear'} la tarea: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading && isEditMode) return <p className="text-center text-gray-400">Cargando datos de la tarea...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center text-white">
                {isEditMode ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
            </h2>
            <div className="mb-4">
                <label htmlFor="title" className="block text-gray-400 text-sm font-bold mb-2">Título:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="description" className="block text-gray-400 text-sm font-bold mb-2">Descripción:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                ></textarea>
            </div>
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
            <div className="mb-6">
                <label htmlFor="status" className="block text-gray-400 text-sm font-bold mb-2">Estado:</label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                </select>
            </div>
            <div className="flex justify-between">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-5/12"
                >
                    {isEditMode ? 'Actualizar Tarea' : 'Guardar Tarea'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-5/12"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default TaskForm;
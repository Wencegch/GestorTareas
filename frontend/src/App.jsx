// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; // Importa Navigate
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'; // Asegúrate de que es .jsx
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// Componente para la navegación (opcional, para mantener el código más limpio)
const AuthNav = () => {
    const { user, logout } = useAuth(); // Obtén el usuario y la función de logout

    return (
        <div className="flex justify-between items-center w-full max-w-2xl px-4 mb-4">
            <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold">Mis Tareas</Link>
            {user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Hola, {user.name}</span>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            ) : (
                <div className="space-x-4">
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                        Registrarse
                    </Link>
                </div>
            )}
        </div>
    );
};

// Componente PrivateRoute para proteger las rutas
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p className="text-center text-gray-400">Cargando autenticación...</p>;
    }

    // Si no hay usuario, redirige a la página de login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children; // Si hay usuario, renderiza el componente hijo
};


function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
                    <header className="mb-8 text-center w-full">
                        <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                        <AuthNav />
                        {/* El botón "Añadir Nueva Tarea" solo se debería mostrar si el usuario está logueado */}
                        <div className="text-center mt-4">
                            {/* Podemos envolver esto en una pequeña lógica condicional o dentro de PrivateRoute */}
                            <PrivateRoute> {/* Envuelve el Link con PrivateRoute */}
                                <Link to="/tasks/create" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
                                    Añadir Nueva Tarea
                                </Link>
                            </PrivateRoute>
                        </div>
                    </header>

                    <main className="w-full max-w-2xl px-4">
                        <Routes>
                            {/* Rutas de autenticación (no protegidas) */}
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />

                            {/* Rutas protegidas */}
                            {/* Al acceder a '/', PrivateRoute verificará si hay usuario y redirigirá si no */}
                            <Route path="/" element={
                                <PrivateRoute>
                                    <TaskList />
                                </PrivateRoute>
                            } />
                            <Route path="/tasks/create" element={
                                <PrivateRoute>
                                    <TaskForm />
                                </PrivateRoute>
                            } />
                            <Route path="/tasks/edit/:id" element={
                                <PrivateRoute>
                                    <TaskForm />
                                </PrivateRoute>
                            } />

                            <Route path="*" element={<p className="text-center text-red-500">404 - Página no encontrada</p>} />
                        </Routes>
                    </main>

                    <footer className="mt-auto pt-10 text-gray-400 text-sm">
                        <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
                    </footer>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
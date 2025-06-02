import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import TaskList from './views/TaskList.jsx';
import TaskForm from './views/TaskForm.jsx';
import LoginForm from './views/LoginForm.jsx';
import RegisterForm from './views/RegisterForm.jsx';

// Componente para la navegación
const AuthNav = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation(); // Hook para obtener la ruta actual

    if (loading) {
        return null; // O un spinner si prefieres que la navegación se oculte/muestre algo durante la carga
    }

    return (
        <div className="flex justify-between items-center w-full px-4 mb-4">
            {user ? (
                // Si el usuario está logueado, muestra "Mis Tareas" a la izquierda
                <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold">Mis Tareas</Link>
            ) : (
                // Si el usuario NO está logueado, no muestra "Mis Tareas" aquí.
                // Podrías poner un título o un logo de la aplicación si lo deseas,
                // o un span vacío para mantener el espacio y la alineación.
                <span className="text-xl font-bold text-white"></span>
            )}

            {user ? (
                // Si el usuario está logueado: Saludo y botón de Cerrar Sesión a la derecha
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
                // Si el usuario NO está logueado:
                // Mostrar botones de autenticación en la cabecera solo si NO estamos en las rutas de login/register.
                // En login/register, los enlaces/botones irán dentro o cerca del formulario.
                <div className="space-x-4">
                    {location.pathname !== '/login' && location.pathname !== '/register' && (
                        <>
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                                Registrarse
                            </Link>
                        </>
                    )}
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

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Nuevo componente para el contenido principal de la aplicación que usa AuthContext
const AppContent = () => {
    const { user, loading } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <header className="mb-8 text-center w-full">
                <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                <AuthNav /> {/* AuthNav se encarga de la lógica de navegación */}
                <div className="text-center mt-4">
                    {/* Condicional para mostrar el botón "Añadir Nueva Tarea" */}
                    {!loading && user && (
                        <Link to="/tasks/create" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
                            Añadir Nueva Tarea
                        </Link>
                    )}
                </div>
            </header>

            <main className="w-full max-w-2xl px-4">
                <Routes>
                    {/* Rutas de autenticación (no protegidas) */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />

                    {/* Rutas protegidas */}
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
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
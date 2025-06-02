import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import TaskList from './views/TaskList.jsx';
import TaskForm from './views/TaskForm.jsx';
import LoginForm from './views/LoginForm.jsx';
import RegisterForm from './views/RegisterForm.jsx';
import UserProfileForm from './views/UserProfileForm.jsx';


const AuthNav = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();

    // No renderiza la navegación mientras se está cargando el estado de autenticación.
    // Esto previene que se muestren enlaces inconsistentes.
    if (loading) {
        return null;
    }

    // Determina si la ruta actual es /login o /register
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="flex justify-between items-center w-full px-4 mb-4">
            {user ? (
                // Si el usuario está logueado, muestra el enlace a "Mis Tareas"
                <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold">Mis Tareas</Link>
            ) : (
                // Si el usuario NO está logueado, muestra un título genérico
                <span className="text-xl font-bold text-white"></span>
            )}

            {user ? (
                // Si el usuario está logueado: Enlaces de navegación de usuario y botón de Cerrar Sesión
                <div className="flex items-center space-x-4">
                    <Link to="/profile" className="text-blue-400 hover:text-blue-300 font-bold">Mi Perfil</Link> {/* Enlace a Mi Perfil */}
                    <span className="text-gray-300">Hola, {user.name}</span>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            ) : (
                // Si el usuario NO está logueado y NO estamos en una ruta de autenticación,
                // muestra los botones de Login/Registro en la cabecera.
                !isAuthRoute && (
                    <div className="space-x-4">
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                            Iniciar Sesión
                        </Link>
                        <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                            Registrarse
                        </Link>
                    </div>
                )
            )}
        </nav>
    );
};

// Componente PrivateRoute para proteger las rutas internas
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Muestra un estado de carga mientras se verifica la autenticación
    if (loading) {
        return <p className="text-center text-gray-400">Cargando autenticación...</p>;
    }

    // Si no hay usuario (y ya no está cargando), redirige a la página de login.
    // Este `PrivateRoute` SÓLO se usa para las rutas que DEBEN estar protegidas.
    // Las rutas `/login` y `/register` NO están envueltas por PrivateRoute.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children; // Si hay usuario, renderiza el componente hijo
};


function App() {
    const { user, loading } = useAuth(); // Obtiene el estado de autenticación

    // Muestra una pantalla de carga para TODA la aplicación mientras AuthContext inicializa
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Cargando aplicación...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
                <header className="mb-8 text-center w-full">
                    <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                    <AuthNav />

                    <div className="text-center mt-4">
                        {/* El botón "Añadir Nueva Tarea" solo se muestra si el usuario está logueado */}
                        {user && (
                            <Link to="/tasks/create" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
                                Añadir Nueva Tarea
                            </Link>
                        )}
                    </div>
                </header>

                <main className="w-full max-w-2xl px-4">
                    <Routes>
                        {/* Rutas de autenticación (NO protegidas por PrivateRoute) */}
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />

                        {/* Si hay usuario, muestra TaskList; si no, redirige a /login */}
                        <Route path="/" element={user ? <TaskList /> : <Navigate to="/login" replace />} />

                        {/* Rutas PROTEGIDAS por PrivateRoute */}
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <UserProfileForm />
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

                        {/* Ruta de 404 */}
                        <Route path="*" element={<p className="text-center text-red-500">404 - Página no encontrada</p>} />
                    </Routes>
                </main>

                <footer className="mt-auto pt-10 text-gray-400 text-sm">
                    <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
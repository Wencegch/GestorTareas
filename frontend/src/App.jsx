import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import TaskList from './views/TaskList.jsx';
import TaskForm from './views/TaskForm.jsx';
import LoginForm from './views/LoginForm.jsx';
import RegisterForm from './views/RegisterForm.jsx';
import UserProfileForm from './views/UserProfileForm.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'; // ¡Importa el nuevo layout!

// Componente AuthNav simplificado para la barra superior (Mi Perfil, Cerrar Sesión)
// y los enlaces de Login/Register para usuarios no logueados en la cabecera.
const AuthNav = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

};

// Componente PrivateRoute para proteger las rutas internas
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


function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Cargando aplicación...</p>
            </div>
        );
    }

    return (
        <Router>
            {/* Renderización condicional basada en si el usuario está logueado */}
            {!user ? (
                // Si NO hay usuario, renderizamos el header básico y las rutas de autenticación
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
                    <header className="mb-8 text-center w-full">
                        <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                        <AuthNav /> {/* Mostrará Login/Register */}
                    </header>
                    <main className="w-full px-4">
                        <Routes>
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            {/* Cualquier otra ruta sin autenticar redirige al login */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </main>
                    <footer className="mt-auto pt-10 text-gray-400 text-sm">
                        <p>&copy; 2025 Mi Gestor de Tareas. Creado con Laravel y React.</p>
                    </footer>
                </div>
            ) : (
                // Si SÍ hay usuario, renderizamos las rutas envueltas por AuthenticatedLayout
                <Routes>
                    {/* Rutas PROTEGIDAS que usarán el AuthenticatedLayout */}
                    <Route path="/" element={<PrivateRoute><AuthenticatedLayout><TaskList /></AuthenticatedLayout></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><AuthenticatedLayout><UserProfileForm /></AuthenticatedLayout></PrivateRoute>} />
                    <Route path="/tasks/create" element={<PrivateRoute><AuthenticatedLayout><TaskForm /></AuthenticatedLayout></PrivateRoute>} />
                    <Route path="/tasks/edit/:id" element={<PrivateRoute><AuthenticatedLayout><TaskForm /></AuthenticatedLayout></PrivateRoute>} />

                    {/* Si un usuario logueado intenta ir a login/register, lo redirigimos a la página principal */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />

                    {/* Ruta de 404 dentro del layout autenticado */}
                    <Route path="*" element={<PrivateRoute><AuthenticatedLayout><p className="text-center text-red-500">404 - Página no encontrada</p></AuthenticatedLayout></PrivateRoute>} />
                </Routes>
            )}
        </Router>
    );
}

export default App;
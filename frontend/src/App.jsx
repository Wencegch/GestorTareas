import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx';
import TaskList from './views/TaskList.jsx';
import TaskForm from './views/TaskForm.jsx';
import UserProfileForm from './views/UserProfileForm.jsx';
import LoginForm from './views/LoginForm.jsx';
import RegisterForm from './views/RegisterForm.jsx';

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
    const { user } = useAuth();

    return (
        <Router>
            {!user ? (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
                    <header className="mb-8 text-center w-full">
                        <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
                    </header>
                    <main className="w-full px-4">
                        <Routes>
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </main>
                </div>
            ) : (
                <Routes>
                    <Route path="/" element={<PrivateRoute><AuthenticatedLayout /></PrivateRoute>}>
                        <Route index element={<TaskList />} />
                        <Route path="tasks/create" element={<TaskForm />} />
                        <Route path="tasks/edit/:id" element={<TaskForm />} />
                        <Route path="profile" element={<UserProfileForm />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            )}
        </Router>
    );
}

export default App;
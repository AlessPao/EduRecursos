import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecursosList from './pages/RecursosList';
import RecursoForm from './pages/RecursoForm';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recursos" element={<RecursosList />} />
            <Route path="/recursos/nuevo/:tipo" element={<RecursoForm />} />
            <Route path="/recursos/:id" element={<RecursoForm />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>
        
        {/* Redirecciones y ruta 404 */}
        <Route path="/dashboard/recursos" element={<Navigate to="/recursos" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
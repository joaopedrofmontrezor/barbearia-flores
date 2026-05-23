import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { subscribeAuth } from './firebase/authService';

// Lazy loading das páginas para melhor performance e code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Services = lazy(() => import('./pages/Services'));

// Componente de carregamento premium
const PremiumLoader = () => (
  <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
    <div className="relative w-20 h-20">
      {/* Círculo animado */}
      <div className="absolute inset-0 border-4 border-dark-800 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-gold rounded-full animate-spin border-t-transparent"></div>
    </div>
    <h2 className="mt-6 text-gold font-title tracking-widest text-lg animate-pulse uppercase">Barbearia Flores</h2>
    <p className="text-dark-500 text-sm mt-2">Carregando experiência...</p>
  </div>
);

// Provedor de Autenticação Protegida
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <PremiumLoader />;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Impedir que usuários logados acessem a tela de login
const PublicOnlyRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <PremiumLoader />;

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PremiumLoader />}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/services" element={<Services />} />
          
          {/* Rota de Login do Admin (Protegida contra usuários já autenticados) */}
          <Route 
            path="/admin/login" 
            element={
              <PublicOnlyRoute>
                <AdminLogin />
              </PublicOnlyRoute>
            } 
          />
          
          {/* Rotas Administrativas Protegidas */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback de redirecionamento */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

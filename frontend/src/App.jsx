import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './components/Auth/Login';

// Layout
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Secrétaire
import SecretaireDashboard from './components/Secretaire/Dashboard';
import CreerMission from './components/Secretaire/CreerMission';
import ListeMissions from './components/Secretaire/ListeMissions';
import Statistiques from './components/Secretaire/Statistiques';

// Chauffeur
import ChauffeurDashboard from './components/Chauffeur/Dashboard';
import MesMissions from './components/Chauffeur/MesMissions';
import DetailMission from './components/Chauffeur/DetailMission';

// Route protégée
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout avec Header et Sidebar
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Routes Secrétaire */}
          <Route
            path="/secretaire/dashboard"
            element={
              <ProtectedRoute allowedRole="secretaire">
                <DashboardLayout>
                  <SecretaireDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretaire/missions/creer"
            element={
              <ProtectedRoute allowedRole="secretaire">
                <DashboardLayout>
                  <CreerMission />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretaire/missions"
            element={
              <ProtectedRoute allowedRole="secretaire">
                <DashboardLayout>
                  <ListeMissions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretaire/statistiques"
            element={
              <ProtectedRoute allowedRole="secretaire">
                <DashboardLayout>
                  <Statistiques />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Routes Chauffeur */}
          <Route
            path="/chauffeur/dashboard"
            element={
              <ProtectedRoute allowedRole="chauffeur">
                <DashboardLayout>
                  <ChauffeurDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chauffeur/missions"
            element={
              <ProtectedRoute allowedRole="chauffeur">
                <DashboardLayout>
                  <MesMissions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chauffeur/missions/:id"
            element={
              <ProtectedRoute allowedRole="chauffeur">
                <DashboardLayout>
                  <DetailMission />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chauffeur/historique"
            element={
              <ProtectedRoute allowedRole="chauffeur">
                <DashboardLayout>
                  <MesMissions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

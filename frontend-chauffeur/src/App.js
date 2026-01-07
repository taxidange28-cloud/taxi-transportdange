// Import des dépendances
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Missions from './pages/Missions';
import socketService from './services/socket';
import { initializeFirebase } from './services/notifications';
import { playNotificationSound } from './services/notificationService';

// Thème Transport DanGE
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#8BC34A',
      dark: '#388E3C',
    },
    secondary: {
      main: '#C8E6C9',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#424242',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Initialiser Firebase au démarrage
initializeFirebase();

// Vérifier si l'utilisateur est authentifié
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'chauffeur') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [soundTestVisible, setSoundTestVisible] = useState(false);

  useEffect(() => {
    console.log('🚀 Application Transport DanGE initialisée');
    
    // Écouter les messages du Service Worker pour jouer le son
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📩 Message du Service Worker:', event.data);
        if (event.data && event.data.type === 'PLAY_SOUND') {
          playNotificationSound();
        }
      });
    }

    // Afficher le bouton de test du son en mode développement
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      setSoundTestVisible(true);
    }
  }, []);

  const handleTestSound = () => {
    console.log('🔊 Test du son déclenché');
    playNotificationSound();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/missions"
            element={
              <PrivateRoute>
                <Missions />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/missions" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Bouton de test du son (flottant en bas à droite) */}
      {soundTestVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={handleTestSound}
            style={{
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🔊 Test Son
          </button>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;

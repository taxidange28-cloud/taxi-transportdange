import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  initializeNotifications, 
  requestNotificationPermission, 
  playNotificationSound 
} from './services/notificationService';
import './App.css';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

function App() {
  const [fcmToken, setFcmToken] = useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  
  useEffect(() => {
    console.log('🚀 Initialisation de l\'application...');
    
    try {
      // Initialiser Firebase
      const app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialisé');
      
      const messaging = initializeNotifications(app);
      console.log('✅ Service de notifications initialisé');
      
      setIsFirebaseReady(true);
      
      // Demander la permission
      requestNotificationPermission(messaging).then((token) => {
        if (token) {
          setFcmToken(token);
          console.log('✅ Token FCM disponible');
          // TODO: Envoyer le token au backend
        }
      });
      
      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📩 Message du Service Worker:', event.data);
        if (event.data && event.data.type === 'PLAY_SOUND') {
          playNotificationSound();
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur initialisation Firebase:', error);
    }
  }, []);
  
  const handleTestSound = () => {
    console.log('🔊 Test du son...');
    playNotificationSound();
  };
  
  return (
    <div className="App" style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          color: '#4CAF50',
          fontSize: '32px',
          marginBottom: '10px'
        }}>
          🚖 Transport DanGE - Chauffeur
        </h1>
        <p style={{ color: '#666' }}>
          Application de notifications en temps réel
        </p>
      </header>
      
      <main>
        {/* Statut Firebase */}
        <div style={{
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: isFirebaseReady ? '#e8f5e9' : '#fff3e0',
          border: `2px solid ${isFirebaseReady ? '#4CAF50' : '#ff9800'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {isFirebaseReady ? '✅' : '⏳'} Statut Firebase
          </h3>
          <p style={{ margin: '5px 0' }}>
            {isFirebaseReady ? 
              'Firebase est initialisé et prêt' : 
              'Initialisation en cours...'}
          </p>
        </div>
        
        {/* Bouton de test du son */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <button 
            onClick={handleTestSound}
            disabled={!isFirebaseReady}
            style={{
              padding: '20px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: isFirebaseReady ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isFirebaseReady ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (isFirebaseReady) {
                e.target.style.backgroundColor = '#45a049';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (isFirebaseReady) {
                e.target.style.backgroundColor = '#4CAF50';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }
            }}
          >
            🔊 TESTER LE SON
          </button>
          <p style={{ 
            marginTop: '10px', 
            color: '#666',
            fontSize: '14px'
          }}>
            Cliquez pour jouer le son de notification 3 fois
          </p>
        </div>
        
        {/* Token FCM */}
        {fcmToken && (
          <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '2px solid #ddd'
          }}>
            <h3 style={{ marginTop: 0 }}>
              🔑 Token FCM
            </h3>
            <code style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              {fcmToken}
            </code>
            <p style={{ 
              marginTop: '10px', 
              fontSize: '14px', 
              color: '#666' 
            }}>
              ✅ Ce token sera envoyé au backend pour recevoir les notifications
            </p>
          </div>
        )}
        
        {/* Instructions */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '2px solid #2196F3'
        }}>
          <h3 style={{ marginTop: 0 }}>
            📋 Instructions
          </h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Cliquez sur "TESTER LE SON" pour vérifier que le son fonctionne</li>
            <li>Ouvrez la console (F12) pour voir les logs détaillés</li>
            <li>Le son doit se jouer 3 fois de suite</li>
            <li>Si le son ne fonctionne pas, vérifiez les paramètres audio de votre navigateur</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

export default App;

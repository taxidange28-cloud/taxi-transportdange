import React, { useState } from 'react';
import { Volume2, Loader } from 'lucide-react';

function AlertSonButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const envoyerSon = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://transport-dange-backend.onrender.com/api/notifications/send-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '🚖 Transport DanGE',
          body: 'Nouvelle mission disponible',
          data: {
            type: 'sound_alert',
            action: 'play_sound',
            sound: 'notification-sound.mp3'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      const result = await response.json();
      setMessage(`✅ Son envoyé à ${result.successCount} chauffeur(s)`);
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        onClick={envoyerSon}
        disabled={loading}
        style={{
          backgroundColor: '#FF6B35',
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          opacity: loading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#E85A2A';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#FF6B35';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Envoi en cours... 
          </>
        ) : (
          <>
            <Volume2 size={20} />
            🔊 Alerter par son
          </>
        )}
      </button>

      {message && (
        <p style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AlertSonButton;

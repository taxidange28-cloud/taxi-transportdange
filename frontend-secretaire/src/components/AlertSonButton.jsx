import React, { useState } from 'react';

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
          padding: '10px 20px',
          fontSize: '15px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s'
        }}
      >
        {loading ? '⏳ Envoi...' : '🔊 Alerter par son'}
      </button>

      {message && (
        <p style={{
          marginTop: '8px',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '13px',
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

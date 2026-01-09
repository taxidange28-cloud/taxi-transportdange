const { getMessaging } = require('../config/firebase');
const { pool } = require('../config/database');

exports.sendNotificationToDriver = async (req, res) => {
  try {
    const { driverId, title, body, data } = req.body;

    console.log('📤 Envoi de notification au chauffeur:', driverId);

    // Récupération des informations du chauffeur
    const result = await pool.query(
      'SELECT id, nom, fcm_token FROM chauffeurs WHERE id = $1',
      [driverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    const driver = result.rows[0];

    if (!driver.fcm_token) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM manquant pour ce chauffeur',
      });
    }

    const message = {
      token: driver.fcm_token,
      notification: {
        title: title || '🚖 Nouvelle Mission',
        body: body || 'Une nouvelle mission vous attend',
      },
      data: {
        ...data,
        click_action: '/missions',
      },
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '0',
        },
        notification: {
          requireInteraction: true,
          vibrate: [1000, 500, 1000],
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: `mission-${Date.now()}`,
        },
        fcmOptions: {
          link: '/missions',
        },
      },
    };

    const messaging = getMessaging();

    if (!messaging) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Messaging non initialisé',
      });
    }

    const response = await messaging.send(message);

    console.log('✅ Notification envoyée avec succès:', response);

    return res.status(200).json({
      success: true,
      message: 'Notification envoyée avec succès',
      messageId: response,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification',
      error: error.message,
    });
  }
};

exports.sendNotificationToAllDrivers = async (req, res) => {
  try {
    const { title, body, data } = req.body;

    console.log('📤 Envoi de notifications à tous les chauffeurs.');

    // Récupération des chauffeurs actifs avec un token FCM
    const result = await pool.query(
      'SELECT id, nom, fcm_token FROM chauffeurs WHERE fcm_token IS NOT NULL AND actif = TRUE'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun chauffeur avec un token FCM trouvé.',
      });
    }

    console.log(`📊 ${result.rows.length} chauffeur(s) trouvé(s) avec des tokens FCM.`);

    const tokens = result.rows.map(driver => driver.fcm_token).filter(token => token);

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun token FCM valide trouvé.',
      });
    }

    const message = {
      notification: {
        title: title || '🔔 Transport DanGE',
        body: body || 'Alerte sonore',
      },
      data: {
        type: 'sound_alert',
        ...data,
        click_action: '/missions',
      },
      tokens: tokens,
    };

    const messaging = getMessaging();

    if (!messaging) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Messaging non initialisé.',
      });
    }

    const response = await messaging.sendEachForMulticast(message);

    console.log(`✅ Notifications envoyées: ${response.successCount}/${tokens.length}.`);

    if (response.failureCount > 0) {
      console.warn(`⚠️ ${response.failureCount} notification(s) ont échoué.`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Erreur pour le token ${idx}:`, resp.error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `${response.successCount} notifications envoyées sur ${tokens.length}.`,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des notifications.',
      error: error.message,
    });
  }
};

module.exports = exports;

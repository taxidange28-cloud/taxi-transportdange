const jwt = require('jsonwebtoken');

// Middleware pour vérifier que l'utilisateur est un admin
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier que l'utilisateur a le rôle admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Erreur middleware admin auth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { requireAdmin };

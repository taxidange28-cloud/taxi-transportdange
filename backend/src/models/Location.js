const { pool } = require('../config/database');

class Location {
  static async create(data) {
    const { chauffeur_id, latitude, longitude, accuracy, speed, heading, is_active } = data;
    
    const query = `
      INSERT INTO positions_gps 
        (chauffeur_id, latitude, longitude, accuracy, speed, heading, is_active, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [chauffeur_id, latitude, longitude, accuracy, speed, heading, is_active];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getLatestByChauffeurId(chauffeurId) {
    const query = `
      SELECT * FROM positions_gps 
      WHERE chauffeur_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [chauffeurId]);
    return result.rows[0] || null;
  }

  static async getAllActivePositions() {
    const query = `
      SELECT DISTINCT ON (p.chauffeur_id)
        p.*,
        c.nom as chauffeur_nom,
        c.username as chauffeur_username
      FROM positions_gps p
      INNER JOIN chauffeurs c ON p.chauffeur_id = c.id
      WHERE p.timestamp > NOW() - INTERVAL '5 minutes'
      ORDER BY p.chauffeur_id, p.timestamp DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getHistory(chauffeurId, limit = 50) {
    const query = `
      SELECT * FROM positions_gps 
      WHERE chauffeur_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [chauffeurId, limit]);
    return result.rows;
  }

  static async setInactive(chauffeurId) {
    const query = `
      UPDATE positions_gps 
      SET is_active = false 
      WHERE chauffeur_id = $1 AND is_active = true
      RETURNING *
    `;
    
    const result = await pool.query(query, [chauffeurId]);
    return result.rows;
  }

  static async cleanOldPositions(days = 7) {
    const query = `
      DELETE FROM positions_gps 
      WHERE timestamp < NOW() - INTERVAL '${days} days'
      RETURNING COUNT(*) as deleted_count
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Location;

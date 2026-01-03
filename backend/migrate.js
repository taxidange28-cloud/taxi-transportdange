const { query } = require('./src/config/database');

async function runMigration() {
  try {
    console.log('🔄 Starting migration...');
    
    await query(`
      ALTER TABLE missions 
      ADD COLUMN IF NOT EXISTS client_telephone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS nombre_passagers INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS prix_estime DECIMAL(10,2);
    `);
    
    console.log('✅ Migration completed successfully!');
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { runMigration };

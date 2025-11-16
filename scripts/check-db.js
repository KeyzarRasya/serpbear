require('dotenv').config({ path: './.env.local' });
const { Sequelize } = require('sequelize');

async function checkDatabase() {
   const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
         ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
         } : false
      },
      logging: console.log,
   });

   try {
      await sequelize.authenticate();
      console.log('✓ Database connection successful\n');

      // Check all tables
      const [results] = await sequelize.query(`
         SELECT table_name 
         FROM information_schema.tables 
         WHERE table_schema = 'public'
         ORDER BY table_name;
      `);

      console.log('=== Tables in database ===');
      if (results.length === 0) {
         console.log('⚠ No tables found in database!');
      } else {
         results.forEach((row) => {
            console.log(`  - ${row.table_name}`);
         });
      }
      console.log('');

      // Check each expected table
      const expectedTables = ['domain', 'keyword', 'search_console_data', 'settings'];
      
      for (const tableName of expectedTables) {
         const [tableExists] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = '${tableName}';
         `);
         
         if (tableExists[0].count > 0) {
            const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName};`);
            console.log(`✓ Table '${tableName}' exists (${count[0].count} rows)`);
         } else {
            console.log(`✗ Table '${tableName}' is missing!`);
         }
      }

   } catch (error) {
      console.error('✗ Database error:', error.message);
   } finally {
      await sequelize.close();
   }
}

checkDatabase();

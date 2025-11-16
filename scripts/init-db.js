require('dotenv').config({ path: './.env.local' });
const { Sequelize } = require('sequelize');

async function initDatabase() {
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
      console.log('Connection has been established successfully.');

      await sequelize.query(`
         CREATE TABLE IF NOT EXISTS domain (
            "ID" SERIAL PRIMARY KEY,
            domain VARCHAR(255) UNIQUE NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            "keywordCount" INTEGER DEFAULT 0,
            "lastUpdated" VARCHAR(255),
            added VARCHAR(255),
            tags VARCHAR(255) DEFAULT '[]',
            notification BOOLEAN DEFAULT true,
            notification_interval VARCHAR(255) DEFAULT 'daily',
            notification_emails VARCHAR(255) DEFAULT '',
            search_console TEXT
         );
      `);
      console.log('Domain table created successfully.');

      await sequelize.query(`
         CREATE TABLE IF NOT EXISTS keyword (
            "ID" SERIAL PRIMARY KEY,
            keyword VARCHAR(255) NOT NULL,
            device VARCHAR(255) DEFAULT 'desktop',
            country VARCHAR(255) DEFAULT 'US',
            city VARCHAR(255) DEFAULT '',
            latlong VARCHAR(255) DEFAULT '',
            domain VARCHAR(255) NOT NULL,
            "lastUpdated" VARCHAR(255),
            added VARCHAR(255),
            position INTEGER DEFAULT 0,
            history TEXT DEFAULT '{}',
            volume INTEGER DEFAULT 0,
            url TEXT DEFAULT '[]',
            tags TEXT DEFAULT '[]',
            "lastResult" TEXT DEFAULT '[]',
            sticky BOOLEAN DEFAULT true,
            updating BOOLEAN DEFAULT false,
            "lastUpdateError" VARCHAR(255) DEFAULT 'false',
            settings TEXT
         );
      `);
      console.log('Keyword table created successfully.');

      await sequelize.query(`
         CREATE TABLE IF NOT EXISTS search_console_data (
            "ID" SERIAL PRIMARY KEY,
            domain VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            keyword VARCHAR(255) NOT NULL,
            device VARCHAR(255) DEFAULT 'desktop',
            country VARCHAR(255) DEFAULT 'ZZ',
            clicks INTEGER DEFAULT 0,
            impressions INTEGER DEFAULT 0,
            ctr FLOAT DEFAULT 0,
            position FLOAT DEFAULT 0,
            page TEXT DEFAULT '',
            uid VARCHAR(255) NOT NULL
         );
         CREATE INDEX IF NOT EXISTS idx_sc_domain ON search_console_data(domain);
         CREATE INDEX IF NOT EXISTS idx_sc_date ON search_console_data(date);
         CREATE INDEX IF NOT EXISTS idx_sc_domain_date ON search_console_data(domain, date);
      `);
      console.log('Search Console Data table created successfully.');

      await sequelize.query(`
         CREATE TABLE IF NOT EXISTS settings (
            "ID" SERIAL PRIMARY KEY,
            key VARCHAR(255) UNIQUE NOT NULL,
            value TEXT
         );
      `);
      console.log('Settings table created successfully.');

      console.log('Database initialization completed successfully!');
   } catch (error) {
      console.error('Unable to connect to the database:', error);
   } finally {
      await sequelize.close();
   }
}

initDatabase();
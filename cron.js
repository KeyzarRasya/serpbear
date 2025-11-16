/* eslint-disable no-new */
require('dotenv').config({ path: './.env.local' });
require('reflect-metadata');
const { Sequelize } = require('sequelize-typescript');
const Cryptr = require('cryptr');
const { Cron } = require('croner');

const Settings = require('./database/models/settings').default;

const connection = new Sequelize(process.env.DATABASE_URL || '', {
   dialect: 'postgres',
   dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
         require: true,
         rejectUnauthorized: false
      } : false
   },
   pool: {
      max: 5,
      min: 0,
      idle: 10000,
   },
   logging: false,
   models: [Settings],
});

const getAppSettings = async () => {
   const defaultSettings = {
      scraper_type: 'none',
      notification_interval: 'never',
      notification_email: '',
      smtp_server: '',
      smtp_port: '',
      smtp_username: '',
      smtp_password: '',
   };
   
   try {
      await connection.sync();
      const settingsRecord = await Settings.findOne({ where: { key: 'app_settings' } });
      
      if (!settingsRecord) {
         await Settings.upsert({ key: 'app_settings', value: JSON.stringify(defaultSettings) });
         return defaultSettings;
      }
      
      const settings = settingsRecord.value ? JSON.parse(settingsRecord.value) : {};
      let decryptedSettings = {};

      try {
         const cryptr = new Cryptr(process.env.SECRET);
         const scaping_api = settings.scaping_api ? cryptr.decrypt(settings.scaping_api) : '';
         const smtp_password = settings.smtp_password ? cryptr.decrypt(settings.smtp_password) : '';
         decryptedSettings = { ...settings, scaping_api, smtp_password };
      } catch (error) {
         console.log('Error Decrypting Settings API Keys!');
      }
      
      return decryptedSettings;
   } catch (error) {
      console.log('CRON ERROR: Reading Settings. ', error);
      return defaultSettings;
   }
};

const generateCronTime = (interval) => {
   let cronTime = false;
   if (interval === 'hourly') {
      cronTime = '0 0 */1 * * *';
   }
   if (interval === 'daily') {
      cronTime = '0 0 0 * * *';
   }
   if (interval === 'other_day') {
      cronTime = '0 0 2-30/2 * *';
   }
   if (interval === 'daily_morning') {
      cronTime = '0 0 3 * * *';
   }
   if (interval === 'weekly') {
      cronTime = '0 0 * * 1';
   }
   if (interval === 'monthly') {
      cronTime = '0 0 1 * *';
   }

   return cronTime;
};

const runAppCronJobs = () => {
   getAppSettings().then((settings) => {
      const scrape_interval = settings.scrape_interval || 'daily';
      if (scrape_interval !== 'never') {
         const scrapeCronTime = generateCronTime(scrape_interval);
         new Cron(scrapeCronTime, () => {
            const fetchOpts = { method: 'POST', headers: { Authorization: `Bearer ${process.env.APIKEY}` } };
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron`, fetchOpts)
            .then((res) => res.json())
            .catch((err) => {
               console.log('ERROR Making SERP Scraper Cron Request..');
               console.log(err);
            });
         }, { scheduled: true });
      }

      const notif_interval = (!settings.notification_interval || settings.notification_interval === 'never') ? false : settings.notification_interval;
      if (notif_interval) {
         const cronTime = generateCronTime(notif_interval === 'daily' ? 'daily_morning' : notif_interval);
         if (cronTime) {
            new Cron(cronTime, () => {
               const fetchOpts = { method: 'POST', headers: { Authorization: `Bearer ${process.env.APIKEY}` } };
               fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify`, fetchOpts)
               .then((res) => res.json())
               .then((data) => console.log(data))
               .catch((err) => {
                  console.log('ERROR Making Cron Email Notification Request..');
                  console.log(err);
               });
            }, { scheduled: true });
         }
      }
   });

   const failedCronTime = generateCronTime('hourly');
   new Cron(failedCronTime, async () => {
      try {
         await connection.sync();
         const failedQueueRecord = await Settings.findOne({ where: { key: 'failed_queue' } });
         const keywordsToRetry = failedQueueRecord?.value ? JSON.parse(failedQueueRecord.value) : [];
         
         if (keywordsToRetry.length > 0) {
            const fetchOpts = { method: 'POST', headers: { Authorization: `Bearer ${process.env.APIKEY}` } };
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/refresh?id=${keywordsToRetry.join(',')}`, fetchOpts)
            .then((res) => res.json())
            .then((refreshedData) => console.log(refreshedData))
            .catch((fetchErr) => {
               console.log('ERROR Making failed_queue Cron Request..');
               console.log(fetchErr);
            });
         }
      } catch (error) {
         console.log('ERROR Reading Failed Scrapes Queue..', error);
      }
   }, { scheduled: true });

   if (process.env.SEARCH_CONSOLE_PRIVATE_KEY && process.env.SEARCH_CONSOLE_CLIENT_EMAIL) {
      const searchConsoleCRONTime = generateCronTime('daily');
      new Cron(searchConsoleCRONTime, () => {
         const fetchOpts = { method: 'POST', headers: { Authorization: `Bearer ${process.env.APIKEY}` } };
         fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/searchconsole`, fetchOpts)
         .then((res) => res.json())
         .then((data) => console.log(data))
         .catch((err) => {
            console.log('ERROR Making Google Search Console Scraper Cron Request..');
            console.log(err);
         });
      }, { scheduled: true });
   }
};

runAppCronJobs();

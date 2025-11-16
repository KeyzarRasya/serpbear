import type { NextApiRequest, NextApiResponse } from 'next';
import Cryptr from 'cryptr';
import getConfig from 'next/config';
import db from '../../database/database';
import Settings from '../../database/models/settings';
import verifyUser from '../../utils/verifyUser';
import allScrapers from '../../scrapers/index';

type SettingsGetResponse = {
   settings?: object | null,
   error?: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   await db.sync();
   const authorized = verifyUser(req, res);
   if (authorized !== 'authorized') {
      return res.status(401).json({ error: authorized });
   }
   if (req.method === 'GET') {
      return getSettings(req, res);
   }
   if (req.method === 'PUT') {
      return updateSettings(req, res);
   }
   return res.status(502).json({ error: 'Unrecognized Route.' });
}

const getSettings = async (req: NextApiRequest, res: NextApiResponse<SettingsGetResponse>) => {
   const settings = await getAppSettings();
   if (settings) {
      const { publicRuntimeConfig } = getConfig();
      const version = publicRuntimeConfig?.version;
      return res.status(200).json({ settings: { ...settings, version } });
   }
   return res.status(400).json({ error: 'Error Loading Settings!' });
};

const updateSettings = async (req: NextApiRequest, res: NextApiResponse<SettingsGetResponse>) => {
   const { settings } = req.body || {};
   
   console.log('[DEBUG] Updating settings:', JSON.stringify(settings, null, 2));
   
   if (!settings) {
      return res.status(400).json({ error: 'Settings Data not Provided!' });
   }
   
   try {
      const cryptr = new Cryptr(process.env.SECRET as string);
      const scaping_api = settings.scaping_api ? cryptr.encrypt(settings.scaping_api.trim()) : '';
      const smtp_password = settings.smtp_password ? cryptr.encrypt(settings.smtp_password.trim()) : '';
      const search_console_client_email = settings.search_console_client_email ? cryptr.encrypt(settings.search_console_client_email.trim()) : '';
      const search_console_private_key = settings.search_console_private_key ? cryptr.encrypt(settings.search_console_private_key.trim()) : '';
      const adwords_client_id = settings.adwords_client_id ? cryptr.encrypt(settings.adwords_client_id.trim()) : '';
      const adwords_client_secret = settings.adwords_client_secret ? cryptr.encrypt(settings.adwords_client_secret.trim()) : '';
      const adwords_developer_token = settings.adwords_developer_token ? cryptr.encrypt(settings.adwords_developer_token.trim()) : '';
      const adwords_account_id = settings.adwords_account_id ? cryptr.encrypt(settings.adwords_account_id.trim()) : '';
      const adwords_refresh_token = settings.adwords_refresh_token ? cryptr.encrypt(settings.adwords_refresh_token.trim()) : '';

      const securedSettings = {
         ...settings,
         scaping_api,
         smtp_password,
         search_console_client_email,
         search_console_private_key,
         adwords_client_id,
         adwords_client_secret,
         adwords_developer_token,
         adwords_account_id,
         adwords_refresh_token,
      };

      console.log('[DEBUG] Upserting settings to database...');
      await Settings.upsert({ key: 'app_settings', value: JSON.stringify(securedSettings) });
      console.log('[SUCCESS] Settings updated successfully');
      
      return res.status(200).json({ settings });
   } catch (error: any) {
      console.error('[ERROR] Updating App Settings:', error);
      console.error('[ERROR] Error details:', error?.message, error?.stack);
      return res.status(500).json({ error: `Error Updating Settings: ${error?.message || 'Unknown error'}` });
   }
};

export const getAppSettings = async (): Promise<SettingsType> => {
   const screenshotAPIKey = process.env.SCREENSHOT_API || '69408-serpbear';
   try {
      const settingsRecord = await Settings.findOne({ where: { key: 'app_settings' } });
      const failedQueueRecord = await Settings.findOne({ where: { key: 'failed_queue' } });
      
      const failedQueue: string[] = failedQueueRecord?.value ? JSON.parse(failedQueueRecord.value) : [];
      const settings: SettingsType = settingsRecord?.value ? JSON.parse(settingsRecord.value) : {};
      let decryptedSettings = settings;

      try {
         const cryptr = new Cryptr(process.env.SECRET as string);
         const scaping_api = settings.scaping_api ? cryptr.decrypt(settings.scaping_api) : '';
         const smtp_password = settings.smtp_password ? cryptr.decrypt(settings.smtp_password) : '';
         const search_console_client_email = settings.search_console_client_email ? cryptr.decrypt(settings.search_console_client_email) : '';
         const search_console_private_key = settings.search_console_private_key ? cryptr.decrypt(settings.search_console_private_key) : '';
         const adwords_client_id = settings.adwords_client_id ? cryptr.decrypt(settings.adwords_client_id) : '';
         const adwords_client_secret = settings.adwords_client_secret ? cryptr.decrypt(settings.adwords_client_secret) : '';
         const adwords_developer_token = settings.adwords_developer_token ? cryptr.decrypt(settings.adwords_developer_token) : '';
         const adwords_account_id = settings.adwords_account_id ? cryptr.decrypt(settings.adwords_account_id) : '';
         const adwords_refresh_token = settings.adwords_refresh_token ? cryptr.decrypt(settings.adwords_refresh_token) : '';

         decryptedSettings = {
            ...settings,
            scaping_api,
            smtp_password,
            search_console_client_email,
            search_console_private_key,
            search_console_integrated: !!(process.env.SEARCH_CONSOLE_PRIVATE_KEY && process.env.SEARCH_CONSOLE_CLIENT_EMAIL)
            || !!(search_console_client_email && search_console_private_key),
            available_scapers: allScrapers.map((scraper) => ({ label: scraper.name, value: scraper.id, allowsCity: !!scraper.allowsCity })),
            failed_queue: failedQueue,
            screenshot_key: screenshotAPIKey,
            adwords_client_id,
            adwords_client_secret,
            adwords_developer_token,
            adwords_account_id,
            adwords_refresh_token,
         };
      } catch (error) {
         console.log('Error Decrypting Settings API Keys!');
      }

      return decryptedSettings;
   } catch (error) {
      console.log('[ERROR] Getting App Settings. ', error);
      const settings: SettingsType = {
         scraper_type: 'none',
         notification_interval: 'never',
         notification_email: '',
         notification_email_from: '',
         notification_email_from_name: 'SerpBear',
         smtp_server: '',
         smtp_port: '',
         smtp_username: '',
         smtp_password: '',
         scrape_retry: false,
         screenshot_key: screenshotAPIKey,
         search_console: true,
         search_console_client_email: '',
         search_console_private_key: '',
         keywordsColumns: ['Best', 'History', 'Volume', 'Search Console'],
      };
      const otherSettings = {
         available_scapers: allScrapers.map((scraper) => ({ label: scraper.name, value: scraper.id })),
         failed_queue: [],
      };
      
      try {
         await Settings.upsert({ key: 'app_settings', value: JSON.stringify(settings) });
         await Settings.upsert({ key: 'failed_queue', value: JSON.stringify([]) });
      } catch (dbError) {
         console.log('[ERROR] Creating default settings in DB:', dbError);
      }
      
      return { ...settings, ...otherSettings };
   }
};

import { promises as fs } from 'fs';
import { google, searchconsole_v1 } from '@googleapis/searchconsole';
import type { JWT } from 'google-auth-library';
import { getAppSettings } from '../pages/api/settings';
import { getCountryCodeFromAlphaThree } from './countries';
import SearchConsoleData from '../database/models/searchConsoleData';
import { Op } from 'sequelize';

interface SCAPISettings {
   client_email: string,
   private_key: string,
}

export const getSearchConsoleApiInfo = async (domain: DomainType): Promise<SCAPISettings> => {
   const settings = await getAppSettings();
   let SCAPISettings: SCAPISettings = { client_email: '', private_key: '' };
   const integratedSC = process.env.SEARCH_CONSOLE_PRIVATE_KEY && process.env.SEARCH_CONSOLE_CLIENT_EMAIL;
   const { search_console_client_email = '', search_console_private_key = '' } = settings || {};
   const { search_console = '' } = domain || {};
   const domainSCJson: { client_email?: string, private_key?: string } = search_console ? JSON.parse(search_console) : {};
   const { client_email = '', private_key = '' } = domainSCJson;

   if (integratedSC) {
      SCAPISettings = { client_email: process.env.SEARCH_CONSOLE_CLIENT_EMAIL, private_key: process.env.SEARCH_CONSOLE_PRIVATE_KEY };
   } else if (client_email && private_key) {
      const Cryptr = require('cryptr');
      const cryptr = new Cryptr(process.env.SECRET);
      const decrypted_client_email = cryptr.decrypt(client_email);
      const decrypted_private_key = cryptr.decrypt(private_key);
      SCAPISettings = { client_email: decrypted_client_email, private_key: decrypted_private_key };
   } else if (search_console_client_email && search_console_private_key) {
      const Cryptr = require('cryptr');
      const cryptr = new Cryptr(process.env.SECRET);
      const decrypted_client_email = cryptr.decrypt(search_console_client_email);
      const decrypted_private_key = cryptr.decrypt(search_console_private_key);
      SCAPISettings = { client_email: decrypted_client_email, private_key: decrypted_private_key };
   }

   return SCAPISettings;
};

export const fetchSearchConsoleData = async (
   domain: DomainType,
   days = 3,
   type: 'query' | 'stat' | undefined = undefined,
   SCAPI?: SCAPISettings,
): Promise<SearchAnalyticsItem[] | SearchAnalyticsStat[] | SCDomainFetchError> => {
   let jwtClient: JWT | null = null;
   const { client_email, private_key } = SCAPI || {};

   if (!client_email || !private_key) {
      return { error: true, errorMsg: 'Search Console API Details Missing!' };
   }

   try {
      jwtClient = new google.auth.JWT(client_email, undefined, private_key, ['https://www.googleapis.com/auth/webmasters.readonly']);
   } catch (error) {
      return { error: true, errorMsg: 'Error Connecting to Search Console API' };
   }

   const scPropertyType = domain?.search_console ? JSON.parse(domain.search_console) : {};
   const propertyType = scPropertyType?.property_type || 'domain';
   const domainName = propertyType === 'domain' ? `sc-domain:${domain.domain}` : `https://${domain.domain}`;
   let items: SearchAnalyticsItem[] | SearchAnalyticsStat[] = [];
   const dimensions = type === 'stat' ? ['date'] : ['query', 'device', 'country', 'page'];

   try {
      const today = new Date();
      const startDate = new Date(today.getTime() - (86400000 * days));
      const endDate = new Date(today.getTime() - 86400000);
      const res = await google.searchconsole('v1').searchanalytics.query({
         auth: jwtClient,
         siteUrl: domainName,
         requestBody: {
            startDate: `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`,
            endDate: `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`,
            dimensions,
            rowLimit: 25000,
         },
      });

      if (res.data.rows && res.data.rows.length > 0) {
         if (type === 'stat') {
            items = res.data.rows.map((item: searchconsole_v1.Schema$ApiDataRow) => {
               const parsedItem: SearchAnalyticsStat = {
                  date: item.keys && item.keys[0] ? item.keys[0] : '',
                  clicks: item.clicks || 0,
                  impressions: item.impressions || 0,
                  ctr: item.ctr ? item.ctr * 100 : 0,
                  position: item.position || 0,
               };
               return parsedItem;
            });
         } else {
            items = res.data.rows.map((item: searchconsole_v1.Schema$ApiDataRow) => parseSearchConsoleItem(item, domain.domain));
         }
      }
   } catch (error: any) {
      const errMsg = error?.errors && error?.errors[0] && error.errors[0].message ? error.errors[0].message : 'Error Fetching Data!';
      console.log('[ERROR] Fetching Search Analytics Data from Google Search Console. ', error?.errors);
      return { error: true, errorMsg: errMsg };
   }

   return items;
};

export const checkSerchConsoleIntegration = async (domain: DomainType): Promise<{ isValid: boolean, error: string }> => {
   const res = { isValid: false, error: '' };
   const { client_email = '', private_key = '' } = domain?.search_console ? JSON.parse(domain.search_console) : {};
   const response = await fetchSearchConsoleData(domain, 3, undefined, { client_email, private_key });
   if (Array.isArray(response)) { res.isValid = true; }
   if ((response as SCDomainFetchError)?.errorMsg) { res.error = (response as SCDomainFetchError).errorMsg; }
   return res;
};

export const readLocalSCData = async (domain: string): Promise<SCDomainDataType | false> => {
   try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (86400000 * 30));
      const sevenDaysAgo = new Date(today.getTime() - (86400000 * 7));
      const threeDaysAgo = new Date(today.getTime() - (86400000 * 3));

      const allData = await SearchConsoleData.findAll({
         where: {
            domain,
            date: {
               [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0],
            }
         },
         order: [['date', 'DESC']],
      });

      if (!allData || allData.length === 0) {
         return false;
      }

      const parseData = (data: SearchConsoleData[]): SearchAnalyticsItem[] => {
         return data.map(item => {
            const plainItem = item.get({ plain: true });
            return {
               keyword: plainItem.keyword,
               uid: plainItem.uid,
               device: plainItem.device,
               country: plainItem.country,
               clicks: plainItem.clicks,
               impressions: plainItem.impressions,
               ctr: plainItem.ctr,
               position: plainItem.position,
               page: plainItem.page,
            };
         });
      };

      const threeDaysData = allData.filter(item => {
         const itemDate = new Date(item.get('date') as string);
         return itemDate >= threeDaysAgo;
      });

      const sevenDaysData = allData.filter(item => {
         const itemDate = new Date(item.get('date') as string);
         return itemDate >= sevenDaysAgo;
      });

      const scDomainData: SCDomainDataType = {
         threeDays: parseData(threeDaysData),
         sevenDays: parseData(sevenDaysData),
         thirtyDays: parseData(allData),
         lastFetched: allData.length > 0 ? new Date().toJSON() : '',
         lastFetchError: '',
         stats: [],
      };

      const statsData = await SearchConsoleData.findAll({
         where: {
            domain,
            date: {
               [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0],
            }
         },
         attributes: [
            'date',
            [SearchConsoleData.sequelize!.fn('SUM', SearchConsoleData.sequelize!.col('clicks')), 'clicks'],
            [SearchConsoleData.sequelize!.fn('SUM', SearchConsoleData.sequelize!.col('impressions')), 'impressions'],
            [SearchConsoleData.sequelize!.fn('AVG', SearchConsoleData.sequelize!.col('ctr')), 'ctr'],
            [SearchConsoleData.sequelize!.fn('AVG', SearchConsoleData.sequelize!.col('position')), 'position'],
         ],
         group: ['date'],
         order: [['date', 'ASC']],
         raw: true,
      });

      scDomainData.stats = statsData.map((stat: any) => ({
         date: stat.date,
         clicks: parseInt(stat.clicks, 10) || 0,
         impressions: parseInt(stat.impressions, 10) || 0,
         ctr: parseFloat(stat.ctr) || 0,
         position: parseFloat(stat.position) || 0,
      }));

      return scDomainData;
   } catch (error) {
      console.log('[ERROR] Reading Local SC Data from Database: ', error);
      return false;
   }
};

export const updateLocalSCData = async (domain: string, scDomainData?: SCDomainDataType): Promise<SCDomainDataType | false> => {
   return scDomainData || {
      threeDays: [],
      sevenDays: [],
      thirtyDays: [],
      lastFetched: '',
      lastFetchError: '',
      stats: [],
   };
};

export const removeLocalSCData = async (domain: string): Promise<boolean> => {
   try {
      await SearchConsoleData.destroy({ where: { domain } });
      return true;
   } catch (error) {
      console.log('[ERROR] Removing SC Data from Database: ', error);
      return false;
   }
};

export const fetchDomainSCData = async (domain: DomainType, scAPI?: SCAPISettings): Promise<SCDomainDataType> => {
   const scDomainData: SCDomainDataType = {
      threeDays: [],
      sevenDays: [],
      thirtyDays: [],
      lastFetched: '',
      lastFetchError: '',
      stats: [],
   };

   if (!domain.domain || !scAPI) {
      return scDomainData;
   }

   try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      const dateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const items = await fetchSearchConsoleData(domain, 1, undefined, scAPI);

      if (Array.isArray(items)) {
         const bulkData = items.map((item: SearchAnalyticsItem) => ({
            domain: domain.domain,
            date: dateStr,
            keyword: item.keyword,
            device: item.device,
            country: item.country,
            clicks: item.clicks,
            impressions: item.impressions,
            ctr: item.ctr,
            position: item.position,
            page: item.page,
            uid: item.uid,
         }));

         await SearchConsoleData.destroy({
            where: {
               domain: domain.domain,
               date: dateStr,
            }
         });

         await SearchConsoleData.bulkCreate(bulkData);

         scDomainData.lastFetched = new Date().toJSON();
         console.log(`[SUCCESS] Stored ${bulkData.length} SC records for ${domain.domain} on ${dateStr}`);
      } else if (items.error) {
         scDomainData.lastFetchError = items.errorMsg;
         console.log('[ERROR] Fetching SC Data: ', items.errorMsg);
      }

      const stats = await fetchSearchConsoleData(domain, 30, 'stat', scAPI);
      if (stats && Array.isArray(stats) && stats.length > 0) {
         scDomainData.stats = stats as SearchAnalyticsStat[];
      }

      const localData = await readLocalSCData(domain.domain);
      if (localData) {
         scDomainData.threeDays = localData.threeDays;
         scDomainData.sevenDays = localData.sevenDays;
         scDomainData.thirtyDays = localData.thirtyDays;
      }
   } catch (error) {
      console.log('[ERROR] Fetching Domain SC Data: ', error);
   }

   return scDomainData;
};

export const parseSearchConsoleItem = (SCItem: SearchAnalyticsRawItem, domainName: string): SearchAnalyticsItem => {
   const { clicks = 0, impressions = 0, ctr = 0, position = 0 } = SCItem;
   const keyword = SCItem.keys[0];
   const device = SCItem.keys[1] ? SCItem.keys[1].toLowerCase() : 'desktop';
   const country = SCItem.keys[2] ? (getCountryCodeFromAlphaThree(SCItem.keys[2].toUpperCase()) || SCItem.keys[2]) : 'ZZ';
   const page = SCItem.keys[3] ? SCItem.keys[3].replace('https://', '').replace('http://', '').replace('www', '').replace(domainName, '') : '';
   const uid = `${country.toLowerCase()}:${device}:${keyword.replaceAll(' ', '_')}`;

   return { keyword, uid, device, country, clicks, impressions, ctr: ctr * 100, position, page };
};

export const integrateKeywordSCData = (keyword: KeywordType, scData: SCDomainDataType): KeywordType => {
   const { device, country, keyword: theKeyword } = keyword;
   const uid = `${country.toLowerCase()}:${device}:${theKeyword.replaceAll(' ', '_')}`;
   const matchedSCItem = scData.thirtyDays.find((item) => item.uid === uid);

   if (matchedSCItem) {
      return {
         ...keyword,
         scData: {
            clicks: matchedSCItem.clicks,
            impressions: matchedSCItem.impressions,
            ctr: matchedSCItem.ctr,
            position: matchedSCItem.position,
         },
      };
   }

   return keyword;
};
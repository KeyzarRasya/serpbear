import type { AxiosResponse } from 'axios';
import axiosClient from './client';
import Settings from '../database/models/settings';

export const scrapeKeywordFromGoogle = async (keywords: KeywordType[], settings: SettingsType): Promise<{[key: string]: RefreshResult}> => {
   console.log(`[Scraper] Starting scrape for ${keywords.length} keywords using ${settings.scraper_type}`);
   const totalStartTime = Date.now();
   
   const results: {[key: string]: RefreshResult} = {};
   
   for (const keyword of keywords) {
      const keywordStartTime = Date.now();
      console.log(`[Scraper] Scraping keyword: "${keyword.keyword}" (Device: ${keyword.device}, Country: ${keyword.country})`);
      
      try {
         const result = await scrapeKeyword(keyword, settings);
         results[keyword.ID] = result;
         
         const keywordDuration = Date.now() - keywordStartTime;
         console.log(`[Scraper] Keyword "${keyword.keyword}" scraped in ${keywordDuration}ms (Position: ${result.position})`);
         
         // Add delay between requests if configured
         if (settings.scrape_delay && settings.scrape_delay !== 'none') {
            const delay = parseInt(settings.scrape_delay) * 1000;
            console.log(`[Scraper] Waiting ${delay}ms before next request...`);
            await new Promise(resolve => setTimeout(resolve, delay));
         }
      } catch (error: any) {
         const keywordDuration = Date.now() - keywordStartTime;
         console.error(`[Scraper] Error scraping "${keyword.keyword}" after ${keywordDuration}ms:`, error.message);
         results[keyword.ID] = {
            position: keyword.position || 0,
            url: '',
            result: [],
            error: error.message || 'Unknown scraping error',
         };
      }
   }
   
   const totalDuration = Date.now() - totalStartTime;
   console.log(`[Scraper] Completed scraping ${keywords.length} keywords in ${totalDuration}ms`);
   
   return results;
};

const scrapeKeyword = async (keyword: KeywordType, settings: SettingsType): Promise<RefreshResult> => {
   const { scraper_type } = settings;
   
   console.log(`[Scraper] Using scraper type: ${scraper_type}`);
   
   if (scraper_type === 'none') {
      return {
         position: 0,
         url: '',
         result: [],
         error: 'No scraper configured',
      };
   }
   
   // Import the specific scraper dynamically
   const scraperModule = await import(`../scrapers/${scraper_type}`);
   const scraper = scraperModule.default;
   
   if (!scraper || typeof scraper.scrape !== 'function') {
      throw new Error(`Scraper ${scraper_type} not found or invalid`);
   }
   
   console.log(`[Scraper] Calling ${scraper_type} scraper...`);
   const scraperStartTime = Date.now();
   
   const result = await scraper.scrape(keyword, settings);
   
   const scraperDuration = Date.now() - scraperStartTime;
   console.log(`[Scraper] ${scraper_type} returned result in ${scraperDuration}ms`);
   
   return result;
};

export const retryScrape = async (keywordID: number): Promise<void> => {
   if (!keywordID || !Number.isInteger(keywordID)) { return; }
   
   try {
      const failedQueueRecord = await Settings.findOne({ where: { key: 'failed_queue' } });
      let currentQueue: number[] = failedQueueRecord?.value ? JSON.parse(failedQueueRecord.value) : [];

      if (!currentQueue.includes(keywordID)) {
         currentQueue.push(Math.abs(keywordID));
      }

      await Settings.upsert({ key: 'failed_queue', value: JSON.stringify(currentQueue) });
   } catch (error) {
      console.log('[ERROR] Adding to Retry Queue: ', error);
   }
};

export const removeFromRetryQueue = async (keywordID: number): Promise<void> => {
   if (!keywordID || !Number.isInteger(keywordID)) { return; }
   
   try {
      const failedQueueRecord = await Settings.findOne({ where: { key: 'failed_queue' } });
      let currentQueue: number[] = failedQueueRecord?.value ? JSON.parse(failedQueueRecord.value) : [];
      currentQueue = currentQueue.filter((item) => item !== Math.abs(keywordID));

      await Settings.upsert({ key: 'failed_queue', value: JSON.stringify(currentQueue) });
   } catch (error) {
      console.log('[ERROR] Removing from Retry Queue: ', error);
   }
};
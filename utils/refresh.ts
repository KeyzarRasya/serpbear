import Keyword from '../database/models/keyword';
import parseKeywords from './parseKeywords';
import { scrapeKeywordFromGoogle } from './scraper';

export default async function refreshAndUpdateKeywords(keywords: Keyword[], settings: SettingsType): Promise<void> {
   console.log(`[Refresh] Starting refresh for ${keywords.length} keywords`);
   const startTime = Date.now();
   
   const keywordsParsed = parseKeywords(keywords.map((k) => k.get({ plain: true })));
   
   // Scrape all keywords at once
   const scrapedResults = await scrapeKeywordFromGoogle(keywordsParsed, settings);
   
   // Update each keyword with its result
   for (const keyword of keywords) {
      const keywordStartTime = Date.now();
      try {
         const keywordId = keyword.get('ID') as number;
         const result = scrapedResults[keywordId];
         
         if (result) {
            await updateKeywordPosition(keyword, result, settings);
         }
         
         const keywordDuration = Date.now() - keywordStartTime;
         console.log(`[Refresh] Keyword "${keyword.get('keyword')}" updated in ${keywordDuration}ms`);
      } catch (error) {
         console.error(`[Refresh] Error processing keyword ${keyword.get('keyword')}:`, error);
      }
   }
   
   const totalDuration = Date.now() - startTime;
   console.log(`[Refresh] Completed all ${keywords.length} keywords in ${totalDuration}ms`);
}

export const updateKeywordPosition = async (keywordRaw: Keyword, updatedkeyword: RefreshResult, settings: SettingsType): Promise<KeywordType> => {
   const keywordParsed = parseKeywords([keywordRaw.get({ plain: true })]);
   const keyword = keywordParsed[0];
   let updated = keyword;

   if (updatedkeyword && keyword) {
      const newPos = updatedkeyword.position;
      const { history } = keyword;
      const theDate = new Date();
      const dateKey = `${theDate.getFullYear()}-${theDate.getMonth() + 1}-${theDate.getDate()}`;
      history[dateKey] = newPos;

      const updatedVal = {
         position: newPos,
         updating: false,
         url: updatedkeyword.url,
         lastResult: updatedkeyword.result,
         history,
         lastUpdated: updatedkeyword.error ? keyword.lastUpdated : theDate.toJSON(),
         lastUpdateError: updatedkeyword.error
            ? JSON.stringify({ date: theDate.toJSON(), error: `${updatedkeyword.error}`, scraper: settings.scraper_type })
            : 'false',
      };

      if (updatedkeyword.error && settings?.scrape_retry) {
         const { retryScrape } = await import('./scraper');
         await retryScrape(keyword.ID);
      } else {
         const { removeFromRetryQueue } = await import('./scraper');
         await removeFromRetryQueue(keyword.ID);
      }

      try {
         await keywordRaw.update({
            ...updatedVal,
            lastResult: Array.isArray(updatedkeyword.result) ? JSON.stringify(updatedkeyword.result) : updatedkeyword.result,
            history: JSON.stringify(history),
         });
         console.log(`[SUCCESS] Updated keyword position for: ${keyword.keyword} (Position: ${newPos})`);
         updated = { ...keyword, ...updatedVal, lastUpdateError: updatedVal.lastUpdateError !== 'false' ? JSON.parse(updatedVal.lastUpdateError) : false };
      } catch (error) {
         console.error(`[ERROR] Failed to update keyword in database: ${keyword.keyword}`, error);
      }
   }

   return updated;
};
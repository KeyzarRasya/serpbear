import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import db from '../../database/database';
import Keyword from '../../database/models/keyword';
import { getAppSettings } from './settings';
import verifyUser from '../../utils/verifyUser';
import parseKeywords from '../../utils/parseKeywords';
import refreshAndUpdateKeywords from '../../utils/refresh';
import { getKeywordsVolume, updateKeywordsVolumeData } from '../../utils/adwords';

type KeywordsGetResponse = {
   keywords?: KeywordType[],
   error?: string|null,
}

type KeywordsDeleteRes = {
   domainRemoved?: number,
   keywordsRemoved?: number,
   error?: string|null,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   await db.sync();
   const authorized = verifyUser(req, res);
   if (authorized !== 'authorized') {
      return res.status(401).json({ error: authorized });
   }

   if (req.method === 'GET') {
      return getKeywords(req, res);
   }
   if (req.method === 'POST') {
      return addKeywords(req, res);
   }
   if (req.method === 'DELETE') {
      return deleteKeywords(req, res);
   }
   if (req.method === 'PUT') {
      return updateKeywords(req, res);
   }
   return res.status(502).json({ error: 'Unrecognized Route.' });
}

const getKeywords = async (req: NextApiRequest, res: NextApiResponse<KeywordsGetResponse>) => {
   const startTime = Date.now();
   console.log('[GET /api/keywords] Request received');
   
   if (!req.query.domain || typeof req.query.domain !== 'string') {
      return res.status(400).json({ error: 'Domain is Required!' });
   }
   
   const domain = (req.query.domain as string);
   console.log(`[GET /api/keywords] Fetching keywords for domain: ${domain}`);

   try {
      const dbStartTime = Date.now();
      const allKeywords: Keyword[] = await Keyword.findAll({ where: { domain } });
      const dbDuration = Date.now() - dbStartTime;
      console.log(`[GET /api/keywords] Database query completed in ${dbDuration}ms (${allKeywords.length} keywords found)`);
      
      const parseStartTime = Date.now();
      const keywords: KeywordType[] = parseKeywords(allKeywords.map((e) => e.get({ plain: true })));
      const parseDuration = Date.now() - parseStartTime;
      console.log(`[GET /api/keywords] Parsing completed in ${parseDuration}ms`);
      
      const processStartTime = Date.now();
      const processedKeywords = keywords.map((keyword) => {
         const historyArray = Object.keys(keyword.history).map((dateKey: string) => ({
            date: new Date(dateKey).getTime(),
            dateRaw: dateKey,
            position: keyword.history[dateKey],
         }));
         const historySorted = historyArray.sort((a, b) => a.date - b.date);
         const lastWeekHistory: KeywordHistory = {};
         historySorted.slice(-7).forEach((x: any) => { lastWeekHistory[x.dateRaw] = x.position; });
         
         return { ...keyword, lastResult: [], history: lastWeekHistory };
      });
      const processDuration = Date.now() - processStartTime;
      console.log(`[GET /api/keywords] Processing completed in ${processDuration}ms`);
      
      const totalDuration = Date.now() - startTime;
      console.log(`[GET /api/keywords] Total request completed in ${totalDuration}ms`);
      
      return res.status(200).json({ keywords: processedKeywords });
   } catch (error) {
      console.error('[ERROR] Getting Domain Keywords for', domain, error);
      return res.status(400).json({ error: 'Error Loading Keywords for this Domain.' });
   }
};

const addKeywords = async (req: NextApiRequest, res: NextApiResponse<KeywordsGetResponse>) => {
   const { keywords } = req.body;
   if (keywords && Array.isArray(keywords) && keywords.length > 0) {
      const keywordsToAdd: any = [];

      keywords.forEach((kwrd: KeywordAddPayload) => {
         const { keyword, device, country, domain, tags, city } = kwrd;
         const tagsArray = tags ? tags.split(',').map((item: string) => item.trim()) : [];
         const newKeyword = {
            keyword,
            device,
            domain,
            country,
            city,
            position: 0,
            updating: true,
            history: JSON.stringify({}),
            url: '',
            tags: JSON.stringify(tagsArray),
            sticky: false,
            lastUpdated: new Date().toJSON(),
            added: new Date().toJSON(),
         };
         keywordsToAdd.push(newKeyword);
      });

      try {
         const newKeywords: Keyword[] = await Keyword.bulkCreate(keywordsToAdd);
         const formattedkeywords = newKeywords.map((el) => el.get({ plain: true }));
         const keywordsParsed: KeywordType[] = parseKeywords(formattedkeywords);

         const settings = await getAppSettings();
         refreshAndUpdateKeywords(newKeywords, settings);

         const { adwords_account_id, adwords_client_id, adwords_client_secret, adwords_developer_token } = settings;
         if (adwords_account_id && adwords_client_id && adwords_client_secret && adwords_developer_token) {
            const keywordsVolumeData = await getKeywordsVolume(keywordsParsed);
            if (keywordsVolumeData.volumes !== false) {
               await updateKeywordsVolumeData(keywordsVolumeData.volumes);
            }
         }

         return res.status(201).json({ keywords: keywordsParsed });
      } catch (error) {
         console.log('[ERROR] Adding New Keywords ', error);
         return res.status(400).json({ error: 'Could Not Add New Keyword!' });
      }
   } else {
      return res.status(400).json({ error: 'Necessary Keyword Data Missing' });
   }
};

const deleteKeywords = async (req: NextApiRequest, res: NextApiResponse<KeywordsDeleteRes>) => {
   if (!req.query.id || typeof req.query.id !== 'string') {
      return res.status(400).json({ error: 'keyword ID is Required!' });
   }
   const keywordIDS: number[] = req.query.id.split(',').map((id: string) => parseInt(id, 10));
   try {
      const removed: number = await Keyword.destroy({ where: { ID: { [Op.in]: keywordIDS } } });
      return res.status(200).json({ keywordsRemoved: removed });
   } catch (error) {
      console.log('[ERROR] Removing Keywords: ', req.query.id, error);
      return res.status(400).json({ error: 'Error Removing Keywords!' });
   }
};

const updateKeywords = async (req: NextApiRequest, res: NextApiResponse) => {
   const { keywords } = req.body;
   if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords Data is Required!' });
   }
   try {
      for (const keywordData of keywords) {
         const { ID, ...updateData } = keywordData;
         if (updateData.tags) {
            updateData.tags = JSON.stringify(updateData.tags);
         }
         await Keyword.update(updateData, { where: { ID } });
      }
      return res.status(200).json({ success: true });
   } catch (error) {
      console.log('[ERROR] Updating Keywords: ', error);
      return res.status(400).json({ error: 'Error Updating Keywords!' });
   }
};
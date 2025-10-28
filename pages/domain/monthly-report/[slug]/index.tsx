import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CSSTransition } from 'react-transition-group';
import Sidebar from '../../../../components/common/Sidebar';
import TopBar from '../../../../components/common/TopBar';
import DomainHeader from '../../../../components/domains/DomainHeader';
import AddDomain from '../../../../components/domains/AddDomain';
import DomainSettings from '../../../../components/domains/DomainSettings';
import Settings from '../../../../components/settings/Settings';
import { useFetchDomains } from '../../../../services/domains';
import { useFetchSettings } from '../../../../services/settings';
import MonthlyReportView from '../../../../components/monthly-report/MonthlyReportView';
import Footer from '../../../../components/common/Footer';

const MonthlyReportPage: NextPage = () => {
   const router = useRouter();
   const [showDomainSettings, setShowDomainSettings] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
   const [showAddDomain, setShowAddDomain] = useState(false);

   const { data: appSettings } = useFetchSettings();
   const { data: domainsData } = useFetchDomains(router);

   const theDomains: DomainType[] = (domainsData && domainsData.domains) || [];

   const activDomain: DomainType|null = useMemo(() => {
      let active:DomainType|null = null;
      if (domainsData?.domains && router.query?.slug) {
         active = domainsData.domains.find((x:DomainType) => x.slug === router.query.slug) || null;
      }
      return active;
   }, [router.query.slug, domainsData]);

   // Mock data - in production this would come from API
   const reportData = {
      period: 'October 2025',
      keywordRankings: [
         { keyword: 'best seo tools', position: 3, previousPosition: 5, change: 2 },
         { keyword: 'keyword research', position: 7, previousPosition: 12, change: 5 },
         { keyword: 'rank tracker', position: 15, previousPosition: 14, change: -1 },
         { keyword: 'serp analysis', position: 8, previousPosition: 8, change: 0 },
         { keyword: 'seo monitoring', position: 4, previousPosition: 6, change: 2 },
      ],
      traffic: {
         totalVisits: 45230,
         previousTotalVisits: 38500,
         visitChange: 17.5,
         avgSessionDuration: '3m 24s',
         popularPages: [
            { url: '/blog/seo-guide', views: 12400 },
            { url: '/features', views: 8900 },
            { url: '/pricing', views: 6700 },
            { url: '/blog/keyword-research', views: 5200 },
            { url: '/about', views: 3800 },
         ],
         sources: {
            organic: 62.5,
            referral: 18.3,
            social: 12.8,
            direct: 6.4,
         },
      },
      competitors: [
         { name: 'competitor1.com', totalVisits: 52000, keywords: [
            { keyword: 'best seo tools', position: 1 },
            { keyword: 'keyword research', position: 4 },
            { keyword: 'rank tracker', position: 8 },
            { keyword: 'serp analysis', position: 5 },
            { keyword: 'seo monitoring', position: 7 },
         ]},
         { name: 'competitor2.com', totalVisits: 38000, keywords: [
            { keyword: 'best seo tools', position: 5 },
            { keyword: 'keyword research', position: 3 },
            { keyword: 'rank tracker', position: 12 },
            { keyword: 'serp analysis', position: 9 },
            { keyword: 'seo monitoring', position: 6 },
         ]},
         { name: 'competitor3.com', totalVisits: 29000, keywords: [
            { keyword: 'best seo tools', position: 8 },
            { keyword: 'keyword research', position: 15 },
            { keyword: 'rank tracker', position: 6 },
            { keyword: 'serp analysis', position: 11 },
            { keyword: 'seo monitoring', position: 10 },
         ]},
      ],
      insights: {
         keywordRecommendations: [
            'seo tools comparison',
            'free keyword research tool',
            'serp tracker api',
            'google ranking checker',
            'seo audit checklist',
         ],
         topOpportunities: [
            'Focus on long-tail variations of "best seo tools"',
            'Create more content around "keyword research" - high traffic potential',
            'Improve pages for "rank tracker" - close to page 1',
         ],
      },
   };

   return (
      <div className="Domain ">
         {activDomain && activDomain.domain
         && <Head>
               <title>{`${activDomain.domain} - Monthly Site Report` } </title>
            </Head>
         }
         <TopBar showSettings={() => setShowSettings(true)} showAddModal={() => setShowAddDomain(true)} />
         <div className="flex w-full max-w-7xl mx-auto">
            <Sidebar domains={theDomains} showAddModal={() => setShowAddDomain(true)} />
            <div className="domain_kewywords px-5 pt-10 lg:px-0 lg:pt-8 w-full">
               {activDomain && activDomain.domain ? (
                  <DomainHeader
                  domain={activDomain}
                  domains={theDomains}
                  showAddModal={() => console.log('XXXXX')}
                  showSettingsModal={setShowDomainSettings}
                  exportCsv={() => console.log('Export report')}
                  />
               ) : <div className='w-full lg:h-[100px]'></div>
               }
               <MonthlyReportView
               domain={activDomain}
               reportData={reportData}
               />
            </div>
         </div>

         <CSSTransition in={showAddDomain} timeout={300} classNames="modal_anim" unmountOnExit mountOnEnter>
            <AddDomain closeModal={() => setShowAddDomain(false)} domains={domainsData?.domains || []} />
         </CSSTransition>

         <CSSTransition in={showDomainSettings} timeout={300} classNames="modal_anim" unmountOnExit mountOnEnter>
            <DomainSettings
            domain={showDomainSettings && theDomains && activDomain && activDomain.domain ? activDomain : false}
            closeModal={setShowDomainSettings}
            />
         </CSSTransition>
         <CSSTransition in={showSettings} timeout={300} classNames="settings_anim" unmountOnExit mountOnEnter>
             <Settings closeSettings={() => setShowSettings(false)} />
         </CSSTransition>
         <Footer currentVersion={appSettings?.settings?.version ? appSettings.settings.version : ''} />
      </div>
   );
};

export default MonthlyReportPage;
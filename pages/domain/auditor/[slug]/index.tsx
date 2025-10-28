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
import SiteAuditorTable from '../../../../components/auditor/SiteAuditorTable';
import Footer from '../../../../components/common/Footer';

const SiteAuditorPage: NextPage = () => {
   const router = useRouter();
   const [showDomainSettings, setShowDomainSettings] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
   const [showAddDomain, setShowAddDomain] = useState(false);
   const [isAuditing, setIsAuditing] = useState(false);
   const [auditData, setAuditData] = useState<any[]>([
      { id: 1, type: 'SEO', status: 'Passed', element: 'Meta Title', keterangan: 'Title tag is present and optimized (60 characters)' },
      { id: 2, type: 'SEO', status: 'Warning', element: 'Meta Description', keterangan: 'Description needs to be between 150-160 characters. Current: 142 characters' },
      { id: 3, type: 'Performance', status: 'Passed', element: 'Page Speed', keterangan: 'Page loads in 2.3 seconds - within acceptable range' },
      { id: 4, type: 'Accessibility', status: 'Failed', element: 'Alt Tags', keterangan: '3 images missing alt attributes. Images should have descriptive alt text' },
      { id: 5, type: 'SEO', status: 'Failed', element: 'H1 Tags', keterangan: 'Multiple H1 tags found on page. Only one H1 tag should be used per page' },
      { id: 6, type: 'SEO', status: 'Passed', element: 'Robots.txt', keterangan: 'Robots.txt file is properly configured and accessible' },
      { id: 7, type: 'Performance', status: 'Warning', element: 'Image Optimization', keterangan: '5 images are larger than 500KB. Consider compressing images' },
      { id: 8, type: 'SEO', status: 'Passed', element: 'Sitemap.xml', keterangan: 'XML sitemap is present and properly formatted with 45 URLs' },
      { id: 9, type: 'Accessibility', status: 'Warning', element: 'Contrast Ratio', keterangan: '2 elements have insufficient color contrast. WCAG AA requires 4.5:1 ratio' },
      { id: 10, type: 'Security', status: 'Passed', element: 'HTTPS', keterangan: 'SSL certificate is valid and properly configured' },
      { id: 11, type: 'SEO', status: 'Failed', element: 'Canonical Tags', keterangan: 'Missing canonical tags on 3 pages. This may cause duplicate content issues' },
      { id: 12, type: 'Performance', status: 'Passed', element: 'Minification', keterangan: 'CSS and JavaScript files are properly minified' },
      { id: 13, type: 'SEO', status: 'Passed', element: 'Schema Markup', keterangan: 'Structured data is implemented correctly using JSON-LD format' },
      { id: 14, type: 'Accessibility', status: 'Passed', element: 'ARIA Labels', keterangan: 'Interactive elements have proper ARIA labels' },
      { id: 15, type: 'Performance', status: 'Warning', element: 'Caching', keterangan: 'Browser caching is enabled but cache duration could be increased' },
   ]);

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

   const handleStartAuditing = () => {
      setIsAuditing(true);
      // Simulate audit refresh - in real implementation this would call an API
      setTimeout(() => {
         setAuditData([
            { id: 1, type: 'SEO', status: 'Passed', element: 'Meta Title', keterangan: 'Title tag is present and optimized (60 characters)' },
            { id: 2, type: 'SEO', status: 'Warning', element: 'Meta Description', keterangan: 'Description needs to be between 150-160 characters. Current: 142 characters' },
            { id: 3, type: 'Performance', status: 'Passed', element: 'Page Speed', keterangan: 'Page loads in 2.3 seconds - within acceptable range' },
            { id: 4, type: 'Accessibility', status: 'Failed', element: 'Alt Tags', keterangan: '3 images missing alt attributes. Images should have descriptive alt text' },
            { id: 5, type: 'SEO', status: 'Failed', element: 'H1 Tags', keterangan: 'Multiple H1 tags found on page. Only one H1 tag should be used per page' },
            { id: 6, type: 'SEO', status: 'Passed', element: 'Robots.txt', keterangan: 'Robots.txt file is properly configured and accessible' },
            { id: 7, type: 'Performance', status: 'Warning', element: 'Image Optimization', keterangan: '5 images are larger than 500KB. Consider compressing images' },
            { id: 8, type: 'SEO', status: 'Passed', element: 'Sitemap.xml', keterangan: 'XML sitemap is present and properly formatted with 45 URLs' },
            { id: 9, type: 'Accessibility', status: 'Warning', element: 'Contrast Ratio', keterangan: '2 elements have insufficient color contrast. WCAG AA requires 4.5:1 ratio' },
            { id: 10, type: 'Security', status: 'Passed', element: 'HTTPS', keterangan: 'SSL certificate is valid and properly configured' },
            { id: 11, type: 'SEO', status: 'Failed', element: 'Canonical Tags', keterangan: 'Missing canonical tags on 3 pages. This may cause duplicate content issues' },
            { id: 12, type: 'Performance', status: 'Passed', element: 'Minification', keterangan: 'CSS and JavaScript files are properly minified' },
            { id: 13, type: 'SEO', status: 'Passed', element: 'Schema Markup', keterangan: 'Structured data is implemented correctly using JSON-LD format' },
            { id: 14, type: 'Accessibility', status: 'Passed', element: 'ARIA Labels', keterangan: 'Interactive elements have proper ARIA labels' },
            { id: 15, type: 'Performance', status: 'Warning', element: 'Caching', keterangan: 'Browser caching is enabled but cache duration could be increased' },
         ]);
         setIsAuditing(false);
      }, 2000);
   };

   return (
      <div className="Domain ">
         {activDomain && activDomain.domain
         && <Head>
               <title>{`${activDomain.domain} - Site Auditor` } </title>
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
                  exportCsv={() => console.log('Export audit data')}
                  showStartAuditing={handleStartAuditing}
                  />
               ) : <div className='w-full lg:h-[100px]'></div>
               }
               <SiteAuditorTable
               isLoading={isAuditing}
               domain={activDomain}
               auditData={auditData}
               hasStarted={auditData.length > 0 || isAuditing}
               onStartAuditing={handleStartAuditing}
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

export default SiteAuditorPage;
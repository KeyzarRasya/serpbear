import React from 'react';
import Icon from '../common/Icon';
import KeywordRankingSection from './KeywordRankingSection';
import TrafficSection from './TrafficSection';
import CompetitorSection from './CompetitorSection';
import InsightsSection from './InsightsSection';

type MonthlyReportViewProps = {
   domain: DomainType | null,
   reportData: any
}

const MonthlyReportView = (props: MonthlyReportViewProps) => {
   const { reportData } = props;

   return (
      <div className='monthly-report'>
         <div className='mb-6 p-6 bg-white rounded-md border'>
            <div className='flex items-center justify-between'>
               <div>
                  <h2 className='text-2xl font-bold text-gray-800'>Monthly Site Report</h2>
                  <p className='text-gray-600 mt-1'>Period: {reportData.period}</p>
               </div>
               <button className='px-4 py-2 bg-blue-700 text-white rounded font-semibold text-sm hover:bg-blue-800'>
                  <Icon type='download' size={14} /> Export PDF
               </button>
            </div>
         </div>

         <KeywordRankingSection keywordRankings={reportData.keywordRankings} />
         
         <TrafficSection traffic={reportData.traffic} />
         
         <CompetitorSection competitors={reportData.competitors} selectedKeywords={reportData.keywordRankings.map((k: any) => k.keyword)} />
         
         <InsightsSection insights={reportData.insights} />
      </div>
   );
};

export default MonthlyReportView;
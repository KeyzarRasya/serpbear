import React from 'react';
import Icon from '../common/Icon';

type InsightsSectionProps = {
   insights: any
}

const InsightsSection = ({ insights }: InsightsSectionProps) => {
   const { keywordRecommendations, topOpportunities } = insights;

   return (
      <div className='mb-6 bg-white rounded-md border'>
         <div className='p-6 border-b bg-[#FCFCFF]'>
            <h3 className='text-lg font-bold text-gray-800 flex items-center'>
               <Icon type='info' size={18} color='#4f46e5' /> 
               <span className='ml-2'>Analysis and Insights</span>
            </h3>
            <p className='text-sm text-gray-600 mt-1'>Strategic recommendations for upcoming content</p>
         </div>

         <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
               <div>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center'>
                     <Icon type='search' size={16} color='#16a34a' />
                     <span className='ml-2'>Keyword Recommendations</span>
                  </h4>
                  <div className='space-y-3'>
                     {keywordRecommendations.map((keyword: string, index: number) => (
                        <div key={index} className='p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors'>
                           <div className='flex items-start justify-between'>
                              <div className='flex items-start flex-1'>
                                 <span className='inline-block mt-1 w-6 h-6 bg-green-600 text-white rounded-full text-center text-sm font-semibold'>
                                    {index + 1}
                                 </span>
                                 <span className='ml-3 text-gray-800 font-semibold'>{keyword}</span>
                              </div>
                              <button className='ml-4 px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700'>
                                 Track
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                     <div className='text-sm text-gray-700'>
                        <Icon type='info' size={14} color='#2563eb' />
                        <span className='ml-2 font-semibold'>Note:</span> These keywords are suggested based on your current content performance and search trends.
                     </div>
                  </div>
               </div>

               <div>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center'>
                     <Icon type='trending-up' size={16} color='#f59e0b' />
                     <span className='ml-2'>Top Opportunities</span>
                  </h4>
                  <div className='space-y-3'>
                     {topOpportunities.map((opportunity: string, index: number) => (
                        <div key={index} className='p-4 bg-orange-50 rounded-lg border border-orange-200'>
                           <div className='flex items-start'>
                              <span className='inline-block mt-1 w-6 h-6 bg-orange-600 text-white rounded-full text-center text-sm font-semibold flex-shrink-0'>
                                 {index + 1}
                              </span>
                              <p className='ml-3 text-gray-700 text-sm leading-relaxed'>{opportunity}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className='mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200'>
                     <div className='text-sm text-gray-700'>
                        <Icon type='trending-up' size={14} color='#9333ea' />
                        <span className='ml-2 font-semibold'>Action Items:</span> Review these opportunities and create content strategy for the next month.
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default InsightsSection;
import React from 'react';
import Icon from '../common/Icon';

type TrafficSectionProps = {
   traffic: any
}

const TrafficSection = ({ traffic }: TrafficSectionProps) => {
   const { totalVisits, previousTotalVisits, visitChange, avgSessionDuration, popularPages, sources } = traffic;

   const renderChangeIndicator = (change: number) => {
      const isPositive = change > 0;
      return (
         <span className={`inline-flex items-center text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <Icon type={isPositive ? 'up' : 'down'} size={12} color={isPositive ? '#16a34a' : '#dc2626'} /> 
            <span className='ml-1'>{Math.abs(change)}%</span>
         </span>
      );
   };

   return (
      <div className='mb-6 bg-white rounded-md border'>
         <div className='p-6 border-b bg-[#FCFCFF]'>
            <h3 className='text-lg font-bold text-gray-800 flex items-center'>
               <Icon type='trend' size={18} color='#4f46e5' /> 
               <span className='ml-2'>Traffic Overview</span>
            </h3>
            <p className='text-sm text-gray-600 mt-1'>Website traffic analysis and visitor behavior</p>
         </div>

         <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6'>
               <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <div className='text-sm text-gray-600 mb-1'>Total Visits</div>
                  <div className='text-2xl font-bold text-gray-800'>{totalVisits.toLocaleString()}</div>
                  <div className='mt-2'>{renderChangeIndicator(visitChange)}</div>
               </div>
               
               <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='text-sm text-gray-600 mb-1'>Avg Session Duration</div>
                  <div className='text-2xl font-bold text-gray-800'>{avgSessionDuration}</div>
               </div>

               <div className='p-4 bg-purple-50 rounded-lg border border-purple-200'>
                  <div className='text-sm text-gray-600 mb-1'>Organic Traffic</div>
                  <div className='text-2xl font-bold text-gray-800'>{sources.organic}%</div>
               </div>

               <div className='p-4 bg-orange-50 rounded-lg border border-orange-200'>
                  <div className='text-sm text-gray-600 mb-1'>Previous Period</div>
                  <div className='text-2xl font-bold text-gray-800'>{previousTotalVisits.toLocaleString()}</div>
               </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
               <div>
                  <h4 className='font-bold text-gray-800 mb-4'>Most Popular Pages</h4>
                  <div className='space-y-3'>
                     {popularPages.map((page: any, index: number) => (
                        <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded border'>
                           <div className='flex-1 text-sm text-gray-700 truncate' title={page.url}>{page.url}</div>
                           <div className='ml-4 font-semibold text-blue-700'>{page.views.toLocaleString()} views</div>
                        </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h4 className='font-bold text-gray-800 mb-4'>Traffic Sources</h4>
                  <div className='space-y-3'>
                     <div className='p-3 bg-gray-50 rounded border'>
                        <div className='flex justify-between items-center mb-2'>
                           <span className='text-sm text-gray-700 flex items-center'>
                              <span className='w-3 h-3 bg-green-500 rounded-full mr-2'></span>
                              Organic Search
                           </span>
                           <span className='font-semibold text-gray-800'>{sources.organic}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                           <div className='bg-green-500 h-2 rounded-full' style={{ width: `${sources.organic}%` }}></div>
                        </div>
                     </div>

                     <div className='p-3 bg-gray-50 rounded border'>
                        <div className='flex justify-between items-center mb-2'>
                           <span className='text-sm text-gray-700 flex items-center'>
                              <span className='w-3 h-3 bg-blue-500 rounded-full mr-2'></span>
                              Referral
                           </span>
                           <span className='font-semibold text-gray-800'>{sources.referral}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                           <div className='bg-blue-500 h-2 rounded-full' style={{ width: `${sources.referral}%` }}></div>
                        </div>
                     </div>

                     <div className='p-3 bg-gray-50 rounded border'>
                        <div className='flex justify-between items-center mb-2'>
                           <span className='text-sm text-gray-700 flex items-center'>
                              <span className='w-3 h-3 bg-purple-500 rounded-full mr-2'></span>
                              Social Media
                           </span>
                           <span className='font-semibold text-gray-800'>{sources.social}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                           <div className='bg-purple-500 h-2 rounded-full' style={{ width: `${sources.social}%` }}></div>
                        </div>
                     </div>

                     <div className='p-3 bg-gray-50 rounded border'>
                        <div className='flex justify-between items-center mb-2'>
                           <span className='text-sm text-gray-700 flex items-center'>
                              <span className='w-3 h-3 bg-gray-500 rounded-full mr-2'></span>
                              Direct
                           </span>
                           <span className='font-semibold text-gray-800'>{sources.direct}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                           <div className='bg-gray-500 h-2 rounded-full' style={{ width: `${sources.direct}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default TrafficSection;
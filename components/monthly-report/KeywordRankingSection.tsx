import React from 'react';
import Icon from '../common/Icon';

type KeywordRankingSectionProps = {
   keywordRankings: any[]
}

const KeywordRankingSection = ({ keywordRankings }: KeywordRankingSectionProps) => {
   const renderChangeIndicator = (change: number) => {
      if (change > 0) {
         return (
            <span className='inline-flex items-center text-green-600 font-semibold'>
               <Icon type='up' size={14} color='#16a34a' /> +{change}
            </span>
         );
      } else if (change < 0) {
         return (
            <span className='inline-flex items-center text-red-600 font-semibold'>
               <Icon type='down' size={14} color='#dc2626' /> {change}
            </span>
         );
      }
      return <span className='text-gray-500 font-semibold'>-</span>;
   };

   return (
      <div className='mb-6 bg-white rounded-md border'>
         <div className='p-6 border-b bg-[#FCFCFF]'>
            <h3 className='text-lg font-bold text-gray-800 flex items-center'>
               <Icon type='tracking' size={18} color='#4f46e5' /> 
               <span className='ml-2'>Keyword Ranking</span>
            </h3>
            <p className='text-sm text-gray-600 mt-1'>Top 5 tracked keywords performance</p>
         </div>
         
         <div className='overflow-auto'>
            <table className='w-full text-sm'>
               <thead className='bg-gray-50 border-b'>
                  <tr>
                     <th className='text-left p-4 font-semibold text-gray-700'>Keyword</th>
                     <th className='text-center p-4 font-semibold text-gray-700'>Current Position</th>
                     <th className='text-center p-4 font-semibold text-gray-700'>Previous Position</th>
                     <th className='text-center p-4 font-semibold text-gray-700'>Change</th>
                  </tr>
               </thead>
               <tbody>
                  {keywordRankings.map((item, index) => (
                     <tr key={index} className={`border-b hover:bg-gray-50 ${index === keywordRankings.length - 1 ? 'border-b-0' : ''}`}>
                        <td className='p-4 font-semibold text-gray-800'>{item.keyword}</td>
                        <td className='p-4 text-center'>
                           <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold'>
                              #{item.position}
                           </span>
                        </td>
                        <td className='p-4 text-center text-gray-600'>#{item.previousPosition}</td>
                        <td className='p-4 text-center'>{renderChangeIndicator(item.change)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default KeywordRankingSection;
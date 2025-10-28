import React from 'react';
import Icon from '../common/Icon';

type CompetitorSectionProps = {
   competitors: any[],
   selectedKeywords: string[]
}

const CompetitorSection = ({ competitors, selectedKeywords }: CompetitorSectionProps) => {
   return (
      <div className='mb-6 bg-white rounded-md border'>
         <div className='p-6 border-b bg-[#FCFCFF]'>
            <h3 className='text-lg font-bold text-gray-800 flex items-center'>
               <Icon type='users' size={18} color='#4f46e5' /> 
               <span className='ml-2'>Competitor Comparison</span>
            </h3>
            <p className='text-sm text-gray-600 mt-1'>Performance comparison with top competitors</p>
         </div>

         <div className='p-6'>
            <div className='mb-6'>
               <h4 className='font-bold text-gray-800 mb-4'>Total Visits Comparison</h4>
               <div className='overflow-auto'>
                  <table className='w-full text-sm'>
                     <thead className='bg-gray-50 border-b'>
                        <tr>
                           <th className='text-left p-4 font-semibold text-gray-700'>Competitor</th>
                           <th className='text-right p-4 font-semibold text-gray-700'>Total Visits</th>
                        </tr>
                     </thead>
                     <tbody>
                        {competitors.map((comp, index) => (
                           <tr key={index} className={`border-b hover:bg-gray-50 ${index === competitors.length - 1 ? 'border-b-0' : ''}`}>
                              <td className='p-4 font-semibold text-gray-800'>{comp.name}</td>
                              <td className='p-4 text-right'>
                                 <span className='inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold'>
                                    {comp.totalVisits.toLocaleString()}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div>
               <h4 className='font-bold text-gray-800 mb-4'>Keyword Position Comparison</h4>
               <div className='overflow-auto'>
                  <table className='w-full text-sm'>
                     <thead className='bg-gray-50 border-b'>
                        <tr>
                           <th className='text-left p-4 font-semibold text-gray-700'>Keyword</th>
                           {competitors.map((comp, index) => (
                              <th key={index} className='text-center p-4 font-semibold text-gray-700'>{comp.name}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {selectedKeywords.map((keyword, keywordIndex) => (
                           <tr key={keywordIndex} className={`border-b hover:bg-gray-50 ${keywordIndex === selectedKeywords.length - 1 ? 'border-b-0' : ''}`}>
                              <td className='p-4 font-semibold text-gray-800'>{keyword}</td>
                              {competitors.map((comp, compIndex) => {
                                 const keywordData = comp.keywords.find((k: any) => k.keyword === keyword);
                                 const position = keywordData ? keywordData.position : '-';
                                 return (
                                    <td key={compIndex} className='p-4 text-center'>
                                       {position !== '-' ? (
                                          <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                                             position <= 3 ? 'bg-green-100 text-green-700' :
                                             position <= 10 ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-red-100 text-red-700'
                                          }`}>
                                             #{position}
                                          </span>
                                       ) : (
                                          <span className='text-gray-400'>-</span>
                                       )}
                                    </td>
                                 );
                              })}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CompetitorSection;
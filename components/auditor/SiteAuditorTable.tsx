import React from 'react';
import Icon from '../common/Icon';

type SiteAuditorTableProps = {
   domain: DomainType | null,
   auditData: any[],
   isLoading: boolean,
   hasStarted: boolean,
   onStartAuditing: () => void
}

const SiteAuditorTable = (props: SiteAuditorTableProps) => {
   const { auditData = [], isLoading = false, hasStarted = false, onStartAuditing } = props;

   return (
      <div>
         <div className='domKeywords flex flex-col bg-[white] rounded-md text-sm border mb-5'>
            <div className='domkeywordsTable domkeywordsTable--auditor styled-scrollbar w-full overflow-auto min-h-[60vh]'>
               <div className='lg:min-w-[800px]'>
                  <div className='domKeywords_head domKeywords_head--auditor hidden lg:flex p-3 px-6 bg-[#FCFCFF] text-gray-600 justify-between items-center font-semibold border-y'>
                     <span className='domKeywords_head_no flex-1 basis-16 grow-0 text-center'>No</span>
                     <span className='domKeywords_head_type flex-1 basis-32 grow-0'>Type</span>
                     <span className='domKeywords_head_status flex-1 basis-24 grow-0 text-center'>Status</span>
                     <span className='domKeywords_head_element flex-1 basis-48 grow-0'>Element</span>
                     <span className='domKeywords_head_keterangan flex-1'>Keterangan</span>
                  </div>

                  {!hasStarted && !isLoading && (
                     <div className='p-8 text-center text-gray-500'>
                        <div className='py-12'>
                           <Icon type='info' size={48} color='#cbd5e1' />
                           <p className='mt-4 text-base'>Site Auditor hasn't been started yet.</p>
                           <p className='mt-2'>Please click "Start Auditing" to start auditing your site.</p>
                        </div>
                     </div>
                  )}

                  {isLoading && (
                     <div className='p-8 text-center text-gray-500'>
                        <div className='py-12'>
                           <Icon type='loading' size={32} />
                           <p className='mt-4 text-base'>Auditing your site...</p>
                        </div>
                     </div>
                  )}

                  {hasStarted && !isLoading && auditData.length > 0 && (
                     <div className='domKeywords_keywords'>
                        {auditData.map((item, index) => (
                           <div 
                           key={item.id}
                           className={`keyword relative py-5 px-4 text-gray-600 border-b-[1px] border-gray-200 lg:py-4 lg:px-6 lg:border-0 lg:flex lg:justify-between lg:items-center ${index === auditData.length - 1 ? 'border-b-0' : ''}`}>
                              <div className='lg:flex-1 lg:basis-16 lg:grow-0 text-center font-semibold'>
                                 {index + 1}
                              </div>
                              <div className='lg:flex-1 lg:basis-32 lg:grow-0'>
                                 <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    item.type === 'SEO' ? 'bg-blue-100 text-blue-700' :
                                    item.type === 'Performance' ? 'bg-green-100 text-green-700' :
                                    item.type === 'Security' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'
                                 }`}>
                                    {item.type}
                                 </span>
                              </div>
                              <div className='lg:flex-1 lg:basis-24 lg:grow-0 text-center mt-2 lg:mt-0'>
                                 <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    item.status === 'Passed' ? 'bg-green-100 text-green-700' :
                                    item.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                 }`}>
                                    {item.status}
                                 </span>
                              </div>
                              <div className='lg:flex-1 lg:basis-48 lg:grow-0 font-semibold mt-2 lg:mt-0'>
                                 {item.element}
                              </div>
                              <div className='lg:flex-1 text-gray-600 mt-2 lg:mt-0'>
                                 {item.keterangan}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default SiteAuditorTable;
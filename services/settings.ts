import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export async function fetchSettings() {
   console.log('[Settings Service] Fetching settings...');
   const res = await fetch(`${window.location.origin}/api/settings`, { method: 'GET' });
   const data = await res.json();
   console.log('[Settings Service] Fetched settings:', data);
   return data;
}

export function useFetchSettings() {
   return useQuery('settings', () => fetchSettings());
}

export const useUpdateSettings = (onSuccess:Function|undefined) => {
   const queryClient = useQueryClient();

   return useMutation(async (settings: SettingsType) => {
      console.log('[Settings Service] updateSettings mutation called');
      console.log('[Settings Service] Settings to send:', JSON.stringify(settings, null, 2));

      const headers = new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' });
      const fetchOpts = { method: 'PUT', headers, body: JSON.stringify({ settings }) };
      
      console.log('[Settings Service] Sending PUT request to /api/settings');
      const res = await fetch(`${window.location.origin}/api/settings`, fetchOpts);
      
      console.log('[Settings Service] Response status:', res.status);
      
      const responseData = await res.json();
      console.log('[Settings Service] Response data:', responseData);
      
      if (res.status >= 400 && res.status < 600) {
         console.error('[Settings Service] Error response:', responseData);
         throw new Error(responseData.error || 'Bad response from server');
      }
      
      return responseData;
   }, {
      onSuccess: async (data) => {
         console.log('[Settings Service] Update successful:', data);
         if (onSuccess) {
            onSuccess();
         }
         toast('Settings Updated!', { icon: '✔️' });
         queryClient.invalidateQueries(['settings']);
      },
      onError: (error: any) => {
         console.error('[Settings Service] Update failed:', error);
         console.error('[Settings Service] Error message:', error.message);
         console.error('[Settings Service] Error stack:', error.stack);
         toast(`Error Updating Settings: ${error.message}`, { icon: '⚠️' });
      },
   });
};

export function useClearFailedQueue(onSuccess:Function) {
   const queryClient = useQueryClient();
   return useMutation(async () => {
      const headers = new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' });
      const fetchOpts = { method: 'PUT', headers };
      const res = await fetch(`${window.location.origin}/api/clearfailed`, fetchOpts);
      if (res.status >= 400 && res.status < 600) {
         throw new Error('Bad response from server');
      }
      return res.json();
   }, {
      onSuccess: async () => {
         onSuccess();
         toast('Failed Queue Cleared', { icon: '✔️' });
         queryClient.invalidateQueries(['settings']);
      },
      onError: () => {
         console.log('Error Clearing Failed Queue!!!');
         toast('Error Clearing Failed Queue.');
      },
   });
};
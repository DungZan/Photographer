import { useEffect, useState } from 'react';
import client from '../api/client';

export function useSiteContent() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isActive = true;

    client
      .get('/api/site')
      .then((response) => {
        if (!isActive) return;
        setData(response.data);
        setStatus('success');
      })
      .catch((error) => {
        console.error('Failed to load site content', error);
        if (!isActive) return;
        setStatus('error');
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { data, status };
}

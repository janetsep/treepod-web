'use client';

import { useEffect, useState } from 'react';
import { minimumBookingDate } from './booking-date-selection';

export function useMinimumBookingDate() {
  const [minimum, setMinimum] = useState(minimumBookingDate);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      setMinimum(minimumBookingDate());
      timer = setTimeout(refresh, 60000 - Date.now() % 60000);
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return minimum;
}

import { useCallback, useEffect, useState } from 'react';

import { partnerFetch } from '../../utils/partnerApi.js';

/**
 * @param {string} phone
 * @param {boolean} isPartner
 * @param {() => string} [onGenericLoadError] i18n для ошибки без текста от API
 */
export function usePartnerDashboard(phone, isPartner, onGenericLoadError) {
  const [catalog, setCatalog] = useState(null);
  const [applications, setApplications] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState({});

  const loadAll = useCallback(async () => {
    if (!phone || !isPartner) return;
    setError('');
    try {
      const [c, a, an] = await Promise.all([
        partnerFetch(phone, '/api/partner/catalog').then((r) => r.json()),
        partnerFetch(phone, '/api/partner/applications?limit=80').then((r) => r.json()),
        partnerFetch(phone, '/api/partner/analytics').then((r) => r.json()),
      ]);
      if (c.error) throw new Error(c.error);
      if (a.error) throw new Error(a.error);
      if (an.error) throw new Error(an.error);
      setCatalog(c);
      setApplications(a);
      setAnalytics(an);
    } catch (e) {
      setError(e.message || (onGenericLoadError ? onGenericLoadError() : 'Ошибка загрузки'));
    }
  }, [phone, isPartner, onGenericLoadError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleService = useCallback(
    async (subcategoryId, linked) => {
      setBusy((b) => ({ ...b, [subcategoryId]: true }));
      setError('');
      try {
        if (linked) {
          const res = await partnerFetch(phone, `/api/partner/services/${subcategoryId}`, { method: 'DELETE' });
          const j = await res.json();
          if (!res.ok) throw new Error(j.error || 'Error');
        } else {
          const res = await partnerFetch(phone, '/api/partner/services', {
            method: 'POST',
            body: JSON.stringify({ subcategoryId }),
          });
          const j = await res.json();
          if (!res.ok) throw new Error(j.error || 'Error');
        }
        await loadAll();
      } catch (e) {
        setError(e.message || (onGenericLoadError ? onGenericLoadError() : 'Ошибка'));
      } finally {
        setBusy((b) => ({ ...b, [subcategoryId]: false }));
      }
    },
    [phone, loadAll, onGenericLoadError],
  );

  const setAppStatus = useCallback(
    async (id, status) => {
      setBusy((b) => ({ ...b, [`a${id}`]: true }));
      try {
        const res = await partnerFetch(phone, `/api/partner/applications/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error);
        await loadAll();
      } catch (e) {
        setError(e.message || '');
      } finally {
        setBusy((b) => ({ ...b, [`a${id}`]: false }));
      }
    },
    [phone, loadAll],
  );

  return {
    catalog,
    applications,
    analytics,
    error,
    busy,
    toggleService,
    setAppStatus,
  };
}

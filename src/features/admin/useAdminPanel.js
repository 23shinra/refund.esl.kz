import { useCallback, useEffect, useState } from 'react';

import { ADMIN_API, ADMIN_NAV } from './constants.js';
import {
  adminLoginRequest,
  buildAdminHeaders,
  readAdminToken,
  writeAdminToken,
} from './adminClient.js';

export function useAdminPanel() {
  const [token, setTokenState] = useState(() => readAdminToken());
  const [section, setSection] = useState(ADMIN_NAV[0].id);
  const [users, setUsers] = useState([]);
  const [tree, setTree] = useState(null);
  const [partnersOnly, setPartnersOnly] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [pending, setPending] = useState({});
  const [loginBusy, setLoginBusy] = useState(false);

  const clearSession = useCallback(() => {
    writeAdminToken('');
    setTokenState('');
    setUsers([]);
    setTree(null);
    setStats(null);
  }, []);

  const adminRequest = useCallback(
    async (method, url, options = {}) => {
      const t = token || readAdminToken();
      const headers = buildAdminHeaders(t);
      const init = { method, headers };
      if (options.json !== undefined) {
        init.body = JSON.stringify(options.json);
      }
      const res = await fetch(url, init);
      if (res.status === 401) clearSession();
      return res;
    },
    [token, clearSession],
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await adminRequest('GET', ADMIN_API.STATS);
      if (!res.ok) return;
      const j = await res.json();
      setStats(j);
    } catch {
      // non-critical
    }
  }, [adminRequest]);

  const loadUsers = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await adminRequest('GET', ADMIN_API.USERS);
      if (res.status === 401) { setError('Войдите в админку снова.'); return; }
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || `Ошибка ${res.status}`); return; }
      const j = await res.json();
      setUsers(j.users ?? []);
    } catch {
      setError('Не удалось загрузить список.');
    } finally {
      setLoading(false);
    }
  }, [adminRequest]);

  const loadCatalog = useCallback(async () => {
    setError('');
    setOkMsg('');
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        adminRequest('GET', ADMIN_API.CATALOG_TREE),
        adminRequest('GET', ADMIN_API.PARTNERS),
      ]);
      if (tRes.status === 401 || pRes.status === 401) { setError('Сессия истекла — войдите снова.'); return; }
      if (!tRes.ok) { const j = await tRes.json().catch(() => ({})); setError(j.error || 'Каталог'); return; }
      if (!pRes.ok) { const j = await pRes.json().catch(() => ({})); setError(j.error || 'Партнёры'); return; }
      const tj = await tRes.json();
      const pj = await pRes.json();
      setTree(tj);
      setPartnersOnly(pj.partners ?? []);
    } catch {
      setError('Сеть недоступна.');
    } finally {
      setLoading(false);
    }
  }, [adminRequest]);

  useEffect(() => {
    if (!token) return;
    loadStats();
    if (section === 'dashboard') { loadStats(); loadCatalog(); }
    else if (section === 'users') loadUsers();
    else loadCatalog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, section]);

  const login = useCallback(async (loginVal, passwordVal) => {
    setError('');
    setLoginBusy(true);
    try {
      const { res, data } = await adminLoginRequest(loginVal, passwordVal);
      if (!res.ok) { setError(data.error || `Ошибка ${res.status}`); return false; }
      if (!data.token) { setError('Нет токена в ответе'); return false; }
      writeAdminToken(data.token);
      setTokenState(data.token);
      setOkMsg('Добро пожаловать');
      return true;
    } catch {
      setError('Сеть недоступна');
      return false;
    } finally {
      setLoginBusy(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setError('');
    setOkMsg('');
  }, [clearSession]);

  const refresh = useCallback(() => {
    loadStats();
    if (section === 'users') loadUsers();
    else loadCatalog();
  }, [section, loadUsers, loadCatalog, loadStats]);

  const updateRole = useCallback(
    async (id, role) => {
      setPending((p) => ({ ...p, [id]: true }));
      setError('');
      try {
        const res = await adminRequest('PATCH', ADMIN_API.userRole(id), { json: { role } });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || 'Не удалось сохранить роль.');
          return;
        }
        await loadUsers();
      } catch {
        setError('Сеть недоступна.');
      } finally {
        setPending((p) => ({ ...p, [id]: false }));
      }
    },
    [adminRequest, loadUsers],
  );

  return {
    token,
    section,
    setSection,
    users,
    tree,
    partnersOnly,
    stats,
    loading,
    error,
    setError,
    okMsg,
    setOkMsg,
    pending,
    loginBusy,
    login,
    logout,
    refresh,
    loadUsers,
    loadCatalog,
    loadStats,
    updateRole,
    adminRequest,
  };
}

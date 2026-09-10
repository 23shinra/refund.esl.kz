const STORAGE_KEY = 'qoldau.onboarding.v1';

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readOnboardingProfile() {
  const raw = safeGet(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeOnboardingProfile(profile) {
  if (!profile || typeof profile !== 'object') return;
  safeSet(STORAGE_KEY, JSON.stringify(profile));
  try {
    window.dispatchEvent(new Event('qoldau:onboarding-updated'));
  } catch {
    // ignore
  }
}

export function clearOnboardingProfile() {
  safeSet(STORAGE_KEY, '');
}


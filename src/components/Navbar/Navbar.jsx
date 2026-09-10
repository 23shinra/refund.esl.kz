import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { USER_ROLE } from '../../constants/userRoles.js';
import { useI18n } from '../../utils/i18n.jsx';
import { aiSuggestAllQuestions, searchAllQuestions } from '../../utils/benefitsRepository.js';

function roleLabelKey(role) {
  if (role === USER_ROLE.ADMIN) return 'nav.roleAdmin';
  if (role === USER_ROLE.PARTNER) return 'nav.rolePartner';
  return 'nav.roleClient';
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const StyledBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(246, 249, 255, 0.72);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledInner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth}px;
  margin: 0 auto;
  padding: 12px 16px;
  display: grid;
  align-items: center;
  gap: 12px 16px;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'brand toggle'
    'search search';

  @media (min-width: ${({ theme }) => theme.breakpoints.navDesktopMin}px) {
    grid-template-columns: auto 1fr auto;
    grid-template-areas: 'brand search right';
    gap: 16px;
  }
`;

const StyledLeftBrand = styled(Link)`
  grid-area: brand;
  justify-self: start;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    background: rgba(15, 23, 42, 0.04);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledSearchWrap = styled.div`
  grid-area: search;
  justify-self: stretch;
  width: 100%;
  max-width: none;
  position: relative;

  @media (min-width: ${({ theme }) => theme.breakpoints.navDesktopMin}px) {
    justify-self: center;
    max-width: 520px;
  }
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: 10px 120px 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.70);
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (max-width: 420px) {
    padding-right: 104px;
  }

  @media (max-width: 360px) {
    padding-right: 92px;
  }

  &::placeholder {
    color: #000000;
    opacity: 1;
  }

  &:hover {
    border-color: rgba(37, 99, 235, 0.35);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.10);
  }
`;

const StyledSearchActions = styled.div`
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const StyledIconButton = styled.button.attrs({ type: 'button' })`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 200ms cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (max-width: 360px) {
    width: 36px;
    height: 36px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: rgba(15, 23, 42, 0.06);
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledAiToggle = styled.button.attrs({ type: 'button' })`
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => ($active ? 'rgba(37, 99, 235, 0.35)' : theme.colors.border)};
  background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.10)' : 'rgba(255, 255, 255, 0.55)')};
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (max-width: 360px) {
    padding: 0 10px;
    gap: 6px;
    font-size: 12px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledAiDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.95)' : 'rgba(148, 163, 184, 0.9)')};
  box-shadow: ${({ $active }) =>
    $active ? '0 0 0 6px rgba(37, 99, 235, 0.12)' : '0 0 0 6px rgba(148, 163, 184, 0.10)'};
  transition: background 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const StyledResults = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.92);
  box-shadow: ${({ theme }) => theme.shadow.md};
  overflow: hidden;
`;

const StyledResultsHeader = styled.div`
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(246, 249, 255, 0.75);
`;

const StyledResultItem = styled.button.attrs({ type: 'button' })`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    background: rgba(37, 99, 235, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }
`;

const StyledResultTitle = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
`;

const StyledResultMeta = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const StyledMenuToggle = styled.button.attrs({ type: 'button' })`
  grid-area: toggle;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.75);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.25);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.navDesktopMin}px) {
    display: none;
  }
`;

const StyledHamburgerIcon = styled.span`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 20px;

  span {
    display: block;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  ${({ $open }) =>
    $open &&
    `
    span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    span:nth-child(2) { opacity: 0; }
    span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  `}
`;

const StyledRight = styled.div`
  grid-area: right;
  justify-self: end;
  display: none;
  align-items: center;
  gap: 10px;

  @media (min-width: ${({ theme }) => theme.breakpoints.navDesktopMin}px) {
    display: inline-flex;
  }
`;

const StyledLangSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.62);
`;

const StyledLangBtn = styled.button.attrs({ type: 'button' })`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid transparent;
  background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.10)' : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  cursor: pointer;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledPartnersLink = styled(Link)`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: rgba(37, 99, 235, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const pickPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.00); transform: translateY(0); }
  45% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0.10); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 18px rgba(37, 99, 235, 0.00); transform: translateY(0); }
`;

const StyledAuthButton = styled.button.attrs({ type: 'button' })`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.70);
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  animation: ${pickPulse} 2.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.10);
    transform: translateY(-1px);
    animation: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    animation: none;
  }
`;

const StyledUserWrap = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: min(220px, 38vw);
`;

const StyledRoleBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.25);
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`;

const StyledLogoutBtn = styled.button.attrs({ type: 'button' })`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: rgba(220, 38, 38, 0.35);
    background: rgba(220, 38, 38, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledNavCluster = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  justify-content: flex-end;
`;

const StyledDrawerRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  visibility: hidden;

  ${({ $open }) =>
    $open &&
    `
    pointer-events: auto;
    visibility: visible;
  `}
`;

const StyledDrawerBackdrop = styled.button.attrs({ type: 'button' })`
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(15, 23, 42, 0.45);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.22s ease;

  ${({ $open }) => $open && `opacity: 1;`}
`;

const StyledDrawerPanel = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  width: min(88vw, 320px);
  max-width: 100%;
  height: 100%;
  padding: calc(14px + env(safe-area-inset-top, 0px)) 16px
    calc(20px + env(safe-area-inset-bottom, 0px)) calc(12px + env(safe-area-inset-right, 0px));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: -10px 0 36px rgba(15, 23, 42, 0.14);
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);

  ${({ $open }) => $open && `transform: translateX(0);`}
`;

const StyledDrawerHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledDrawerTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledDrawerClose = styled.button.attrs({ type: 'button' })`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.9);
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  line-height: 1;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledDrawerLink = styled(Link)`
  display: block;
  padding: 14px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledDrawerSectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 14px 0 6px;
  padding-left: 12px;
`;

const StyledDrawerAuthBtn = styled.button.attrs({ type: 'button' })`
  display: block;
  width: 100%;
  text-align: left;
  padding: 14px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.85);
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 4px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledDrawerUserBlock = styled.div`
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.15);
  margin-top: 8px;
`;

const StyledDrawerLang = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledDrawerLangLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-right: 4px;
`;

export function Navbar({ user, onAuthClick, onLogout, language, onLanguageChange }) {
  const { t, tl } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const blurTimer = useRef(null);
  const inputRef = useRef(null);
  const drawerPanelRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const lastFocusRef = useRef(null);

  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 180);
  const effectiveQuery = debouncedQ.trim();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiMode, setAiMode] = useState(() => {
    try {
      return window.localStorage.getItem('qoldau.aiMode') === '1';
    } catch (_e) {
      return false;
    }
  });

  const results = useMemo(() => {
    if (effectiveQuery.length < 2) return [];
    return searchAllQuestions(effectiveQuery, language, 8);
  }, [effectiveQuery, language]);

  const aiSuggestions = useMemo(() => {
    if (!aiMode) return [];
    if (effectiveQuery.length < 2) return [];
    if (results.length) return [];
    return aiSuggestAllQuestions(effectiveQuery, language, 6);
  }, [aiMode, effectiveQuery, language, results.length]);

  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const showSearchOptions = open && results.length > 0;
  const showAiOptions = open && !results.length && aiSuggestions.length > 0;
  const options = showSearchOptions ? results : showAiOptions ? aiSuggestions : [];
  const optionsHeader = showSearchOptions ? t('nav.searchButtonAria') : t('nav.aiSuggestions');
  const listboxId = 'global-search-results';

  useEffect(() => {
    if (!options.length) return;
    setActiveOptionIndex(0);
  }, [effectiveQuery, options.length, showSearchOptions, showAiOptions]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const prevFocus = document.activeElement;
    lastFocusRef.current = prevFocus;

    const focusablesSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const getFocusables = () => {
      const panel = drawerPanelRef.current;
      if (!panel) return [];
      return Array.from(panel.querySelectorAll(focusablesSelector));
    };

    const focusInitial = () => {
      const closeBtn = drawerCloseRef.current;
      if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
      else getFocusables()[0]?.focus?.();
    };

    const timer = window.setTimeout(focusInitial, 0);

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const panel = drawerPanelRef.current;
      if (!panel) return;
      if (!panel.contains(document.activeElement)) return;

      const focusables = getFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
      const toFocus = lastFocusRef.current;
      lastFocusRef.current = null;
      if (toFocus && typeof toFocus.focus === 'function') toFocus.focus();
    };
  }, [mobileMenuOpen]);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
    <StyledBar>
      <StyledInner>
        <StyledLeftBrand to="/" aria-label="Refund">
          Refund
        </StyledLeftBrand>

        <StyledMenuToggle
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <StyledHamburgerIcon $open={mobileMenuOpen} aria-hidden>
            <span />
            <span />
            <span />
          </StyledHamburgerIcon>
        </StyledMenuToggle>

        <StyledSearchWrap>
          <StyledSearchInput
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('nav.globalSearchPlaceholder')}
            aria-label={t('nav.globalSearchAria')}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={options.length > 0}
            aria-controls={options.length > 0 ? listboxId : undefined}
            aria-activedescendant={options.length > 0 ? `global-search-option-${activeOptionIndex}` : undefined}
            onFocus={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
              setOpen(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false);
                e.currentTarget.blur();
              }
              if (options.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                setActiveOptionIndex((cur) => {
                  if (e.key === 'ArrowDown') return Math.min(cur + 1, options.length - 1);
                  return Math.max(cur - 1, 0);
                });
              }
              if (e.key === 'Enter') {
                if (options.length) {
                  setOpen(false);
                  const target = options[Math.min(activeOptionIndex, options.length - 1)];
                  if (target) navigate(`/category/${target.subcategoryId}?q=${encodeURIComponent(effectiveQuery)}`);
                }
              }
            }}
          />
          <StyledSearchActions>
            <StyledIconButton
              aria-label={t('nav.searchButtonAria')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setOpen(true);
                inputRef.current?.focus();
                const target = results.length ? results[0] : aiSuggestions[0];
                if (target) {
                  navigate(`/category/${target.subcategoryId}?q=${encodeURIComponent(effectiveQuery)}`);
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-6.15-6.15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </StyledIconButton>
            <StyledAiToggle
              $active={aiMode}
              aria-pressed={aiMode}
              aria-label={t('nav.aiModeAria')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = !aiMode;
                setAiMode(next);
                try {
                  window.localStorage.setItem('qoldau.aiMode', next ? '1' : '0');
                } catch (_e) {
                  // ignore
                }
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setOpen(true);
                inputRef.current?.focus();
              }}
            >
              <StyledAiDot $active={aiMode} aria-hidden />
              {t('nav.aiMode')}
            </StyledAiToggle>
          </StyledSearchActions>
          {open && options.length ? (
            <StyledResults id={listboxId} role="listbox" aria-label={t('nav.globalSearchAria')}>
              <StyledResultsHeader>{optionsHeader}</StyledResultsHeader>
              {options.map((r, idx) => (
                <StyledResultItem
                  key={`${r.subcategoryId}-${idx}`}
                  role="option"
                  id={`global-search-option-${idx}`}
                  aria-selected={idx === activeOptionIndex}
                  onMouseEnter={() => setActiveOptionIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/category/${r.subcategoryId}?q=${encodeURIComponent(effectiveQuery)}`);
                  }}
                >
                  <StyledResultTitle>{tl(r.question)}</StyledResultTitle>
                  <StyledResultMeta>
                    {tl(r.groupTitle)} • {tl(r.subcategoryTitle)}
                  </StyledResultMeta>
                </StyledResultItem>
              ))}
            </StyledResults>
          ) : null}
        </StyledSearchWrap>

        <StyledRight>
          <StyledNavCluster>
            {user?.role === USER_ROLE.PARTNER ? (
              <StyledPartnersLink to="/partner">{t('nav.partnerCabinet')}</StyledPartnersLink>
            ) : null}
            {user?.phone ? (
              <StyledUserWrap>
                <StyledRoleBadge title={user.phone}>{t(roleLabelKey(user.role))}</StyledRoleBadge>
                <StyledLogoutBtn type="button" onClick={onLogout}>
                  {t('nav.logout')}
                </StyledLogoutBtn>
              </StyledUserWrap>
            ) : (
              <>
                <StyledAuthButton onClick={onAuthClick}>{t('nav.pickForYou')}</StyledAuthButton>
              </>
            )}
            <StyledLangSwitch aria-label={t('nav.language')}>
              <StyledLangBtn $active={language === 'ru'} onClick={() => onLanguageChange('ru')}>
                RU
              </StyledLangBtn>
              <StyledLangBtn $active={language === 'kz'} onClick={() => onLanguageChange('kz')}>
                KAZ
              </StyledLangBtn>
            </StyledLangSwitch>
          </StyledNavCluster>
        </StyledRight>
      </StyledInner>
    </StyledBar>

    <StyledDrawerRoot $open={mobileMenuOpen} aria-hidden={!mobileMenuOpen}>
      <StyledDrawerBackdrop
        $open={mobileMenuOpen}
        aria-label={t('nav.menuClose')}
        onClick={closeMobile}
      />
      <StyledDrawerPanel
        id="mobile-nav-drawer"
        $open={mobileMenuOpen}
        ref={drawerPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
      >
        <StyledDrawerHead>
          <StyledDrawerTitle id="mobile-nav-title">{t('nav.menuTitle')}</StyledDrawerTitle>
          <StyledDrawerClose
            ref={drawerCloseRef}
            type="button"
            aria-label={t('nav.menuClose')}
            onClick={closeMobile}
          >
            ×
          </StyledDrawerClose>
        </StyledDrawerHead>

        {user?.role === USER_ROLE.PARTNER ? (
          <StyledDrawerLink to="/partner" onClick={closeMobile}>
            {t('nav.partnerCabinet')}
          </StyledDrawerLink>
        ) : null}

        {user?.phone ? (
          <StyledDrawerUserBlock>
            <StyledRoleBadge as="div" style={{ marginBottom: 8 }}>
              {t(roleLabelKey(user.role))}
            </StyledRoleBadge>
            <StyledLogoutBtn type="button" onClick={() => { closeMobile(); onLogout(); }}>
              {t('nav.logout')}
            </StyledLogoutBtn>
          </StyledDrawerUserBlock>
        ) : (
          <StyledDrawerAuthBtn
            type="button"
            onClick={() => {
              closeMobile();
              onAuthClick();
            }}
          >
            {t('nav.pickForYou')}
          </StyledDrawerAuthBtn>
        )}

        <StyledDrawerLang>
          <StyledDrawerLangLabel>{t('nav.language')}:</StyledDrawerLangLabel>
          <StyledLangSwitch aria-label={t('nav.language')}>
            <StyledLangBtn $active={language === 'ru'} onClick={() => onLanguageChange('ru')}>
              RU
            </StyledLangBtn>
            <StyledLangBtn $active={language === 'kz'} onClick={() => onLanguageChange('kz')}>
              KAZ
            </StyledLangBtn>
          </StyledLangSwitch>
        </StyledDrawerLang>
      </StyledDrawerPanel>
    </StyledDrawerRoot>
    </>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    phone: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'partner', 'client']),
  }),
  onAuthClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  language: PropTypes.oneOf(['ru', 'kz']).isRequired,
  onLanguageChange: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  user: null,
};


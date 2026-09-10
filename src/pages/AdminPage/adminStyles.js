import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

/* ─── Design tokens ─── */
export const adm = {
  sidebar: '#0F172A',
  sidebarBorder: 'rgba(255,255,255,0.07)',
  sidebarText: '#94A3B8',
  sidebarActive: '#60A5FA',
  sidebarActiveBg: 'rgba(37,99,235,0.18)',
  bg: '#F1F5F9',
  surface: '#FFFFFF',
  border: 'rgba(15,23,42,0.10)',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.08)',
  success: '#22C55E',
  successBg: 'rgba(34,197,94,0.10)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.10)',
  radius: '10px',
  radiusLg: '14px',
  shadow: '0 4px 20px rgba(15,23,42,0.08)',
  shadowMd: '0 8px 32px rgba(15,23,42,0.12)',
};

/* ─── Shell ─── */
export const AdminShell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${adm.bg};
  font-family: 'Open Sans', system-ui, sans-serif;
  color: ${adm.text};
`;

export const AdminSidebarWrap = styled.nav`
  width: 240px;
  flex-shrink: 0;
  background: ${adm.sidebar};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 20;

  @media (max-width: 767px) {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
`;

export const SidebarBrand = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${adm.sidebarBorder};
`;

export const SidebarBrandName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
`;

export const SidebarBrandSub = styled.div`
  font-size: 11px;
  color: ${adm.sidebarText};
  margin-top: 2px;
`;

export const SidebarNav = styled.ul`
  list-style: none;
  margin: 0;
  padding: 10px 10px;
  flex: 1;
`;

export const SidebarNavItem = styled.li``;

export const SidebarNavBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: ${adm.radius};
  background: ${({ $active }) => ($active ? adm.sidebarActiveBg : 'transparent')};
  color: ${({ $active }) => ($active ? adm.sidebarActive : adm.sidebarText)};
  font: inherit;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
  margin-bottom: 2px;

  &:hover {
    background: ${({ $active }) => ($active ? adm.sidebarActiveBg : 'rgba(255,255,255,0.05)')};
    color: ${({ $active }) => ($active ? adm.sidebarActive : '#CBD5E1')};
  }
`;

export const SidebarNavIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

export const SidebarBottom = styled.div`
  padding: 12px 10px;
  border-top: 1px solid ${adm.sidebarBorder};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SidebarLogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: ${adm.radius};
  background: transparent;
  color: ${adm.sidebarText};
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(239,68,68,0.12);
    color: #F87171;
  }
`;

export const SidebarSiteLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${adm.radius};
  color: ${adm.sidebarText};
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(255,255,255,0.05);
    color: #CBD5E1;
  }
`;

/* ─── Main area ─── */
export const AdminMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const AdminTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  height: 60px;
  background: ${adm.surface};
  border-bottom: 1px solid ${adm.border};
  flex-shrink: 0;
`;

export const AdminTopBarTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${adm.text};
  flex: 1;
`;

export const AdminContent = styled.div`
  padding: 24px;
  flex: 1;
  overflow-x: hidden;

  @media (max-width: 639px) {
    padding: 16px;
  }
`;

export const HamburgerBtn = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${adm.border};
  border-radius: ${adm.radius};
  background: transparent;
  cursor: pointer;
  color: ${adm.text};
  font-size: 20px;

  @media (max-width: 767px) {
    display: flex;
  }
`;

export const SidebarBackdrop = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 19;
  }
`;

/* ─── Cards ─── */
export const Card = styled.div`
  background: ${adm.surface};
  border-radius: ${adm.radiusLg};
  border: 1px solid ${adm.border};
  box-shadow: ${adm.shadow};
  padding: ${({ $compact }) => ($compact ? '16px' : '20px')};
  margin-bottom: ${({ $mb }) => ($mb ?? 20)}px;
`;

export const CardTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: ${adm.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

export const PageTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${adm.text};
`;

/* ─── Stats grid ─── */
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  background: ${adm.surface};
  border-radius: ${adm.radiusLg};
  border: 1px solid ${adm.border};
  padding: 18px 16px;
  box-shadow: ${adm.shadow};
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${adm.primary};
  line-height: 1.1;
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: ${adm.muted};
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

/* ─── Table ─── */
export const TableWrap = styled.div`
  overflow-x: auto;
  border-radius: ${adm.radius};
  border: 1px solid ${adm.border};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: ${adm.surface};

  th, td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid ${adm.border};
    vertical-align: middle;
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${adm.muted};
    background: #F8FAFC;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(37,99,235,0.03);
  }
`;

export const TableActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

/* ─── Buttons ─── */
const btnBase = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;

  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export const BtnPrimary = styled.button`
  ${btnBase}
  border: 1px solid transparent;
  background: ${adm.primary};
  color: #fff;

  &:hover:not(:disabled) { background: ${adm.primaryHover}; }
`;

export const BtnSecondary = styled.button`
  ${btnBase}
  border: 1px solid ${adm.border};
  background: transparent;
  color: ${adm.text};

  &:hover:not(:disabled) { background: rgba(15,23,42,0.05); }
`;

export const BtnDanger = styled.button`
  ${btnBase}
  border: 1px solid transparent;
  background: ${adm.danger};
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;

  &:hover:not(:disabled) { background: #DC2626; }
`;

export const BtnGhost = styled.button`
  ${btnBase}
  border: 1px solid ${adm.border};
  background: transparent;
  color: ${adm.muted};
  padding: 6px 12px;
  font-size: 12px;

  &:hover:not(:disabled) { color: ${adm.text}; border-color: rgba(15,23,42,0.25); }
`;

export const BtnEdit = styled.button`
  ${btnBase}
  border: 1px solid rgba(37,99,235,0.25);
  background: rgba(37,99,235,0.07);
  color: ${adm.primary};
  padding: 6px 12px;
  font-size: 12px;

  &:hover:not(:disabled) { background: rgba(37,99,235,0.14); }
`;

/* ─── Forms ─── */
export const FormGrid = styled.div`
  display: grid;
  gap: 14px;

  ${({ $cols }) =>
    $cols === 2 &&
    css`
      @media (min-width: 580px) {
        grid-template-columns: 1fr 1fr;
      }
    `}
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${adm.muted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${adm.radius};
  border: 1.5px solid ${adm.border};
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${adm.primary};
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
`;

export const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${adm.radius};
  border: 1.5px solid ${adm.border};
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
  min-height: 96px;
  resize: vertical;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${adm.primary};
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
`;

export const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${adm.radius};
  border: 1.5px solid ${adm.border};
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${adm.primary};
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
`;

/* ─── Badges ─── */
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;

  ${({ $variant }) => {
    if ($variant === 'blue') return css`background: rgba(37,99,235,0.12); color: ${adm.primary};`;
    if ($variant === 'green') return css`background: ${adm.successBg}; color: #16A34A;`;
    if ($variant === 'red') return css`background: ${adm.dangerBg}; color: ${adm.danger};`;
    if ($variant === 'amber') return css`background: ${adm.warningBg}; color: #B45309;`;
    return css`background: rgba(15,23,42,0.08); color: ${adm.muted};`;
  }}
`;

/* ─── Messages ─── */
export const AlertBanner = styled.div`
  padding: 12px 16px;
  border-radius: ${adm.radius};
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  ${({ $type }) => {
    if ($type === 'error') return css`background: ${adm.dangerBg}; border: 1px solid rgba(239,68,68,0.25); color: #B91C1C;`;
    if ($type === 'success') return css`background: ${adm.successBg}; border: 1px solid rgba(34,197,94,0.25); color: #15803D;`;
    return css`background: ${adm.warningBg}; border: 1px solid rgba(245,158,11,0.25); color: #92400E;`;
  }}
`;

/* ─── Misc ─── */
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${adm.border};
  margin: 20px 0;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${adm.muted};
  font-size: 14px;
`;

export const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${adm.border};
  border-top-color: ${adm.primary};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export const LangTabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #F1F5F9;
  border-radius: ${adm.radius};
  margin-bottom: 14px;
`;

export const LangTab = styled.button`
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  color: ${({ $active }) => ($active ? adm.primary : adm.muted)};
  box-shadow: ${({ $active }) => ($active ? '0 1px 4px rgba(15,23,42,0.08)' : 'none')};
`;

/* ─── Keep old names as aliases for backward compat ─── */
export const StyledCard = Card;
export const StyledLabel = Label;
export const StyledInput = Input;
export const StyledTextarea = Textarea;
export const StyledSelect = Select;
export const StyledBtn = BtnPrimary;
export const StyledGhost = BtnSecondary;
export const StyledDanger = BtnDanger;
export const StyledTable = Table;
export const StyledSave = BtnEdit;
export const StyledRow = styled.div`display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px;`;
export const StyledH1 = styled.h1`margin: 0 0 8px; font-size: 22px;`;
export const StyledLead = styled.p`margin: 0 0 16px; font-size: 14px; line-height: 1.5;`;
export const StyledWrap = styled.div`min-height: 100vh; padding: 24px 16px 48px; max-width: 960px; margin: 0 auto;`;
export const StyledBack = styled(Link)`display: inline-block; margin-top: 20px; font-size: 14px; color: inherit;`;
export const Tabs = styled.div`display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;`;
export const TabBtn = styled.button`padding: 8px 14px; border-radius: 999px; border: 1px solid ${adm.border}; background: ${({ $active }) => ($active ? 'rgba(37,99,235,0.12)' : 'transparent')}; font: inherit; font-size: 14px; cursor: pointer; font-weight: ${({ $active }) => ($active ? 700 : 400)};`;
export const Hint = styled.p`margin: 0 0 8px; font-size: 12px; opacity: 0.85;`;

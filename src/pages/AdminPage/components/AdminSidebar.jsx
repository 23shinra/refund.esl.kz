import React from 'react';
import PropTypes from 'prop-types';

import { ADMIN_NAV } from '../../../features/admin/constants.js';
import {
  SidebarBackdrop,
  SidebarBottom,
  SidebarBrand,
  SidebarBrandName,
  SidebarBrandSub,
  SidebarLogoutBtn,
  SidebarNav,
  SidebarNavBtn,
  SidebarNavIcon,
  SidebarNavItem,
  SidebarSiteLink,
  AdminSidebarWrap,
} from '../adminStyles.js';

const NAV_ICONS = {
  dashboard: '📊',
  categories: '📂',
  services: '🗂',
  questions: '❓',
  partners: '🤝',
  users: '👥',
  account: '🔐',
};

export function AdminSidebar({ activeSection, onSectionChange, onLogout, open, onClose }) {
  return (
    <>
      <SidebarBackdrop $open={open} onClick={onClose} />
      <AdminSidebarWrap $open={open} aria-label="Навигация">
        <SidebarBrand>
          <SidebarBrandName>Refund</SidebarBrandName>
          <SidebarBrandSub>Панель управления</SidebarBrandSub>
        </SidebarBrand>

        <SidebarNav>
          {ADMIN_NAV.map((item) => (
            <SidebarNavItem key={item.id}>
              <SidebarNavBtn
                $active={activeSection === item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onClose?.();
                }}
              >
                <SidebarNavIcon>{NAV_ICONS[item.id]}</SidebarNavIcon>
                {item.label}
              </SidebarNavBtn>
            </SidebarNavItem>
          ))}
        </SidebarNav>

        <SidebarBottom>
          <SidebarSiteLink to="/" target="_blank">
            <SidebarNavIcon>↗</SidebarNavIcon>
            На сайт
          </SidebarSiteLink>
          <SidebarLogoutBtn type="button" onClick={onLogout}>
            <SidebarNavIcon>⎋</SidebarNavIcon>
            Выйти
          </SidebarLogoutBtn>
        </SidebarBottom>
      </AdminSidebarWrap>
    </>
  );
}

AdminSidebar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

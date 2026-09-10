import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const openAuthModal = useCallback(() => setAuthOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthOpen(false), []);
  const openOnboardingModal = useCallback(() => setOnboardingOpen(true), []);
  const closeOnboardingModal = useCallback(() => setOnboardingOpen(false), []);

  const value = useMemo(
    () => ({
      authOpen,
      onboardingOpen,
      openAuthModal,
      closeAuthModal,
      openOnboardingModal,
      closeOnboardingModal,
    }),
    [authOpen, onboardingOpen, openAuthModal, closeAuthModal, openOnboardingModal, closeOnboardingModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

ModalProvider.propTypes = {
  children: PropTypes.node,
};

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals must be used within ModalProvider');
  return ctx;
}


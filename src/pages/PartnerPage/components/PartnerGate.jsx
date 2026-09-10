import React from 'react';
import PropTypes from 'prop-types';

import {
  PageBack,
  PageCard,
  PageHero,
  PageText,
  PageRoot,
  PageTitle,
} from '../../../components/PageLayout/PageLayout.jsx';

export function PartnerGateNeedLogin({ title, message, backLabel }) {
  return (
    <PageRoot>
      <PageHero>
        <PageTitle>{title}</PageTitle>
      </PageHero>
      <PageCard>
        <PageText>{message}</PageText>
        <PageBack to="/">{backLabel}</PageBack>
      </PageCard>
    </PageRoot>
  );
}

PartnerGateNeedLogin.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  backLabel: PropTypes.string.isRequired,
};

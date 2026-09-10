import React from 'react';
import PropTypes from 'prop-types';

import { PageCard, PageCardTitle } from '../../../components/PageLayout/PageLayout.jsx';
import {
  StyledBar,
  StyledBarFill,
  StyledBars,
  StyledMeta,
  StyledStat,
  StyledStatLbl,
  StyledStatRow,
  StyledStatVal,
  StyledTable,
} from '../partnerStyles.js';

export function PartnerAnalyticsSection({
  title,
  analytics,
  labels,
  noServicesYet,
  chartLabel,
}) {
  const maxH = Math.max(1, ...(analytics?.last7Days?.map((d) => d.count) ?? [1]));
  const barH = (c) => Math.round((c / maxH) * 100);

  return (
    <PageCard>
      <PageCardTitle>{title}</PageCardTitle>
      {analytics ? (
        <>
          <StyledStatRow>
            <StyledStat>
              <StyledStatVal>{analytics.totalApplications}</StyledStatVal>
              <StyledStatLbl>{labels.statApplications}</StyledStatLbl>
            </StyledStat>
            <StyledStat>
              <StyledStatVal>
                {analytics.linkedServices}/{analytics.maxServices}
              </StyledStatVal>
              <StyledStatLbl>{labels.statServices}</StyledStatLbl>
            </StyledStat>
          </StyledStatRow>
          {analytics.bySubcategory?.length ? (
            <StyledTable>
              <thead>
                <tr>
                  <th>{labels.colService}</th>
                  <th>{labels.colApps}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.bySubcategory.map((r) => (
                  <tr key={r.subcategoryId}>
                    <td>{r.title}</td>
                    <td>{r.applications}</td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          ) : (
            <StyledMeta>{noServicesYet}</StyledMeta>
          )}
          <div style={{ marginTop: 16 }}>
            <StyledMeta>{chartLabel}</StyledMeta>
            <StyledBars>
              {(analytics.last7Days ?? []).map((d) => (
                <StyledBar key={d.day}>
                  <StyledBarFill $h={barH(d.count)} title={`${d.day}: ${d.count}`} />
                  <span style={{ fontSize: 10, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    {d.day.slice(5)}
                  </span>
                </StyledBar>
              ))}
            </StyledBars>
          </div>
        </>
      ) : (
        <StyledMeta>…</StyledMeta>
      )}
    </PageCard>
  );
}

PartnerAnalyticsSection.propTypes = {
  title: PropTypes.string.isRequired,
  analytics: PropTypes.object,
  labels: PropTypes.shape({
    statApplications: PropTypes.string,
    statServices: PropTypes.string,
    colService: PropTypes.string,
    colApps: PropTypes.string,
  }).isRequired,
  noServicesYet: PropTypes.string.isRequired,
  chartLabel: PropTypes.string.isRequired,
};

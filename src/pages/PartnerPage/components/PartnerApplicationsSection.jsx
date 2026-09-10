import React from 'react';
import PropTypes from 'prop-types';

import { PageCard, PageCardTitle } from '../../../components/PageLayout/PageLayout.jsx';
import { StyledMeta, StyledSelect, StyledTable } from '../partnerStyles.js';

export function PartnerApplicationsSection({
  title,
  applications,
  busy,
  noApplications,
  labels,
  onStatusChange,
}) {
  const rows = applications?.applications ?? [];

  return (
    <PageCard>
      <PageCardTitle>{title}</PageCardTitle>
      {rows.length ? (
        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>{labels.colDate}</th>
                <th>{labels.colPhone}</th>
                <th>{labels.colService}</th>
                <th>{labels.colQuestion}</th>
                <th>{labels.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{String(a.created_at).slice(0, 16).replace('T', ' ')}</td>
                  <td>{a.phone}</td>
                  <td>{a.subcategory_title}</td>
                  <td>{a.question_preview}…</td>
                  <td>
                    <StyledSelect
                      value={a.status}
                      disabled={busy[`a${a.id}`]}
                      onChange={(e) => onStatusChange(a.id, e.target.value)}
                      aria-label={`${labels.colStatus} #${a.id}`}
                    >
                      <option value="new">{labels.statusNew}</option>
                      <option value="in_progress">{labels.statusProgress}</option>
                      <option value="done">{labels.statusDone}</option>
                    </StyledSelect>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </div>
      ) : (
        <StyledMeta>{noApplications}</StyledMeta>
      )}
    </PageCard>
  );
}

PartnerApplicationsSection.propTypes = {
  title: PropTypes.string.isRequired,
  applications: PropTypes.object,
  busy: PropTypes.object.isRequired,
  noApplications: PropTypes.string.isRequired,
  labels: PropTypes.object.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

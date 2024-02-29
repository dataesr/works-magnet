const datasources = [{ key: 'fosm', label: 'French OSM' }, { key: 'openalex', label: 'OpenAlex' }];

const status = {
  validated: {
    badgeType: 'success',
    buttonClassName: 'btn-keep',
    buttonIcon: 'ri-checkbox-circle-line',
    buttonLabel: 'Validate',
    id: 'validated',
    label: 'Validated',
  },
  excluded: {
    badgeType: 'error',
    buttonClassName: 'btn-hide',
    buttonIcon: 'ri-indeterminate-circle-line',
    buttonLabel: 'Exclude',
    id: 'excluded',
    label: 'Excluded',
  },
  tobedecided: {
    badgeType: 'info',
    buttonClassName: 'btn-reset',
    buttonIcon: 'ri-reply-fill',
    buttonLabel: 'Reset status',
    id: 'tobedecided',
    label: 'To be decided',
  },
};

const correction = {
  corrected: {
    badgeType: 'error',
    label: 'CORRECTION',
  },
  notcorrected: {
    badgeType: 'info',
    label: 'OK',
  },
};

export { correction, datasources, status };

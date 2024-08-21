const datasources = [{ key: 'fosm', label: 'French OSM' }, { key: 'openalex', label: 'OpenAlex' }];

const status = {
  validated: {
    badgeType: 'success',
    buttonClassName: 'btn-keep',
    buttonIcon: 'ri-checkbox-circle-line',
    buttonLabel: 'Validate',
    iconColor: '#8dc572',
    id: 'validated',
    label: 'Validated',
  },
  excluded: {
    badgeType: 'error',
    buttonClassName: 'btn-hide',
    buttonIcon: 'ri-indeterminate-circle-line',
    buttonLabel: 'Exclude',
    iconColor: '#be6464',
    id: 'excluded',
    label: 'Excluded',
  },
  tobedecided: {
    badgeType: 'info',
    buttonClassName: 'btn-reset',
    buttonIcon: 'ri-reply-fill',
    buttonLabel: 'Reset status',
    iconColor: '#337ab7',
    id: 'tobedecided',
    label: 'To be decided',
  },
};

const correction = {
  corrected: {
    badgeType: 'error',
    label: 'MODIFIED',
  },
  reset: {
    badgeType: 'info',
    label: 'CANCEL',
  },
  notcorrected: {
    badgeType: 'info',
    label: 'Already OK',
  },
};

export { correction, datasources, status };

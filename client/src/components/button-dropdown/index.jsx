// https://www.w3schools.com/css/css_dropdowns.asp
import PropTypes from 'prop-types';
import useToast from '../../hooks/useToast';

import Button from '../button';
import { export2Csv, export2FosmCsv, export2jsonl } from '../../utils/files';
import { sendGitHubIssue } from '../../utils/github';

import './index.scss';

export default function ButtonDropdown({ data, label, searchParams }) {
  const { toast } = useToast();
  const toastExport = () => {
    toast({
      description: `${data.length} ${label} have been saved`,
      id: 'saveWork',
      title: `${label} saved`,
      toastType: 'success',
    });
  };
  const toastOpenAlex = () => {
    toast({
      description: `${data.length} corrections to OpenAlex have been saved - see https://github.com/dataesr/openalex-affiliations/issues`,
      id: 'saveOpenAlex',
      title: `${label} saved`,
      toastType: 'success',
    });
  };
  return (
    <div className={`dropdown ${data.length > 0 ? 'enabled' : 'disabled'}`}>
      <Button
        disabled={!data.length}
        icon="ri-save-line"
        size="sm"
      >
        Export
        {' '}
        {label}
      </Button>
      <div className="dropdown-content">
        <Button
          onClick={() => { export2Csv({ data, label, searchParams }); toastExport(); }}
          size="sm"
          disabled
        >
          Export in CSV (minimal data)
        </Button>
        <Button
          onClick={() => { export2jsonl({ data, label, searchParams }); toastExport(); }}
          size="sm"
        >
          Export in JSONL (complete data)
        </Button>
        {['publications', 'datasets'].includes(label) && (
          <Button
            onClick={() => { export2FosmCsv({ data, label, searchParams }); toastExport(); }}
            size="sm"
          >
            Custom export for French OSM
          </Button>
        )}
        {label === 'OpenAlex errors' && (
          <Button
            onClick={() => { sendGitHubIssue({ data }); toastOpenAlex(); }}
            size="sm"
          >
            Send feedback to OpenAlex
          </Button>
        )}
      </div>
    </div>
  );
}

ButtonDropdown.propTypes = {
  data: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  searchParams: PropTypes.object.isRequired,
};

// https://www.w3schools.com/css/css_dropdowns.asp
import PropTypes from 'prop-types';

import Button from '../button';
import { export2Csv, export2FosmCsv, export2jsonl } from '../../utils/files';

import './index.scss';

export default function ButtonDropdown({ data, label, searchParams }) {
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
          onClick={() => export2Csv({ data, label, searchParams })}
          size="sm"
          disabled
        >
          Export in CSV (minimal data)
        </Button>
        <Button
          onClick={() => export2jsonl({ data, label, searchParams })}
          size="sm"
        >
          Export in JSONL (complete data)
        </Button>
        {label === 'publications' && (
          <Button
            onClick={() => export2FosmCsv({ data })}
            size="sm"
          >
            Custom export for French OSM
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

// https://www.w3schools.com/css/css_dropdowns.asp
import { Button } from '@dataesr/dsfr-plus';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import useToast from '../../hooks/useToast';
import { export2Csv, export2FosmCsv, export2jsonl } from '../../utils/files';
import { capitalize } from '../../utils/works';

import './index.scss';

export default function ButtonDropdown({ className, data, label, searchParams }) {
  const { toast } = useToast();

  const _className = classNames(
    'dropdown',
    data.length > 0 ? 'enabled' : 'disabled',
    className,
  );

  const toastExport = (numberOfLines) => {
    const size = numberOfLines ?? data.length;
    toast({
      description: `${size} ${label} have been saved`,
      id: 'saveWork',
      title: `${capitalize(label)} saved`,
      toastType: 'success',
    });
  };

  return (
    <div className={_className}>
      <Button
        disabled={!data.length}
        icon="save-line"
        size="sm"
      >
        {`Export ${label} (${data.length})`}
      </Button>
      <div className="dropdown-content">
        <Button
          onClick={() => { export2Csv({ data, label, searchParams }); toastExport(); }}
          size="sm"
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
            onClick={() => {
              const numberOfLines = export2FosmCsv({ data, label, searchParams });
              toastExport(numberOfLines);
            }}
            size="sm"
          >
            Custom export for French OSM
          </Button>
        )}
      </div>
    </div>
  );
}

ButtonDropdown.defaultProps = {
  className: '',
};

ButtonDropdown.propTypes = {
  className: PropTypes.string,
  data: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  searchParams: PropTypes.object.isRequired,
};

// https://www.w3schools.com/css/css_dropdowns.asp
import { Button } from '@dataesr/dsfr-plus';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import useToast from '../../hooks/useToast';
import { export2Csv, export2FosmCsv, export2jsonl } from '../../utils/files';
import { capitalize } from '../../utils/strings';

import './index.scss';

export default function ButtonDropdown({ className, data, label, searchParams, size, transformCsv }) {
  const { toast } = useToast();

  const _className = classNames(
    'dropdown',
    data.length > 0 ? 'enabled' : 'disabled',
    className,
  );

  const toastExport = (numberOfLines) => {
    const _size = numberOfLines ?? data.length;
    toast({
      description: `${_size} ${label} have been saved`,
      id: 'saveWork',
      title: `${capitalize(label)} saved`,
      toastType: 'success',
    });
  };

  return (
    <div className={_className}>
      <Button
        color="blue-ecume"
        disabled={!data.length}
        icon="save-line"
        size={size}
      >
        {`Export ${label} (${data.length})`}
      </Button>
      <div className="dropdown-content">
        <Button
          color="blue-ecume"
          onClick={() => { export2Csv({ data, label, searchParams, transform: transformCsv }); toastExport(); }}
          size={size}
        >
          Export in CSV (minimal data)
        </Button>
        <Button
          color="blue-ecume"
          onClick={() => { export2jsonl({ data, label, searchParams }); toastExport(); }}
          size={size}
        >
          Export in JSONL (complete data)
        </Button>
        {['publications', 'datasets'].includes(label) && (
          <Button
            color="blue-ecume"
            onClick={() => {
              const numberOfLines = export2FosmCsv({ data, label, searchParams });
              toastExport(numberOfLines);
            }}
            size={size}
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
  size: 'md',
  transformCsv: (data) => data,
};

ButtonDropdown.propTypes = {
  className: PropTypes.string,
  data: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  searchParams: PropTypes.object.isRequired,
  size: PropTypes.string,
  transformCsv: PropTypes.func,
};

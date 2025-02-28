import PropTypes from 'prop-types';
import { TextInput } from '@dataesr/dsfr-plus';
import CustomToggle from './custom-toggle';

function FieldFromKey({ term, setAdvancedSearchTermValues }) {
  switch (term.key) {
  case 'affiliation':
    return <TextInput hint="Example 'Cern'" onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} type="text" value={term.value} message="" />;
  case 'all':
    return <TextInput hint="Example 'Coq' or 'Cern'" onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} type="text" value={term.value} message="" />;
  case 'author':
    return <TextInput hint="Example 'John Doe'" onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} type="text" value={term.value} message="" />;
  case 'created':
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div className="fr-mt-5w">Charaterization is created</div>
        <div className="fr-mt-2w">
          <CustomToggle checked={term.value} onChange={(e) => setAdvancedSearchTermValues(term, e.target.checked)} />
        </div>
      </div>
    );
  case 'doi':
    return <TextInput hint="Example '10.1109/5.771073'" onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} type="text" value={term.value} message="" />;
  case 'mention':
    return <TextInput hint="Example 'Coq'" onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} type="text" value={term.value} message="" />;
  case 'mentionType':
    return (
      <select onChange={(e) => setAdvancedSearchTermValues(term, e.target.value)} value={term.value} className="fr-select fr-mt-4w">
        <option value="dataset">Dataset</option>
        <option value="software">Software</option>
      </select>
    );
  case 'shared':
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div className="fr-mt-5w">Charaterization is shared</div>
        <div className="fr-mt-2w">
          <CustomToggle checked={term.value} onChange={(e) => setAdvancedSearchTermValues(term, e.target.checked)} />
        </div>
      </div>
    );
  case 'used':
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div className="fr-mt-5w">Charaterization is used</div>
        <div className="fr-mt-2w">
          <CustomToggle checked={term.value} onChange={(e) => setAdvancedSearchTermValues(term, e.target.checked)} />
        </div>
      </div>
    );
  default:
  }
}

FieldFromKey.propTypes = {
  term: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  setAdvancedSearchTermValues: PropTypes.func.isRequired,
};

function FieldSelector({ term, index, setAdvancedSearchTermKeys }) {
  return (
    <select
      className="fr-select fr-mt-1w"
      onChange={(e) => (setAdvancedSearchTermKeys(
        term,
        index,
        e.target.value,
        (e.target.value === 'used' || e.target.value === 'created' || e.target.value === 'shared') ? false : term.value,
      ))}
      value={term.key}
    >
      <option value="all">All fields</option>
      <option value="doi">DOI</option>
      <option value="mentionType">Type of mention</option>
      <option value="mention">Mention</option>
      <option value="affiliation">Affiliation</option>
      <option value="author">Author</option>
      <option value="used">Charaterization - Used</option>
      <option value="created">Charaterization - Created</option>
      <option value="shared">Charaterization - Shared</option>
    </select>
  );
}

FieldSelector.propTypes = {
  term: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  setAdvancedSearchTermKeys: PropTypes.func.isRequired,
};

export { FieldFromKey, FieldSelector };

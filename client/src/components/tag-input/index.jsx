import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row, Col,
  // Icon,
  TagGroup, DismissibleTag,
  TextInput,
} from '@dataesr/dsfr-plus';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

const SEE_MORE_AFTER = 5;

// TODO: Add icons

export default function TagInput({
  deletedTags,
  getRoRChildren,
  hint,
  label,
  message,
  messageType,
  onInputHandler,
  onTagsChange,
  placeholder,
  setGetRoRChildren,
  tags,
}) {
  const [excludedValues, setExcludedValues] = useState(deletedTags);
  const [input, setInput] = useState('');
  const [seeMore, setSeeMore] = useState(false);
  const [values, setValues] = useState(tags);

  const getTagColor = (tag) => {
    if (tag.disable) return 'beige-gris-galet';
    if (tag.source === 'ror') return 'brown-caramel';
    return 'brown-cafe-creme';
  };

  const handleDeleteClick = (tag) => {
    const deletedValues = excludedValues;
    deletedValues.push(tag);
    const newValues = [...values.filter((el) => el !== tag)];
    setValues(newValues);
    setExcludedValues(deletedValues);
    onTagsChange(newValues, deletedValues);
  };

  const handleKeyDown = (e) => {
    if ([9, 13].includes(e.keyCode) && input) {
      e.preventDefault();
      if (values.map((value) => value.label).includes(input.trim())) {
        setInput('');
        return;
      }
      const inputLabel = input.trim();
      const newValues = [...values, { disable: inputLabel.length < VITE_APP_TAG_LIMIT, label: inputLabel, source: 'user' }];
      setValues(newValues);
      setInput('');
      onTagsChange(newValues, excludedValues);
    }
  };

  useEffect(() => {
    if (input && input.length > 0) {
      onInputHandler(true);
    } else if (input.length === 0) {
      onInputHandler(false);
    }
  }, [input, onInputHandler]);

  useEffect(() => setValues(tags), [tags]);

  useEffect(() => setExcludedValues(deletedTags), [deletedTags]);

  let hasRoR = false;
  let newLine = [];
  const structuredTags = [];
  tags.forEach((tag) => {
    if (tag.type === 'rorId') {
      hasRoR = true;
      if (newLine.length) {
        structuredTags.push(newLine);
      }
      newLine = [];
    }
    newLine.push(tag);
  });
  if (newLine.length) {
    structuredTags.push(newLine);
  }

  return (
    <div>
      <Row alignItems="bottom">
        <Col className="fr-pb-2w">
          <TextInput
            hint={hint}
            label={label}
            message={message}
            messageType={messageType}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            type="text"
            value={input}
          />
        </Col>
      </Row>
      {
        structuredTags.slice(0, seeMore ? structuredTags.length : SEE_MORE_AFTER).map((currentTags, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`row-tags-${index}`} style={{ maxHeight: '200px', overflowX: 'hidden', overflowY: 'scroll' }}>
            <Col>
              <TagGroup>
                {currentTags.map((tag) => (
                  <DismissibleTag
                    className="fr-mr-1w"
                    color={getTagColor(tag)}
                    key={tag.label}
                    onClick={() => handleDeleteClick(tag)}
                    size="sm"
                    title={`Tag ${tag.label}${tag.disable ? ' (not searched)' : ''}`}
                  >
                    {tag.label}
                  </DismissibleTag>
                ))}
                {(index === 0 && hasRoR) ? (
                  <Button
                    className="fr-mr-1w"
                    hasBorder={false}
                    icon={getRoRChildren ? 'arrow-go-back-line' : 'node-tree'}
                    onClick={() => setGetRoRChildren((prev) => !prev)}
                    size="sm"
                  >
                    {
                      getRoRChildren
                        ? 'Remove RoR children'
                        : 'Get children from RoR'
                    }
                  </Button>
                ) : null}
              </TagGroup>
            </Col>
          </Row>
        ))
      }
      {(structuredTags.length > SEE_MORE_AFTER) && (
        <Button
          className="fr-mr-1w"
          onClick={() => setSeeMore((prev) => !prev)}
          size="sm"
        >
          {
            seeMore
              ? 'Reduce the list'
              : `Display ${structuredTags.length - SEE_MORE_AFTER} more rows`
          }
        </Button>
      )}
      <Button
        onClick={() => onTagsChange([], excludedValues)}
        size="sm"
      >
        Clear all affiliations
      </Button>
    </div>
  );
}

TagInput.propTypes = {
  deletedTags: PropTypes.arrayOf(PropTypes.object),
  getRoRChildren: PropTypes.bool,
  hint: PropTypes.string,
  label: PropTypes.string.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(['error', 'valid', '']),
  onInputHandler: PropTypes.func,
  onTagsChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  setGetRoRChildren: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.object),
};

TagInput.defaultProps = {
  deletedTags: [],
  getRoRChildren: false,
  hint: 'Press "ENTER" to search for several terms',
  message: '',
  messageType: '',
  onInputHandler: () => { },
  placeholder: '',
  setGetRoRChildren: () => { },
  tags: [],
};

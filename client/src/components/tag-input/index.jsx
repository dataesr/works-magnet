import { Button, Col, Icon, Row, Tag, TagGroup, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const SEE_MORE_AFTER = 5;

function SeeMoreTags({ data, maxTags = SEE_MORE_AFTER }) {
  const [seeMore, setSeeMore] = useState(false);
  const tail = seeMore ? data.slice(SEE_MORE_AFTER) : null;
  const button = (data.length > maxTags ? (
    <Button
      size="sm"
      onClick={() => setSeeMore((prev) => !prev)}
    >
      {
        seeMore
          ? 'Reduce the list'
          : `Display ${data.length - maxTags} more rows`
      }
    </Button>
  ) : null);
  return (
    <>
      {data.slice(0, SEE_MORE_AFTER)}
      {tail}
      {button}
    </>
  );
}

export default function TagInput({
  hint,
  label,
  message,
  messageType,
  onInputHandler,
  onTagsChange,
  placeholder,
  tags,
  deletedTags,
}) {
  const [input, setInput] = useState('');
  const [values, setValues] = useState(tags);
  const [excludedValues, setExcludedValues] = useState(deletedTags);

  const handleKeyDown = (e) => {
    if ([9, 13].includes(e.keyCode) && input) {
      e.preventDefault();
      if (values.map((value) => value.label).includes(input.trim())) {
        setInput('');
        return;
      }
      const newValues = [...values, { label: input.trim(), source: 'user' }];
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

  const handleDeleteClick = (tag) => {
    const deletedValues = excludedValues;
    deletedValues.push(tag);
    const newValues = [...values.filter((el) => el !== tag)];
    setValues(newValues);
    setExcludedValues(deletedValues);
    onTagsChange(newValues, deletedValues);
  };

  useEffect(() => setValues(tags), [tags]);
  useEffect(() => setExcludedValues(deletedTags), [deletedTags]);
  let newLine = [];
  const structuredTags = [];
  tags.forEach((tag) => {
    if (tag.type === 'rorId') {
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
  const rowTags = [];
  structuredTags.forEach((currentTags) => {
    rowTags.push(
      <Row key={`row-tags-${rowTags.length}`} style={{ 'max-height': '200px', 'overflow-x': 'hidden', 'overflow-y': 'scroll' }}>
        <Col className="">
          <TagGroup>
            {currentTags.map((tag) => (
              <Tag
                className="fr-mr-1w"
                small
                colorFamily={(tag?.source ?? 'user') === 'user' ? 'brown-cafe-creme' : 'brown-caramel'}
                key={tag.label}
                onClick={() => handleDeleteClick(tag)}
              >
                {tag.label}
                <Icon iconPosition="right" name="ri-close-line" />
              </Tag>
            ))}
          </TagGroup>
        </Col>
      </Row>,
    );
  });
  return (
    <div>
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
        <SeeMoreTags data={rowTags} />
      </div>
    </div>
  );
}

TagInput.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(['error', 'valid', '']),
  onInputHandler: PropTypes.func,
  onTagsChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.object),
  deletedTags: PropTypes.arrayOf(PropTypes.object),
};

TagInput.defaultProps = {
  hint: 'Valider votre ajout avec la touche "Entrée"',
  message: '',
  messageType: '',
  onInputHandler: () => { },
  placeholder: '',
  tags: [],
  deletedTags: [],
};

import { Col, Icon, Row, Tag, TagGroup, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export default function TagInput({
  hint,
  label,
  message,
  messageType,
  onInputHandler,
  onTagsChange,
  placeholder,
  tags,
}) {
  const [input, setInput] = useState('');
  const [values, setValues] = useState(tags);

  const handleKeyDown = (e) => {
    if ([9, 13].includes(e.keyCode) && input) {
      e.preventDefault();
      if (values.map((value) => value.label).includes(input.trim())) {
        setInput('');
        return;
      }
      const newValues = [...values, { color: 'brown-cafe-creme', label: input.trim() }];
      setValues(newValues);
      setInput('');
      onTagsChange(newValues);
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
    const newValues = [...values.filter((el) => el !== tag)];
    setValues(newValues);
    onTagsChange(newValues);
  };

  useEffect(() => setValues(tags), [tags]);

  return (
    <div>
      <div>
        <Row alignItems="bottom">
          <Col>
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
        <Row style={{ 'max-height': '225px', 'overflow-x': 'hidden', 'overflow-y': 'scroll' }}>
          <Col className="fr-pt-2w">
            <TagGroup>
              {values.map((tag) => (
                <Tag
                  className="fr-mr-1w"
                  // brown-cafe-creme, brown-caramel, brown-opera
                  colorFamily={tag?.color ?? 'brown-cafe-creme'}
                  key={tag.label}
                  onClick={() => handleDeleteClick(tag)}
                >
                  {tag.label}
                  <Icon iconPosition="right" name="ri-close-line" />
                </Tag>
              ))}
            </TagGroup>
          </Col>
        </Row>
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
};

TagInput.defaultProps = {
  hint: 'Valider votre ajout avec la touche "Entrée"',
  message: '',
  messageType: '',
  onInputHandler: () => { },
  placeholder: '',
  tags: [],
};

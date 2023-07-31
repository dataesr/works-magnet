import { Col, Icon, Row, Tag, TagGroup, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export default function TagInput({
  hint,
  label,
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
      if (values.includes(input.trim())) return;
      const newValues = [...values, input.trim()];
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              value={input}
              placeholder={placeholder}
            />
          </Col>
        </Row>
        <Row>
          <Col className="fr-pt-2w">
            <TagGroup>
              {values.map((tag) => (
                <Tag
                  className="fr-mr-1w"
                  key={tag}
                  onClick={() => handleDeleteClick(tag)}
                >
                  {tag}
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
  onTagsChange: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  onInputHandler: PropTypes.func,
};

TagInput.defaultProps = {
  hint: 'Valider votre ajout avec la touche "Entrée"',
  tags: [],
  placeholder: '',
  onInputHandler: () => { },
};

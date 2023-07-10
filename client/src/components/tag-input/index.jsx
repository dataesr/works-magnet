import { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Icon, Row, Tag, TagGroup, TextInput } from '@dataesr/react-dsfr';

export default function TagInput({ label, hint, tags, onTagsChange }) {
  const [input, setInput] = useState('');
  const [values, setValues] = useState(tags);

  const handleKeyDown = (e) => {
    if ([13, 9, 66].includes(e.keyCode) && input) {
      e.preventDefault();
      if (values.includes(input.trim())) return;
      const newValues = [...values, input.trim()];
      setValues(newValues);
      setInput('');
      onTagsChange(newValues);
    }
  };

  const handleDeleteClick = (tag) => {
    const newValues = [...values.filter((el) => el !== tag)];
    setValues(newValues);
    onTagsChange(newValues);
  };

  return (
    <div>
      <div>
        <Row alignItems="bottom">
          <Col>
            <TextInput
              type="text"
              value={input}
              label={label}
              hint={hint}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Col>
        </Row>
        <Row>
          <Col className="fr-pt-2w">
            <TagGroup>
              {values.map((tag) => (
                <Tag
                  key={tag}
                  className="fr-mr-1w"
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
  tags: PropTypes.arrayOf(PropTypes.string),
  onTagsChange: PropTypes.func.isRequired,
};

TagInput.defaultProps = {
  hint: 'Valider votre ajout avec la touche "Entrée"',
  tags: [],
};

import {
  Button,
  Col,
  DismissibleTag,
  Row,
  Spinner,
  TagGroup,
  TextInput,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { getTagColor } from '../../utils/tags';

import './index.scss';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

const SEE_MORE_AFTER = 3;

export default function TagInput({
  className,
  deletedTags,
  getRorChildren,
  hint,
  isLoading,
  isRequired,
  label,
  message,
  messageType,
  onInputHandler,
  onTagsChange,
  placeholder,
  seeMoreAction,
  seeMoreAfter,
  switchGetRorChildren,
  tags,
}) {
  const [excludedValues, setExcludedValues] = useState(deletedTags);
  const [input, setInput] = useState('');
  const [seeMore, setSeeMore] = useState(false);
  const [values, setValues] = useState(tags);
  const _seeMoreAction = seeMoreAction || (() => setSeeMore((prev) => !prev));

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
      const newValues = [...values, { isDisabled: inputLabel.length < VITE_APP_TAG_LIMIT, label: inputLabel, source: 'user' }];
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

  let hasRor = false;
  let newLine = [];
  const structuredTags = [];
  tags.forEach((tag) => {
    if (tag.type === 'rorId') {
      hasRor = true;
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
    <>
      <Row className={className} verticalAlign="bottom">
        <Col className="fr-pb-2w">
          <TextInput
            hint={hint}
            label={label}
            message={message}
            messageType={messageType}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={isRequired}
            type="text"
            value={input}
          />
        </Col>
      </Row>
      {isLoading ? <Spinner size={48} /> : (
        <>
          {structuredTags.slice(0, seeMore || seeMoreAfter === 0 ? structuredTags.length : seeMoreAfter).map((currentTags, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={`tags-row-${index}`}>
              <Col>
                <Row>
                  <TagGroup>
                    {currentTags.map((currentTag) => (
                      <DismissibleTag
                        className={`fr-mr-1w ${currentTag.isDisabled ? 'scratched' : ''}`}
                        color={getTagColor(currentTag)}
                        key={currentTag.label}
                        onClick={() => handleDeleteClick(currentTag)}
                        size="sm"
                        title={`${currentTag.label}${currentTag.isDisabled ? ' (not searched)' : ''}`}
                      >
                        {currentTag.label}
                      </DismissibleTag>

                    ))}
                  </TagGroup>
                  {index === 0 && hasRor && (
                    <Button
                      className="fr-mr-1w"
                      // eslint-disable-next-line react/no-array-index-key
                      key={`tags-ror-${index}`}
                      onClick={() => switchGetRorChildren()}
                      size="sm"
                      variant="text"
                    >
                      {
                        getRorChildren
                          ? (
                            <>
                              <i className="ri-arrow-go-back-line fr-mr-1w" />
                              Remove ROR children
                            </>
                          )
                          : (
                            <>
                              <i className="ri-node-tree fr-mr-1w" />
                              Get children from ROR
                            </>
                          )
                      }
                    </Button>
                  )}
                </Row>
              </Col>
            </Row>
          ))}
          {seeMoreAfter !== 0 && structuredTags.length > seeMoreAfter && (
            <Button
              className="fr-mr-1w fr-mb-2w"
              onClick={_seeMoreAction}
              size="sm"
            >
              {
                seeMore
                  ? 'Reduce the list'
                  : `Display ${structuredTags.length - seeMoreAfter} more rows`
              }
            </Button>
          )}
        </>
      )}
    </>
  );
}

TagInput.propTypes = {
  className: PropTypes.string,
  deletedTags: PropTypes.arrayOf(PropTypes.object),
  getRorChildren: PropTypes.bool,
  hint: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isLoading: PropTypes.bool,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(['error', 'valid', '']),
  onInputHandler: PropTypes.func,
  onTagsChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  seeMoreAction: PropTypes.func,
  seeMoreAfter: PropTypes.number,
  switchGetRorChildren: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.object),
};

TagInput.defaultProps = {
  className: '',
  deletedTags: [],
  getRorChildren: false,
  hint: 'Press "ENTER" to search for several terms',
  isLoading: false,
  isRequired: false,
  message: '',
  messageType: '',
  onInputHandler: () => { },
  placeholder: '',
  seeMoreAfter: SEE_MORE_AFTER,
  seeMoreAction: undefined,
  switchGetRorChildren: () => { },
  tags: [],
};

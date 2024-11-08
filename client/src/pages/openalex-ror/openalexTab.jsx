import {
  Button,
  Container, Row, Col,
  Modal, ModalContent, ModalFooter, ModalTitle,
  TagGroup, Tag,
  TextInput,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { status } from '../../config';
import { getAffiliationsCorrections } from '../../utils/curations';
import { isRor } from '../../utils/ror';
import { capitalize, removeDiacritics } from '../../utils/strings';
import OpenalexView from './openalexView';

export default function OpenalexTab({
  affiliations,
  options,
  setAllOpenalexCorrections,
  undo,
}) {
  const [action, setAction] = useState();
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredStatus] = useState([
    status.tobedecided.id,
    status.validated.id,
    status.excluded.id,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ror, setRor] = useState('');
  const [selectedOpenAlex, setSelectedOpenAlex] = useState([]);
  const [timer, setTimer] = useState();

  const actionToOpenAlex = (_action, _selectedOpenAlex, _ror) => {
    _selectedOpenAlex.map((item) => {
      let rorsToCorrect = item.rorsToCorrect.trim().split(';');
      if (action === 'add') {
        rorsToCorrect.push(_ror);
      } else if (action === 'remove') {
        rorsToCorrect = rorsToCorrect.filter((item2) => item2 !== _ror);
      }
      // eslint-disable-next-line no-param-reassign
      item.rorsToCorrect = [...new Set(rorsToCorrect)].join(';');
      // eslint-disable-next-line no-param-reassign
      item.hasCorrection = item.rors.map((r) => r.rorId).join(';') !== item.rorsToCorrect;
      return item;
    });
    setAllOpenalexCorrections(getAffiliationsCorrections(_selectedOpenAlex));
  };

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredAffiliationsTmp = affiliations.filter((affiliation) => {
        const regex = new RegExp(removeDiacritics(filteredAffiliationName));
        return regex.test(
          affiliation.key.replace('[ source: ', '').replace(' ]', ''),
        );
      });
      // Recompute corrections only when the array has changed
      if (filteredAffiliationsTmp.length !== filteredAffiliations.length) {
        setAllOpenalexCorrections(
          getAffiliationsCorrections(filteredAffiliationsTmp),
        );
      }
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationName, filteredStatus]);

  return (
    <Container fluid>
      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen((prev) => !prev)}>
        <ModalTitle>
          {`${capitalize(action)} ROR to ${
            selectedOpenAlex.length
          } OpenAlex affiliation${selectedOpenAlex.length > 1 ? 's' : ''}`}
        </ModalTitle>
        <ModalContent>
          <TextInput
            label={`Which ROR do you want to ${action} ?`}
            onChange={(e) => setRor(e.target.value)}
            required
            message={isRor(ror) ? 'ROR valid' : 'ROR invalid'}
            messageType={isRor(ror) ? 'valid' : 'error'}
          />
        </ModalContent>
        <ModalFooter>
          <Button
            disabled={!isRor(ror)}
            onClick={() => {
              actionToOpenAlex(action, selectedOpenAlex, ror);
              setRor('');
              setIsModalOpen((prev) => !prev);
            }}
            title="Send feedback to OpenAlex"
          >
            {capitalize(action)}
          </Button>
        </ModalFooter>
      </Modal>
      <Row className="wm-bg">
        <Col md={2} className="wm-menu">
          <div className="wm-text">
            Search parameters
          </div>
          <TagGroup className="fr-ml-1w">
            <Tag color="green-emeraude" size="sm">
              {`Selected years: ${options.startYear} - ${options.endYear}`}
            </Tag>
            <Tag color="green-tilleul-verveine" size="sm">
              Affiliations: essec
            </Tag>
          </TagGroup>
          <Button
            icon="arrow-go-back-fill"
            color="blue-ecume"
            size="sm"
            style={{ width: '100%' }}
          >
            Back to search
          </Button>

          <hr />
          <div className="wm-text fr-mb-3w">
            <span>{selectedOpenAlex.length}</span>
            {` selected affiliation${selectedOpenAlex.length === 1 ? '' : 's'}`}
          </div>
          <Button
            className="wm-button fr-mb-1w"
            color="beige-gris-galet"
            disabled={!selectedOpenAlex.length}
            icon="add-circle-line"
            key="add-ror"
            onClick={() => {
              setAction('add');
              setIsModalOpen((prev) => !prev);
            }}
            size="sm"
            title="Add ROR"
          >
            Add ROR
          </Button>
          <Button
            className="wm-button"
            color="beige-gris-galet"
            disabled={!selectedOpenAlex.length}
            icon="close-circle-line"
            key="remove-ror"
            onClick={() => {
              setAction('remove');
              setIsModalOpen((prev) => !prev);
            }}
            size="sm"
            title="Remove ROR"
          >
            Remove ROR
          </Button>

        </Col>
        <Col md={9} className="wm-content fr-mb-1w">
          <OpenalexView
            allAffiliations={filteredAffiliations}
            filteredAffiliationName={filteredAffiliationName}
            selectedOpenAlex={selectedOpenAlex}
            setAllOpenalexCorrections={setAllOpenalexCorrections}
            setFilteredAffiliationName={setFilteredAffiliationName}
            setSelectedOpenAlex={setSelectedOpenAlex}
            undo={undo}
          />
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

OpenalexTab.propTypes = {
  affiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired,
};

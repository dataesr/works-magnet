import {
  Button,
  Col,
  Container,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  Row,
  TextInput,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { status } from '../config';
import { getAffiliationsCorrections } from '../utils/curations';
import { isRor } from '../utils/ror';
import { removeDiacritics } from '../utils/strings';
import { capitalize } from '../utils/works';
import OpenalexView from './openalexView';

export default function OpenalexTab({
  affiliations,
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
  const [fixedMenu, setFixedMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ror, setRor] = useState();
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
              setIsModalOpen((prev) => !prev);
            }}
            title="Send feedback to OpenAlex"
          >
            {capitalize(action)}
          </Button>
        </ModalFooter>
      </Modal>
      <div
        className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`}
        title="actions"
      >
        <div
          className={`selected-item ${selectedOpenAlex.length && 'selected'}`}
        >
          <span className="number">{selectedOpenAlex.length}</span>
          {`selected affiliation${selectedOpenAlex.length === 1 ? '' : 's'}`}
        </div>
        <Button
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedOpenAlex.length}
          key="add-ror"
          onClick={() => {
            setAction('add');
            setIsModalOpen((prev) => !prev);
          }}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
          title="Add ROR"
        >
          <i
            className="ri-add-circle-line fr-mr-2w"
            style={{ color: '#8dc572' }}
          />
          Add ROR
        </Button>
        <Button
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedOpenAlex.length}
          key="remove-ror"
          onClick={() => {
            setAction('remove');
            setIsModalOpen((prev) => !prev);
          }}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
          title="Remove ROR"
        >
          <i
            className="ri-close-circle-line fr-mr-2w"
            style={{ color: '#be6464' }}
          />
          Remove ROR
        </Button>
        <div className="text-right">
          <Button
            onClick={() => setFixedMenu(!fixedMenu)}
            size="sm"
            variant="tertiary"
          >
            {fixedMenu ? (
              <i className="ri-pushpin-fill" />
            ) : (
              <i className="ri-pushpin-line" />
            )}
          </Button>
        </div>
      </div>
      <Row gutters>
        <Col n="12">
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

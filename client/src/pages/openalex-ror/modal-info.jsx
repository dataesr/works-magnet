import {
  Button,
  Modal, ModalContent, ModalTitle,
  Text,
  Title,
} from '@dataesr/dsfr-plus';
import { useState } from 'react';

export default function ModalInfo() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [step, setStep] = useState(1);

  return (
    <>
      <Title as="h2" className="fr-mb-3w">
        Improve ROR matching in OpenAlex
        <Button
          className="fr-btn--icon fr-fi-info-line fr-ml-1w"
          icon="fr-info-line"
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: '25px' }}
        />
      </Title>

      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen(false)} size="xl">
        <ModalTitle>
          Improve ROR matching in OpenAlex - Provide your feedback in 3 steps!
        </ModalTitle>
        <ModalContent>
          <div className="fr-stepper" style={{ minHeight: '200px' }}>
            {
              step === 1 && (
                <>
                  <h2 className="fr-stepper__title">
                    Control information
                    <span className="fr-stepper__state">Step 1 of 3</span>
                  </h2>
                  <div className="fr-stepper__steps" data-fr-current-step="1" data-fr-steps="3" />
                  <div className="box-info">
                    <Text className="fr-py-3w">
                      🔎 The array below summarizes the most frequent raw affiliation
                      strings retrieved in OpenAlex for your query.
                      <br />
                      🤖 The second column indicates the ROR automatically computed by
                      OpenAlex. Sometimes, they can be inaccurate or missing.
                    </Text>
                  </div>
                </>
              )
            }
            {
              step === 2 && (
                <>
                  <h2 className="fr-stepper__title">
                    Corrects incorrect ROR
                    <span className="fr-stepper__state">Step 2 of 3</span>
                  </h2>
                  <div className="fr-stepper__steps" data-fr-current-step="2" data-fr-steps="3" />
                  <div className="box-info">
                    <Text className="fr-py-3w">
                      ✏️ Click the third column to edit and input the right RORs for
                      this raw affiliation string. Use a ';' to input multiple RORs.
                    </Text>
                  </div>
                </>
              )
            }
            {
              step === 3 && (
                <>
                  <h2 className="fr-stepper__title">
                    Send correction to OpenAlex
                    <span className="fr-stepper__state">Step 3 of 3</span>
                  </h2>
                  <div className="fr-stepper__steps" data-fr-current-step="3" data-fr-steps="3" />
                  <div className="box-info">
                    <Text className="fr-py-3w">
                      🗣 Once finished, you can use the Export button on the right to
                      send this feedback to OpenAlex.
                    </Text>
                  </div>
                </>
              )
            }
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={step === 1} icon="arrow-left-s-fill" onClick={() => setStep(step - 1)}>Previous step</Button>
            <Button disabled={step === 3} icon="arrow-right-s-fill" iconPosition="right" onClick={() => setStep(step + 1)}>Next step</Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

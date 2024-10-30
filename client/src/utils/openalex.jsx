const getAffiliationsCorrections = (affiliations) => affiliations
  .filter((affiliation) => affiliation.hasCorrection)
  .map((affiliation) => ({
    correctedRors: affiliation.rorsToCorrect,
    id: affiliation.id,
    rawAffiliationString: affiliation.name,
    rorsInOpenAlex: affiliation.rors,
    worksExample: affiliation.worksExample,
    worksOpenAlex: affiliation.worksOpenAlex,
  }));

export { getAffiliationsCorrections };

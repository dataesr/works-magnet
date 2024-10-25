const getAffiliationsCorrections = (affiliations) => {
  const newCorrections = [];
  affiliations
    .filter((affiliation) => affiliation.hasCorrection)
    .forEach((affiliation) => {
      const correction = {
        rawAffiliationString: affiliation.name,
        rorsInOpenAlex: affiliation.rors,
        correctedRors: affiliation.rorsToCorrect,
        worksExample: affiliation.worksExample,
        worksOpenAlex: affiliation.worksOpenAlex,
      };
      newCorrections.push(correction);
    });
  return newCorrections;
};

export {
  getAffiliationsCorrections,
};

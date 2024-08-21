const getCorrections = (affiliations) => {
  const newCorrections = [];
  affiliations
    .filter((aff) => aff.hasCorrection)
    .forEach((aff) => {
      const correction = {
        rawAffiliationString: aff.name,
        rorsInOpenAlex: aff.rors,
        correctedRors: aff.rorsToCorrect,
        worksExample: aff.worksExample,
        worksOpenAlex: aff.worksOpenAlex,
      };
      newCorrections.push(correction);
    });
  return newCorrections;
};

export {
  getCorrections,
};

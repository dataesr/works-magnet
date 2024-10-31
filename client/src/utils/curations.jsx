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

const getMentionsCorrections = (mentions) => mentions
  .filter((mention) => mention.hasCorrection)
  .map((mention) => ({
    id: mention.id,
    doi: mention.doi,
    type: mention.type,
    previousType: mention.type_original,
  }));

export { getAffiliationsCorrections, getMentionsCorrections };

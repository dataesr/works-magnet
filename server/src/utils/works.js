import { cleanId, getAuthorOrcid, intersectArrays, removeDiacritics } from './utils';

const datasetsType = ['dataset', 'physicalobject', 'collection', 'audiovisual', 'sound',
  'software', 'computationalnotebook', 'film', 'image'];

const getFormat = (formats) => {
  const formatsMapping = {
    'application/zip': 'archive',
    'Arbitrary ZIP archive': 'archive',
    'video/mp4': 'video',
    ZIP: 'archive',
  };
  // Set format as unique
  let uniqueFormats = [...new Set(formats)];
  // Mapping
  uniqueFormats = uniqueFormats.map((format) => formatsMapping?.[format] ?? format);
  return uniqueFormats.toString() ?? '';
};

// TODO should be backend in the bso-datacite index generation
const getPublisher = (publisher) => {
  const publishersMapping = {
    'SAGE Journals': 'SAGE',
  };
  return publishersMapping?.[publisher] ?? publisher;
};

const mergePublications = (publication1, publication2) => {
  // Any publication from FOSM is prioritized among others
  const priorityPublication = [publication1, publication2].some((publi) => publi.datasource === 'fosm')
    ? [publication1, publication2].find((publi) => publi.datasource === 'fosm')
    : publication1;
  return ({
    ...priorityPublication,
    affiliations: [...new Set([...publication1.affiliations || [], ...publication2.affiliations])].filter((aff) => aff.length > 0),
    // Filter allIds by unique values
    allIds: Object.values([...publication1.allIds, ...publication2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    // Filter authors by unique
    authors: [...new Set([...publication1.authors, ...publication2.authors])],
    datasource: [...new Set([...publication1.datasource, ...publication2.datasource])].sort(),
  });
};

const deduplicateWorks = (works) => {
  const deduplicatedWorks = works.reduce((deduplicatedWorksTmp, work) => {
    const { id } = work;
    // eslint-disable-next-line no-param-reassign
    if (deduplicatedWorksTmp[id]) {
      deduplicatedWorksTmp.id = mergePublications(deduplicatedWorksTmp[id], work);
    } else {
      deduplicatedWorksTmp[id] = work;
    }
    // deduplicatedWorksTmp[id] = deduplicatedWorksTmp[id] ? mergePublications(deduplicatedWorksTmp[id], work) : work;
    return deduplicatedWorksTmp;
  }, {});
  return Object.values(deduplicatedWorks);
};

const getFosmQuery = (options, pit, searchAfter) => {
  const query = { size: process.env.FOSM_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
  options.affiliationStrings.forEach((affiliation) => {
    query.query.bool.should.push({ match: { 'affiliations.name': { query: `"${affiliation}"`, operator: 'and' } } });
  });
  if (options.rors?.length > 0) {
    const fullRors = options.rors.map((r) => 'https://ror.org/'.concat(r));
    query.query.bool.should.push({ terms: { 'rors.keyword': options.rors } });
    query.query.bool.should.push({ terms: { 'affiliations.affiliationIdentifier.keyword': fullRors } });
    query.query.bool.should.push({ terms: { 'authors.affiliations.affiliationIdentifier.keyword': fullRors } });
  }
  query.query.bool.must.push({ range: { year: { gte: options.year, lte: options.year } } });
  // Exclude files and duplicates for Datacite
  query.query.bool.must_not.push({ terms: { genre: ['file', 'version', 'file_', 'identical'] } });
  query.query.bool.minimum_should_match = 1;
  query._source = [
    'affiliations', 'authors', 'doi', 'external_ids', 'genre', 'genre_raw', 'hal_id', 'id', 'publisher', 'format', 'client_id',
    'publisher_dissemination', 'publisher_raw', 'title', 'year', 'fr_reasons_concat', 'fr_publications_linked', 'fr_authors_name', 'fr_authors_orcid',
  ];
  query.sort = ['_shard_doc'];
  if (pit) {
    query.pit = { id: pit, keep_alive: process.env.FOSM_PIT_KEEP_ALIVE };
  }
  if (searchAfter) {
    query.search_after = searchAfter;
    query.track_total_hits = false;
  }
  if (options.datasets) {
    query.query.bool.must.push({
      terms: {
        genre_raw: datasetsType,
      },
    });
  }
  return query;
};

const getFosmAffiliation = (affiliation) => {
  const source = 'FOSM';
  let ror = null;
  if (affiliation.affiliationIdentifierScheme?.toLowerCase() === 'ror' && affiliation?.affiliationIdentifier) {
    ror = affiliation.affiliationIdentifier.replace('https://ror.org/', '').replace('ror.org/', '');
  }
  let rawAffiliation = affiliation?.name ?? '';
  if (ror) {
    rawAffiliation += ` RoR: ${ror}`;
  }
  const key = removeDiacritics(rawAffiliation).concat(` [ source: ${source} ]`);
  return { key, label: key, rawAffiliation, ror, source };
};

const getLinkedDoi = (frPublicationsLinked, options) => {
  const relevantPubli = frPublicationsLinked?.filter((el) => intersectArrays(el?.rors || [], options.rors).length > 0) || [];
  const res = [];
  relevantPubli.forEach((p) => {
    res.push({ id_value: p.doi, id_type: 'doi' });
  });
  return res;
};

const getMatchingRoRs = (affiliations, options) => {
  const currentRoRs = affiliations.map((aff) => aff.ror);
  return intersectArrays(currentRoRs, options.rors);
};

const getAffiliationsHtmlField = ({ affiliations, id, regexp }) => {
  let affiliationsAll = affiliations.map((a) => a.rawAffiliation);
  if (regexp) {
    affiliationsAll = affiliationsAll.map((a) => removeDiacritics(a))
      .sort((a, b) => (regexp.exec(b)?.length ?? 0) - (regexp.exec(a)?.length ?? 0))
      .map((affiliation) => {
        let displayAffiliation = affiliation;
        regexp.exec(affiliation)?.slice(1)?.forEach((match) => {
          displayAffiliation = displayAffiliation.replace(match, '<b>$&</b>');
        });
        return displayAffiliation;
      })
      .filter((affiliation) => affiliation?.length ?? 0);
  }
  affiliationsAll = [...new Set(affiliationsAll)];
  let html = `<ul data-tooltip-id="tooltip-affiliation-${id}">`;
  html += affiliationsAll.slice(0, 3).map((affiliation, index) => `<li key="affilition-${index}">${affiliation}</li>`).join('');
  if (affiliationsAll.length > 3) {
    html += `<li>and others (${affiliationsAll.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAffiliationsTooltipField = ({ affiliations, id }) => {
  let html = '<ul>';
  html += (affiliations || []).map((affiliation, index) => `<li key="tooltip-affiliation-${id}-${index}">${affiliation.rawAffiliation}</li>`).join('');
  html += '</ul>';
  return html;
};

const formatFosmResult = (result, options) => {
  const answer = {
    affiliations: result._source.affiliations
      ?.map((affiliation) => getFosmAffiliation(affiliation))
      .filter((affiliation) => !!affiliation?.rawAffiliation),
    allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    authors: (result._source?.authors ?? []).map((author) => author.full_name),
    client_id: result._source.client_id,
    datasource: ['fosm'],
    format: getFormat(result?._source?.format || []),
    fr_reasons: result?._source?.fr_reasons_concat?.toString() ?? '',
    fr_publications_linked: getLinkedDoi(result?._source?.fr_publications_linked, options),
    fr_authors_name: [...new Set(result?._source?.fr_authors_name
      ?.filter((el) => intersectArrays(el?.rors || [], options.rors))
      .map((el) => el.author.name))],
    fr_authors_orcid: [...new Set(result?._source?.fr_authors_orcid
      ?.filter((el) => intersectArrays(el?.rors || [], options.rors))
      .map((el) => getAuthorOrcid(el)))],
    id: cleanId(result._source?.doi ?? result._source?.hal_id ?? result._source.id),
    publisher: getPublisher(result._source?.publisher_dissemination ?? result._source?.publisher ?? result._source?.publisher_raw ?? ''),
    status: 'tobedecided',
    title: result._source.title,
    type: result._source?.genre_raw ?? result._source.genre,
    year: result?._source?.year?.toString() ?? '',
  };
  answer.nbOrcid = answer.fr_authors_orcid.length;
  answer.nbAuthorsName = answer.fr_authors_name.length;
  answer.nbPublicationsLinked = answer.fr_publications_linked.length;
  answer.matchingRoRs = getMatchingRoRs(answer?.affiliations || [], options);
  answer.nbMatchingRoRs = answer.matchingRoRs.length;
  let levelCertainty = '2.medium';
  if (answer.nbMatchingRoRs > 0 || answer.nbPublicationsLinked > 0 || answer.nbOrcid >= 2 || answer.nbAuthorsName >= 3) {
    levelCertainty = '1.high';
  } else if (answer.nbAuthorsName <= 1 && answer.nbOrcid <= 1) {
    levelCertainty = '3.low';
  }
  answer.levelCertainty = levelCertainty;
  answer.affiliationsHtml = getAffiliationsHtmlField({ affiliations: answer?.affiliations ?? [], id: answer.id });
  answer.affiliationsTooltip = getAffiliationsTooltipField(answer);
  answer.allInfos = JSON.stringify(answer);
  return answer;
};

const getFosmWorksByYear = async ({ remainingTries = 3, results = [], options, pit, searchAfter }) => {
  if (!pit) {
    const response = await fetch(
      `${process.env.FOSM_URL}/${process.env.FOSM_INDEX}/_pit?keep_alive=${process.env.FOSM_PIT_KEEP_ALIVE}`,
      { method: 'POST', headers: { Authorization: process.env.FOSM_AUTH } },
    );
    // eslint-disable-next-line no-param-reassign
    pit = (await response.json()).id;
  }
  const body = getFosmQuery(options, pit, searchAfter);
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      Authorization: process.env.FOSM_AUTH,
    },
  };
  const url = `${process.env.FOSM_URL}/_search`;
  return fetch(url, params)
    .then((response) => {
      if (response.ok) return response.json();
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return [];
    })
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      results = results.concat(hits.map((result) => formatFosmResult(result, options))).filter((r) => r.levelCertainty !== '3.low');
      if (hits.length > 0 && (Number(process.env.FOSM_MAX_SIZE) === 0 || results.length < Number(process.env.FOSM_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getFosmWorksByYear({ results, options, pit, searchAfter });
      }
      if (pit) {
        fetch(
          `${process.env.FOSM_URL}/_pit`,
          {
            body: JSON.stringify({ id: pit }),
            headers: { Authorization: process.env.FOSM_AUTH, 'Content-type': 'application/json' },
            method: 'DELETE',
          },
        );
      }
      return results;
    })
    .catch((error) => {
      if (remainingTries > 0) {
        return new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 1000)))
          .then(() => getFosmWorksByYear({ remainingTries: remainingTries - 1, results, options, pit, searchAfter }));
      }
      console.error(`Error while fetching ${url} :`);
      console.error(error);
      return [];
    });
};

const getFosmWorks = async ({ options }) => {
  const promises = options.years.map((year) => getFosmWorksByYear({ options: { ...options, year } }));
  const results = await Promise.all(promises);
  return results.flat();
};

const getTypeFromOpenAlex = (type) => {
  let newType = type;
  // eslint-disable-next-line default-case
  switch (type) {
    case 'component':
    case 'dissertation':
    case 'editorial':
    case 'erratum':
    case 'grant':
    case 'journal':
    case 'journal-issue':
    case 'journal-volume':
    case 'letter':
    case 'paratext':
    case 'peer-review':
    case 'reference-entry':
    case 'report':
    case 'report-series':
    case 'standard':
      newType = 'other';
      break;
    case 'book-series':
    case 'book-set':
    case 'monograph':
    case 'reference-book':
      newType = 'book';
      break;
    case 'proceedings-article':
    case 'proceedings-series':
      newType = 'proceedings';
      break;
    case 'article':
      newType = 'journal-article';
      break;
    case 'book-part':
      newType = 'book-chapter';
      break;
    case 'posted-content':
      newType = 'preprint';
      break;
    default:
      newType = type;
  }
  return newType;
};

const getOpenAlexAffiliation = (author) => {
  const source = 'OpenAlex';
  const rawAffiliation = author.raw_affiliation_strings.join('; ');
  let key = removeDiacritics(rawAffiliation).concat(' [ source: ').concat(source).concat(' ]');
  const label = removeDiacritics(rawAffiliation).concat(' [ source: ').concat(source).concat(' ]');
  const rors = [];
  const rorsToCorrect = [];
  author?.institutions?.forEach((institution) => {
    if (institution.ror) {
      const rorId = (institution.ror).replace('https://ror.org/', '').replace('ror.org/', '');
      const rorElt = { rorCountry: institution.country_code, rorId, rorName: institution.display_name };
      key = `${key}##${rorId}`;
      rors.push(rorElt);
      rorsToCorrect.push(rorId);
    }
  });
  return { key, label, rawAffiliation, rors, rorsToCorrect, source };
};

const getOpenAlexPublicationsByYear = (options, cursor = '*', previousResponse = [], remainingTries = 3) => {
  let url = `https://api.openalex.org/works?per_page=${process.env.OPENALEX_PER_PAGE}`;
  url += '&filter=is_paratext:false';
  url += `,publication_year:${Number(options.year)}-${Number(options?.year)}`;
  if (options.affiliationStrings.length) {
    url += `,raw_affiliation_strings.search:(${options.affiliationStrings.map((aff) => `"${encodeURIComponent(aff)}"`).join(' OR ')})`;
  }
  if (options.rors.length) {
    url += `,institutions.ror:${options.rors.join('|')}`;
  }
  if (options.datasets) {
    url += ',type:dataset';
  }
  if (options.openAlexExclusions.length) {
    url += `,${options.openAlexExclusions.map((institutionId) => `authorships.institutions.lineage:!${institutionId}`).join()}`;
  }
  // Polite mode https://docs.openalex.org/how-to-use-the-api/rate-limits-and-authentication#the-polite-pool
  if (process?.env?.OPENALEX_KEY) {
    url += `&api_key=${process.env.OPENALEX_KEY}`;
  } else {
    url += '&mailto=bso@recherche.gouv.fr';
  }
  url += '&select=authorships,display_name,doi,id,ids,primary_location,publication_year,type';
  return fetch(`${url}&cursor=${cursor}`)
    .then((response) => {
      if (response.ok) return response.json();
      if (response.status === 429) {
        return new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 1000))).then(() => getOpenAlexPublicationsByYear(options, cursor, previousResponse));
      }
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return [];
    })
    .then((response) => {
      const hits = response?.results ?? [];
      const results = previousResponse.concat(hits.map((result) => {
        const answer = {
          affiliations: result?.authorships
            ?.map((author) => getOpenAlexAffiliation(author))
            .flat()
            .filter((affiliation) => !!affiliation.rawAffiliation),
          allIds: Object.keys(result.ids).map((key) => ({ id_type: key, id_value: cleanId(result.ids[key]) })),
          authors: result?.authorships?.map((author) => author.author.display_name),
          datasource: ['openalex'],
          doi: cleanId(result?.doi),
          id: cleanId(result?.ids?.doi
            ?? result?.primary_location?.landing_page_url?.split('/')?.filter((item) => item)?.pop() ?? result?.ids?.openalex),
          publisher: getPublisher(result?.primary_location?.source?.host_organization_name ?? result?.primary_location?.source?.display_name ?? ''),
          status: 'tobedecided',
          title: result?.display_name,
          type: getTypeFromOpenAlex(result.type),
          year: result?.publication_year?.toString() ?? '',
        };
        answer.affiliationsHtml = getAffiliationsHtmlField({ affiliations: answer?.affiliations ?? [], id: answer.id });
        answer.affiliationsTooltip = getAffiliationsTooltipField(answer);
        answer.allInfos = JSON.stringify(answer);
        return answer;
      }));
      const nextCursor = response?.meta?.next_cursor;
      if (nextCursor && hits.length > 0 && (Number(process.env.OPENALEX_MAX_SIZE) === 0 || results.length < Number(process.env.OPENALEX_MAX_SIZE))) {
        return getOpenAlexPublicationsByYear(options, nextCursor, results);
      }
      return results;
    })
    .catch((error) => {
      if (remainingTries > 0) {
        return new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 1000)))
          .then(() => getOpenAlexPublicationsByYear(options, cursor, previousResponse, remainingTries - 1));
      }
      console.error(`Error while fetching ${url} :`);
      console.error(error);
      return [];
    });
};

const getOpenAlexPublications = async ({ options }) => {
  const promises = options.years.map((year) => getOpenAlexPublicationsByYear({ ...options, year }));
  const results = await Promise.all(promises);
  return results.flat();
};

const groupByAffiliations = ({ options, works }) => {
  const pattern = options.affiliationStrings
    // Replace all accentuated characters, multiple spaces and toLowercase()
    .map((affiliation) => removeDiacritics(affiliation)
      // Set universite, university and univ as synonyms
      .replaceAll(/universite|university|univ/gi, 'universite|university|univ')
      .split(' ')
      // Each word should be map at least one time, whatever the order
      .map((item) => `(?=.*?\\b(${item})\\b)`)
      .join(''))
    .join('|');
  const regexp = new RegExp(pattern, 'gi');
  const queryRors = options.rors || [];
  const toKeep = {};
  let nbWorksTreated = 0;
  const nbWorksTotal = works.length;
  // Compute distinct affiliations of works
  let allAffiliationsTmp = works.reduce((deduplicatedAffiliations, work) => {
    const { affiliations = [], id } = work;
    nbWorksTreated += 1;
    if (nbWorksTreated % 5000 === 0) {
      console.log('groupby affiliation', `${nbWorksTreated} / ${nbWorksTotal}`);
    }
    const { length } = affiliations;
    for (let i = 0; i < length; i += 1) {
      const affiliation = affiliations[i];
      const normalizedAffiliation = affiliation.key;
      if (toKeep[normalizedAffiliation] === undefined) {
        let displayAffiliation = affiliation.label;
        const matches = regexp.exec(displayAffiliation);
        // Set each matched word in bold
        matches?.slice(1)?.forEach((match) => {
          displayAffiliation = displayAffiliation.replace(match, '<b>$&</b>');
        });
        let keepAffiliation = displayAffiliation.includes('</b>');
        const rorsInAffiliation = affiliation.rors?.map((a) => a.rorId) || [];
        rorsInAffiliation.forEach((r) => {
          if (queryRors.includes(r)) {
            keepAffiliation = true;
          }
        });
        toKeep[normalizedAffiliation] = { displayAffiliation, keepAffiliation };
      }
      if (toKeep[normalizedAffiliation]?.keepAffiliation) {
        if (deduplicatedAffiliations?.[normalizedAffiliation]) {
          deduplicatedAffiliations[normalizedAffiliation].works.push(id);
          if (deduplicatedAffiliations[normalizedAffiliation].worksExample.length < 999) {
            deduplicatedAffiliations[normalizedAffiliation].worksExample.push(work.allIds);
          }
        } else {
          // eslint-disable-next-line no-param-reassign
          deduplicatedAffiliations[normalizedAffiliation] = {
            hasCorrection: false,
            key: affiliation.key,
            name: affiliation.rawAffiliation,
            nameHtml: toKeep[normalizedAffiliation].displayAffiliation,
            rors: affiliation.rors || [],
            rorsNumber: affiliation.rors?.length || 0,
            rorsToCorrect: (affiliation.rorsToCorrect || []).join(';'),
            source: affiliation.source,
            status: 'tobedecided',
            works: [id],
            worksExample: [work.allIds],
          };
        }
      }
    }
    return deduplicatedAffiliations;
  }, {});

  allAffiliationsTmp = Object.values(allAffiliationsTmp)
    .map((affiliation, index) => {
      const uniqueWorks = [...new Set(affiliation.works)];
      const uniqueWorksExample = [...new Set(affiliation.worksExample.flat())];
      return ({
        ...affiliation,
        id: index.toString(),
        works: uniqueWorks,
        worksExample: uniqueWorksExample.slice(0, 10),
        worksNumber: uniqueWorks.length,
        worksOpenAlex: uniqueWorksExample.filter((w) => w.id_type === 'openalex').map((w) => w.id_value || 0).filter((w) => w !== 0),
      });
    });
  return allAffiliationsTmp;
};

export {
  datasetsType,
  deduplicateWorks,
  getFosmWorks,
  getOpenAlexPublications,
  groupByAffiliations,
};
